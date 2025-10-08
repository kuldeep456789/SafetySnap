import os
import cv2
import base64
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
from ultralytics import YOLO
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure

app = Flask(__name__)
CORS(app)

# -----------------------------
# YOLO Model
# -----------------------------
MODEL_PATH = "yolo11n.pt"
model = YOLO(MODEL_PATH)

# -----------------------------
# Analytics Storage
# -----------------------------
analytics_data = []  # Stores detection count per frame

# -----------------------------
# Helper Functions
# -----------------------------
def detect_objects(frame):
    """Perform YOLO detection on a frame"""
    results = model(frame)[0]
    annotated_frame = results.plot()
    total_detections = len(results.boxes)
    return annotated_frame, total_detections

def generate_csv():
    """Save analytics data as CSV"""
    if not analytics_data:
        return None
    df = pd.DataFrame(analytics_data)
    csv_file = "analytics.csv"
    df.to_csv(csv_file, index=False)
    return csv_file

def generate_pdf():
    """Generate PDF graph of total detections"""
    if not analytics_data:
        return None

    fig = Figure(figsize=(10,6))
    ax = fig.add_subplot(1,1,1)
    frames = [d["frame"] for d in analytics_data]
    totals = [d["total_detections"] for d in analytics_data]

    ax.plot(frames, totals, label="Total Detections", color="orange")
    ax.set_xlabel("Frame")
    ax.set_ylabel("Total Detections")
    ax.set_title("Live Detection Analytics")
    ax.legend()

    canvas = FigureCanvas(fig)
    pdf_file = "analytics.pdf"
    canvas.print_pdf(pdf_file)
    return pdf_file

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

    annotated_frame, total_detections = detect_objects(img)
    analytics_data.append({
        "frame": len(analytics_data) + 1,
        "total_detections": total_detections
    })

    _, buffer = cv2.imencode(".jpg", annotated_frame)
    img_base64 = base64.b64encode(buffer).decode("utf-8")

    return jsonify({
        "image": img_base64,
        "total_detections": total_detections
    })

@app.route("/live")
def live_feed():
    cap = cv2.VideoCapture(0)

    def generate():
        while True:
            ret, frame = cap.read()
            if not ret: break

            annotated_frame, total_detections = detect_objects(frame)
            analytics_data.append({
                "frame": len(analytics_data)+1,
                "total_detections": total_detections
            })

            # Auto-save CSV every 50 frames
            if len(analytics_data) % 50 == 0:
                pd.DataFrame(analytics_data).to_csv("analytics.csv", index=False)

            _, buffer = cv2.imencode(".jpg", annotated_frame)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/live_analytics")
def live_analytics():
    """Return last 50 points for real-time graph"""
    return jsonify(analytics_data[-50:])

@app.route("/export/csv")
def export_csv():
    csv_file = generate_csv()
    if not csv_file:
        return jsonify({"error": "No analytics yet"}), 400
    return send_file(csv_file, as_attachment=True)

@app.route("/export/pdf")
def export_pdf():
    pdf_file = generate_pdf()
    if not pdf_file:
        return jsonify({"error": "No analytics yet"}), 400
    return send_file(pdf_file, as_attachment=True)

@app.route("/sankey_data")
def sankey_data():
    """Optional route for Sankey or other analytics"""
    transitions = []
    for i in range(1, len(analytics_data)):
        curr = analytics_data[i]
        transitions.append({
            "from": "Frame_"+str(curr["frame"]-1),
            "to": "Frame_"+str(curr["frame"]),
            "value": curr["total_detections"]
        })
    return jsonify(transitions)

# -----------------------------
# Run App
# -----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)


## hi there