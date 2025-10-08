import os
import io
import cv2
import base64
import threading
import numpy as np
import pandas as pd
from collections import deque
from flask import Flask, request, jsonify, send_file, Response, make_response
from flask_cors import CORS
from ultralytics import YOLO
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure

app = Flask(__name__)
CORS(app)

# -----------------------------
# Configuration
# -----------------------------
MODEL_PATH = "yolo11n.pt"
ANALYTICS_MAXLEN = 2000         # keep last N frames of analytics in memory
CSV_AUTOSAVE_EVERY = 50        # auto-save CSV every N frames in live stream

# -----------------------------
# Load model
# -----------------------------
model = YOLO(MODEL_PATH)
# model.names is a dict mapping class indices to names (ultralytics)
CLASS_NAMES = getattr(model, "names", {})

# -----------------------------
# Thread-safe analytics storage
# -----------------------------
analytics_lock = threading.Lock()
analytics_data = deque(maxlen=ANALYTICS_MAXLEN)
# example entry:
# {
#   "frame": 1,
#   "total_detections": 5,
#   "per_class": {"person": 3, "car": 2}
# }

# -----------------------------
# Helper Functions
# -----------------------------
def detect_objects(frame):
    """
    Run YOLO detection on a single frame.
    Returns:
      annotated_frame: frame with boxes/labels drawn (from results.plot())
      total_detections: integer count of boxes
      per_class_counts: dict mapping class name -> count for this frame
    """
    results = model(frame)[0]  # run model on frame, take first result
    annotated_frame = results.plot()  # uses ultralytics built-in plotting

    # extract class indices from results.boxes.cls if available
    per_class_counts = {}
    total_detections = 0
    try:
        # results.boxes.cls is a tensor of class indices (float) in many ultralytics versions
        cls_tensor = getattr(results.boxes, "cls", None)
        if cls_tensor is not None:
            cls_arr = cls_tensor.cpu().numpy().astype(int)
            total_detections = int(len(cls_arr))
            for c in cls_arr:
                name = CLASS_NAMES.get(c, str(c))
                per_class_counts[name] = per_class_counts.get(name, 0) + 1
        else:
            # fallback: count boxes length
            total_detections = int(len(results.boxes))
    except Exception:
        # best-effort fallback
        total_detections = int(len(results.boxes))

    return annotated_frame, total_detections, per_class_counts

def save_analytics_csv(path="analytics.csv"):
    """Save current analytics_data deque to CSV file"""
    with analytics_lock:
        if not analytics_data:
            return None
        df = pd.DataFrame(list(analytics_data))
        # Expand per_class to separate JSON/text column if needed
        df["per_class"] = df["per_class"].apply(lambda x: x if isinstance(x, dict) else {})
        df.to_csv(path, index=False)
    return path

def generate_pdf_from_graph(path="analytics.pdf"):
    """Generate a PDF containing the line chart of total detections"""
    with analytics_lock:
        if not analytics_data:
            return None
        frames = [d["frame"] for d in analytics_data]
        totals = [d["total_detections"] for d in analytics_data]

    fig = Figure(figsize=(10, 6))
    ax = fig.add_subplot(1, 1, 1)
    ax.plot(frames, totals, label="Total Detections")
    ax.set_xlabel("Frame")
    ax.set_ylabel("Total Detections")
    ax.set_title("Live Detection Analytics")
    ax.legend()

    canvas = FigureCanvas(fig)
    canvas.print_pdf(path)
    return path

def generate_chart_image_bytes(last_n=50):
    """Generate a PNG image (bar + pie) representing the last_n analytics points"""
    with analytics_lock:
        if not analytics_data:
            # return an empty image
            fig = Figure(figsize=(8, 4))
            canvas = FigureCanvas(fig)
            buf = io.BytesIO()
            canvas.print_png(buf)
            buf.seek(0)
            return buf

        # build aggregated per-class counts over last_n frames
        last = list(analytics_data)[-last_n:]
        agg = {}
        for entry in last:
            per_class = entry.get("per_class", {})
            for k, v in per_class.items():
                agg[k] = agg.get(k, 0) + v

    # create combined figure: left bar chart, right pie chart
    fig = Figure(figsize=(12, 5))
    ax_bar = fig.add_subplot(1, 2, 1)
    ax_pie = fig.add_subplot(1, 2, 2)

    classes = list(agg.keys())
    counts = [agg[k] for k in classes]

    if classes:
        ax_bar.bar(classes, counts)
        ax_bar.set_xticklabels(classes, rotation=45, ha="right")
        ax_bar.set_title(f"Count per Class (last {last_n} frames)")
        ax_bar.set_ylabel("Aggregated Count")

        ax_pie.pie(counts, labels=classes, autopct="%1.1f%%", startangle=90)
        ax_pie.set_title("Distribution")
    else:
        # empty placeholders
        ax_bar.text(0.5, 0.5, "No detections yet", ha="center", va="center")
        ax_pie.text(0.5, 0.5, "No data", ha="center", va="center")

    fig.tight_layout()
    buf = io.BytesIO()
    canvas = FigureCanvas(fig)
    canvas.print_png(buf)
    buf.seek(0)
    return buf

