import React, { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Upload as UploadIcon } from "lucide-react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import axios from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface AnalyticsPoint {
  frame: number;
  total_detections: number;
}

const BACKEND_URL = "http://127.0.0.1:5000";

const Upload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [liveMode, setLiveMode] = useState<boolean>(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsPoint[]>([]);

  // File input
  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles([...files, ...Array.from(e.target.files)]);
  };

  const handleDetect = async () => {
    if (files.length === 0) return toast.error("Upload at least one file");
    setLoading(true);
    const results: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      try {
        const res = await axios.post(`${BACKEND_URL}/detect`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        results.push("data:image/jpeg;base64," + res.data.image);
      } catch (err) {
        console.error(err);
        toast.error("Detection failed");
      }
    }

    setResultImages(results);
    setLoading(false);
    toast.success("Detection completed!");
  };

  const toggleLiveMode = () => {
    setLiveMode(!liveMode);
    if (!liveMode) toast.info("Starting live detection...");
  };

  // Fetch live analytics every 2s
  useEffect(() => {
    if (!liveMode) return;
    const interval = setInterval(() => {
      axios
        .get<AnalyticsPoint[]>(`${BACKEND_URL}/live_analytics`)
        .then((res) => setAnalyticsData(res.data))
        .catch((err) => console.error("Error fetching analytics:", err));
    }, 2000);
    return () => clearInterval(interval);
  }, [liveMode]);

  const chartData = {
    labels: analyticsData.map((d) => d.frame),
    datasets: [
      {
        label: "Total Detections (Real-Time)",
        data: analyticsData.map((d) => d.total_detections),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Navbar */}
      <nav className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50 mb-8">
        <div className="container mx-auto flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">SafetySnap</h1>
          </Link>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setLiveMode(false)}>
              Upload
            </Button>
            <Button variant="ghost" onClick={() => setLiveMode(true)}>
              Live
            </Button>
          </div>
        </div>
      </nav>

      {/* Upload Section */}
      {!liveMode && (
        <>
          <div className="border-2 border-dashed rounded-lg p-6 mb-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="fileUpload"
            />
            <label
              htmlFor="fileUpload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <UploadIcon className="h-12 w-12 text-blue-600 animate-bounce" />
              <span className="font-semibold">Click to upload or drag & drop</span>
            </label>
          </div>

          <Button onClick={handleDetect} disabled={loading || files.length === 0}>
            {loading ? "Detecting..." : "Detect Uploaded"}
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {resultImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Detection result"
                className="rounded-xl shadow-lg"
              />
            ))}
          </div>
        </>
      )}

      {/* Live Mode */}
      {liveMode && (
        <div className="flex flex-col items-center mt-6">
          <img
            src={`${BACKEND_URL}/live`}
            alt="Live Stream"
            className="rounded-lg shadow-lg max-w-3xl border"
          />

          <div className="mt-8 w-full max-w-3xl bg-card rounded-lg shadow p-4">
            <Line data={chartData} />
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={toggleLiveMode}
            >
              Stop Live
            </Button>

            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <a href={`${BACKEND_URL}/export/csv`} download>
                Download CSV Report
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
