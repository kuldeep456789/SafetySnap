import os
import cv2
import io
import time
import json
import torch
import base64
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, send_file, Response
from ultralytics import YOLO
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure
app = Flask(__name__)
# -----------------------------
# YOLOv11 PPE Detection Model
# -----------------------------
model = YOLO("yolo11n.pt")  # Replace with your PPE model path

# -----------------------------
# Analytics Storage
# -----------------------------
analytics_data = []  # frame-wise PPE counts
# -----------------------------
# Helper Functions
# -----------------------------
def detect_ppe(frame):
    """Return annotated frame, helmet/vest counts using YOLOv11."""
    results = model(frame)[0]  # YOLOv11 inference
    helmet_count = 0
    vest_count = 0
    for cls in results.boxes.cls:
        label = model.names[int(cls)]
        if "helmet" in label.lower(): 
            helmet_count += 1
        if "vest" in label.lower(): 
            vest_count += 1
    annotated_frame = results.plot()
    return annotated_frame, helmet_count, vest_count

def generate_csv():
    df = pd.DataFrame(analytics_data)
    csv_file = "analytics.csv"
    df.to_csv(csv_file, index=False)
    return csv_file

def generate_pdf():
    fig = Figure(figsize=(8,6))
    ax = fig.add_subplot(1,1,1)
    frames = [d["frame"] for d in analytics_data]
    ax.plot(frames, [d["helmet_count"] for d in analytics_data], label="Helmet", color="green")
    ax.plot(frames, [d["vest_count"] for d in analytics_data], label="Vest", color="blue")
    ax.set_xlabel("Frame")
    ax.set_ylabel("Count")
    ax.legend()
    canvas = FigureCanvas(fig)
    pdf_file = "analytics.pdf"
    canvas.print_pdf(pdf_file)
    return pdf_file

# -----------------------------
# Routes
# -----------------------------
@app.route("/detect", methods=["POST"])
def detect_image():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400
        file = request.files["file"]
        npimg = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({"error": "Invalid image"}), 400

        annotated_frame, helmet_count, vest_count = detect_ppe(img)
        analytics_data.append({
            "frame": len(analytics_data)+1, 
            "helmet_count": helmet_count, 
            "vest_count": vest_count
        })
        _, buffer = cv2.imencode(".jpg", annotated_frame)
        img_base64 = base64.b64encode(buffer).decode("utf-8")
        return jsonify({
            "image": img_base64,
            "helmet_count": helmet_count,
            "vest_count": vest_count
        })
    except Exception as e:
        print("Error in /detect:", e)
        return jsonify({"error": "Detection failed"}), 500

@app.route("/live")
def live_feed():
    cap = cv2.VideoCapture(0)
    def generate():
        while True:
            ret, frame = cap.read()
            if not ret: break
            annotated_frame, helmet_count, vest_count = detect_ppe(frame)
            analytics_data.append({
                "frame": len(analytics_data)+1, 
                "helmet_count": helmet_count, 
                "vest_count": vest_count
            })
            _, buffer = cv2.imencode(".jpg", annotated_frame)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/live_analytics")
def live_analytics():
    return jsonify(analytics_data[-50:])

@app.route("/sankey_data")
def sankey_data():
    transitions = []
    for i in range(1, len(analytics_data)):
        curr = analytics_data[i]
        transitions.append({
            "from":"Compliant",
            "to":"Violation",
            "value": curr["helmet_count"] + curr["vest_count"]
        })
    return jsonify(transitions)

@app.route("/export/csv")
def export_csv():
    csv_file = generate_csv()
    return send_file(csv_file, mimetype="text/csv", as_attachment=True)

@app.route("/export/pdf")
def export_pdf():
    pdf_file = generate_pdf()
    return send_file(pdf_file, mimetype="application/pdf", as_attachment=True)

# -----------------------------
# Run Flask App
# -----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
