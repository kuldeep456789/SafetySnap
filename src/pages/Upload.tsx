import React, { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, Pie } from "react-chartjs-2";
import "chart.js/auto";
import axios from "axios";
import { toast } from "sonner";
import { Shield, Upload as UploadIcon, Activity, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface AnalyticsPoint {
  frame: number;
  total_detections: number;
  per_class?: Record<string, number>;
}

interface SummaryData {
  total_frames: number;
  total_detections: number;
  unique_classes: number;
  top_classes: [string, number][];
}

const BACKEND_URL = "http://127.0.0.1:5000";

const Upload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsPoint[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [chartImg, setChartImg] = useState<string>("");

  // File input handler
  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles([...files, ...Array.from(e.target.files)]);
  };

  // Upload and detect
  const handleDetect = async () => {
    if (files.length === 0) return toast.error("Upload at least one file!");
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
        toast.error("Detection failed for one or more files");
        console.error(err);
      }
    }

    setResultImages(results);
    setLoading(false);
    toast.success("Detection complete!");
  };

  // Toggle live detection mode
  const toggleLiveMode = () => {
    if (!liveMode) toast.info("Starting live detection...");
    setLiveMode(!liveMode);
  };

  // Fetch analytics every 2s
  useEffect(() => {
    if (!liveMode) return;
    const interval = setInterval(() => {
      axios
        .get<AnalyticsPoint[]>(`${BACKEND_URL}/live_analytics`)
        .then((res) => setAnalyticsData(res.data))
        .catch((err) => console.error(err));

      axios
        .get<SummaryData>(`${BACKEND_URL}/summary`)
        .then((res) => setSummary(res.data))
        .catch(() => {});
      setChartImg(`${BACKEND_URL}/chart.png?n=50&t=${Date.now()}`);
    }, 2000);
    return () => clearInterval(interval);
  }, [liveMode]);

  // Chart.js dataset
  const lineData = {
    labels: analyticsData.map((d) => d.frame),
    datasets: [
      {
        label: "Total Detections (Live)",
        data: analyticsData.map((d) => d.total_detections),
        borderColor: "rgb(37, 99, 235)",
        backgroundColor: "rgba(37, 99, 235, 0.3)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Dynamic pie data (aggregate last analytics)
  const lastFrame = analyticsData[analyticsData.length - 1];
  const pieData = {
    labels: lastFrame?.per_class ? Object.keys(lastFrame.per_class) : [],
    datasets: [
      {
        data: lastFrame?.per_class
          ? Object.values(lastFrame.per_class)
          : [],
        backgroundColor: [
          "#4F46E5",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#3B82F6",
          "#8B5CF6",
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 p-6">
      {/* Navbar */}
      <nav className="border-b bg-white/60 backdrop-blur-md sticky top-0 z-50 shadow-sm mb-8">
        <div className="container mx-auto flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-indigo-600">
              SmartVision AI
            </h1>
          </Link>
          <div className="flex gap-3">
            <Button
              variant={!liveMode ? "default" : "outline"}
              onClick={() => setLiveMode(false)}
            >
              Upload Mode
            </Button>
            <Button
              variant={liveMode ? "default" : "outline"}
              onClick={() => setLiveMode(true)}
            >
              Live Mode
            </Button>
          </div>
        </div>
      </nav>

      {/* Upload Mode */}
      {!liveMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border-dashed border-2 p-8 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              id="fileUpload"
              onChange={handleFileInput}
              className="hidden"
            />
            <label
              htmlFor="fileUpload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <UploadIcon className="h-14 w-14 text-indigo-500 animate-bounce" />
              <span className="font-semibold text-gray-600">
                Click or drag files to upload
              </span>
            </label>
          </Card>

          <div className="flex justify-center mt-6">
            <Button
              onClick={handleDetect}
              disabled={loading || files.length === 0}
              className="px-8 py-5 text-lg font-semibold"
            >
              {loading ? "Processing..." : "Start Detection"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {resultImages.map((img, i) => (
              <motion.img
                key={i}
                src={img}
                alt="Detected object"
                className="rounded-xl shadow-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Live Mode */}
      {liveMode && (
        <div className="flex flex-col items-center space-y-8">
          <motion.img
            src={`${BACKEND_URL}/live`}
            alt="Live Stream"
            className="rounded-xl shadow-lg border max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Live analytics */}
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" /> Live
                  Detection Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Line data={lineData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" /> Object
                  Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Pie data={pieData} />
              </CardContent>
            </Card>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-4">
              <Card className="bg-indigo-50">
                <CardContent className="p-6 text-center">
                  <h2 className="text-3xl font-bold text-indigo-700">
                    {summary.total_detections}
                  </h2>
                  <p className="text-gray-600 font-medium">Total Detections</p>
                </CardContent>
              </Card>

              <Card className="bg-green-50">
                <CardContent className="p-6 text-center">
                  <h2 className="text-3xl font-bold text-green-700">
                    {summary.unique_classes}
                  </h2>
                  <p className="text-gray-600 font-medium">Unique Classes</p>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50">
                <CardContent className="p-6 text-center">
                  <h2 className="text-xl font-semibold text-yellow-700">
                    Top:{" "}
                    {summary.top_classes
                      .map(([cls]) => cls)
                      .slice(0, 2)
                      .join(", ") || "N/A"}
                  </h2>
                  <p className="text-gray-600 font-medium">Top Classes</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Server-generated chart */}
          {chartImg && (
            <motion.img
              src={chartImg}
              alt="Server Analytics Chart"
              className="rounded-lg border shadow max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}

          <div className="flex gap-4 mt-6">
            <Button
              variant="destructive"
              onClick={toggleLiveMode}
              className="px-6 py-4"
            >
              Stop Live
            </Button>

            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4">
              <a href={`${BACKEND_URL}/export/csv`} download>
                Download CSV
              </a>
            </Button>

            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4">
              <a href={`${BACKEND_URL}/export/pdf`} download>
                Download PDF
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