# -----------------------------
# ROUTES
# -----------------------------
@app.route("/detect", methods=["POST"])
def detect_image():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    npimg = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    if img is None:
        return jsonify({"error": "Invalid image"}), 400

    annotated_frame, total_detections, per_class = detect_objects(img)

    # store analytics
    with analytics_lock:
        analytics_data.append({
            "frame": len(analytics_data) + 1,
            "total_detections": total_detections,
            "per_class": per_class
        })

    _, buffer = cv2.imencode(".jpg", annotated_frame)
    img_base64 = base64.b64encode(buffer).decode("utf-8")

    return jsonify({
        "image": img_base64,
        "total_detections": total_detections,
        "per_class": per_class
    })

@app.route("/live")
def live_feed():
    cap = cv2.VideoCapture(0)

    def generate():
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            annotated_frame, total_detections, per_class = detect_objects(frame)

            with analytics_lock:
                analytics_data.append({
                    "frame": len(analytics_data) + 1,
                    "total_detections": total_detections,
                    "per_class": per_class
                })
                length = len(analytics_data)

            # Auto-save CSV periodically
            if length % CSV_AUTOSAVE_EVERY == 0:
                try:
                    save_analytics_csv("analytics.csv")
                except Exception:
                    pass

            _, buffer = cv2.imencode(".jpg", annotated_frame)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

        cap.release()

    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/live_analytics")
def live_analytics():
    """Return last N analytics points for client-side real-time graphs (JSON)."""
    n = int(request.args.get("n", 50))
    with analytics_lock:
        data = list(analytics_data)[-n:]
    return jsonify(data)

@app.route("/summary")
def analytics_summary():
    """Return a quick summary: total detections so far, unique classes, top-K classes."""
    top_k = int(request.args.get("k", 5))
    with analytics_lock:
        total_frames = len(analytics_data)
        total_detections = sum([d.get("total_detections", 0) for d in analytics_data])
        agg = {}
        for d in analytics_data:
            for k, v in d.get("per_class", {}).items():
                agg[k] = agg.get(k, 0) + v

    # top classes
    top = sorted(agg.items(), key=lambda x: x[1], reverse=True)[:top_k]
    return jsonify({
        "total_frames": total_frames,
        "total_detections": total_detections,
        "unique_classes": len(agg),
        "top_classes": top
    })

@app.route("/chart.png")
def chart_png():
    """Return a PNG image containing aggregated bar+pie charts for last n frames."""
    n = int(request.args.get("n", 50))
    buf = generate_chart_image_bytes(last_n=n)
    return send_file(buf, mimetype="image/png", as_attachment=False, download_name="analytics.png")

@app.route("/export/csv")
def export_csv():
    path = save_analytics_csv("analytics.csv")
    if not path:
        return jsonify({"error": "No analytics yet"}), 400
    return send_file(path, as_attachment=True)

@app.route("/export/json")
def export_json():
    """Export analytics_data as JSON file."""
    with analytics_lock:
        if not analytics_data:
            return jsonify({"error": "No analytics yet"}), 400
        json_bytes = pd.DataFrame(list(analytics_data)).to_json(orient="records").encode("utf-8")
    return send_file(io.BytesIO(json_bytes), mimetype="application/json", as_attachment=True, download_name="analytics.json")

@app.route("/export/pdf")
def export_pdf():
    path = generate_pdf_from_graph("analytics.pdf")
    if not path:
        return jsonify({"error": "No analytics yet"}), 400
    return send_file(path, as_attachment=True)

@app.route("/sankey_data")
def sankey_data():
    """Optional route for Sankey or flow visualizations (frame-to-frame transitions)."""
    transitions = []
    with analytics_lock:
        for i in range(1, len(analytics_data)):
            prev = analytics_data[i-1]
            curr = analytics_data[i]
            transitions.append({
                "from": f"Frame_{prev['frame']}",
                "to": f"Frame_{curr['frame']}",
                "value": curr.get("total_detections", 0)
            })
    return jsonify(transitions)

# -----------------------------
# Run App
# -----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    # debug True is fine for development; set to False in production
    app.run(host="0.0.0.0", port=port, debug=True)
