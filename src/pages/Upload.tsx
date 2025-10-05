import { useState, useEffect } from "react";
import { Upload as UploadIcon, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [resultImages, setResultImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liveMode, setLiveMode] = useState(false);
  const [detectionCounts, setDetectionCounts] = useState([]);

  const handleFileInput = (e) => {
    if (e.target.files) setFiles([...files, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

  const handleDetect = async () => {
    if (files.length === 0) return toast.error("Upload at least one file");
    setLoading(true);
    setProgress(0);
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await axios.post("http://127.0.0.1:5000/detect", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(Math.round((percent + i * 100) / files.length));
          },
        });
        const base64Image = "data:image/jpeg;base64," + res.data.image;
        results.push(base64Image);
      } catch (err) {
        console.error(err);
        toast.error("Detection failed");
      }
    }
    setResultImages(results);
    setLoading(false);
    toast.success("Detection completed!");
  };

  const toggleLiveMode = () => setLiveMode((prev) => !prev);

  useEffect(() => {
    if (!liveMode) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/live_analytics");
        setDetectionCounts(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [liveMode]);

  const lineGraphData = {
    labels: detectionCounts.map((d) => d.frame),
    datasets: [
      {
        label: "Helmet Count",
        data: detectionCounts.map((d) => d.helmet_count),
        borderColor: "rgb(34,197,94)",
        tension: 0.3,
        fill: true,
        backgroundColor: "rgba(34,197,94,0.1)",
      },
      {
        label: "Vest Count",
        data: detectionCounts.map((d) => d.vest_count),
        borderColor: "rgb(59,130,246)",
        tension: 0.3,
        fill: true,
        backgroundColor: "rgba(59,130,246,0.1)",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Navbar */}
      <nav className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50 mb-8">
        <div className="container mx-auto flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">SafetySnap</h1>
          </Link>
          <div className="flex gap-4">
            <Link to="/upload"><Button variant="ghost">Upload</Button></Link>
            <Link to="/analytics"><Button variant="ghost">Analytics</Button></Link>
          </div>
        </div>
      </nav>

      {/* Upload Section */}
      <div className="border-2 border-dashed rounded-lg p-6 mb-4 text-center">
        <input type="file" multiple accept="image/*,video/*" onChange={handleFileInput} className="hidden" id="fileUpload" />
        <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center gap-2">
          <UploadIcon className="h-12 w-12 text-blue-600 animate-bounce" />
          <span className="font-semibold">Click to upload or drag & drop</span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <Button onClick={handleDetect} disabled={loading || files.length === 0}>
          {loading ? "Detecting..." : "Detect Uploaded"}
        </Button>
        <Button onClick={toggleLiveMode} variant="outline">
          {liveMode ? "Stop Live" : "Start Live"}
        </Button>
      </div>

      {/* Live Mode */}
      {liveMode && (
        <div className="flex flex-col items-center mb-8">
          <img
            src="http://127.0.0.1:5000/live"
            alt="Live Stream"
            className="rounded-lg shadow-lg max-w-3xl"
          />
          <div className="mt-4 flex gap-6">
            <div className="text-green-600 font-bold text-lg">
              Helmet: {detectionCounts.slice(-1)[0]?.helmet_count || 0}
            </div>
            <div className="text-blue-600 font-bold text-lg">
              Vest: {detectionCounts.slice(-1)[0]?.vest_count || 0}
            </div>
          </div>
          <div className="mt-6 w-full max-w-3xl">
            <Line data={lineGraphData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
