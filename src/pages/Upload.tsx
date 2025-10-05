import { useState, useEffect } from "react";
import { Upload as UploadIcon, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { Line } from "react-chartjs-2";
import Plot from "react-plotly.js";
import "chart.js/auto";

const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [liveMode, setLiveMode] = useState(false);
  const [detectionCounts, setDetectionCounts] = useState<{ frame:number, helmet_count:number, vest_count:number }[]>([]);
  const [sankeyData, setSankeyData] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ------------------------
  // File / Video upload
  // ------------------------
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles([...files, ...Array.from(e.target.files)]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    if (droppedFiles.length) {
      setFiles([...files, ...droppedFiles]);
      toast.success(`${droppedFiles.length} file(s) added via drag & drop`);
    } else toast.error("Only image/video files allowed");
  };

  const removeFile = (index:number) => setFiles(files.filter((_,i)=>i!==index));

  const handleDetect = async () => {
    if (files.length === 0) { toast.error("Upload at least one file"); return; }
    setLoading(true);
    setProgress(0);
    const results:string[] = [];
    try {
      for(let i=0; i<files.length; i++){
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        const res = await axios.post("http://127.0.0.1:5000/detect", formData, {
          headers: {"Content-Type":"multipart/form-data"},
          responseType:"blob",
          onUploadProgress: (event) => {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(Math.round((percent + (i*100)) / files.length));
          }
        });
        results.push(URL.createObjectURL(res.data));
      }
      setResultImages(results);
      toast.success("Detection completed!");
    } catch(err){ console.error(err); toast.error("Detection failed"); }
    finally { setLoading(false); setProgress(0); }
  };

  const toggleLiveMode = () => setLiveMode(!liveMode);

  // ------------------------
  // Live analytics fetch
  // ------------------------
  useEffect(() => {
    if(!liveMode) return;
    const interval = setInterval(async ()=>{
      try{
        const res = await axios.get("http://127.0.0.1:5000/live_analytics");
        setDetectionCounts(res.data);
        const sankeyRes = await axios.get("http://127.0.0.1:5000/sankey_data");
        setSankeyData(sankeyRes.data);
      } catch(err){ console.error(err); }
    }, 2000);
    return ()=> clearInterval(interval);
  }, [liveMode]);

  // ------------------------
  // Graph Data
  // ------------------------
  const lineGraphData = {
    labels: detectionCounts.map(d=>d.frame),
    datasets:[
      { label:"Helmet", data:detectionCounts.map(d=>d.helmet_count), borderColor:"rgb(34,197,94)", tension:0.4, fill:true, backgroundColor:"rgba(34,197,94,0.1)" },
      { label:"Vest", data:detectionCounts.map(d=>d.vest_count), borderColor:"rgb(59,130,246)", tension:0.4, fill:true, backgroundColor:"rgba(59,130,246,0.1)" }
    ]
  };

  const heatmapData = {
    z: detectionCounts.map(d => [d.helmet_count, d.vest_count]),
    x: ["Helmet","Vest"],
    y: detectionCounts.map(d => `Frame ${d.frame}`),
    type:"heatmap",
    colorscale:"Viridis"
  };

  const sankeyGraph = sankeyData ? {
    type: "sankey",
    orientation: "h",
    node: { label: ["Compliant", "No Helmet", "No Vest", "Violation"], color: ["green","red","blue","orange"] },
    link: { source: sankeyData.map((_,i)=>0), target: sankeyData.map((_,i)=>3), value: sankeyData.map(d=>d.value) }
  } : null;

  const formatFileSize = (bytes:number) => {
    if(bytes===0) return "0 Bytes";
    const k=1024, sizes=['Bytes','KB','MB','GB'];
    const i=Math.floor(Math.log(bytes)/Math.log(k));
    return (bytes/Math.pow(k,i)).toFixed(2)+" "+sizes[i];
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Navbar */}
      <nav className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50 mb-8">
        <div className="container mx-auto flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary"/>
            <h1 className="text-2xl font-bold text-primary">SafetySnap</h1>
          </Link>
          <div className="flex gap-4">
            <Link to="/upload"><Button variant="ghost">Upload</Button></Link>
            <Link to="/analytics"><Button variant="ghost">Analytics</Button></Link>
          </div>
        </div>
      </nav>

      {/* Upload Section */}
      <div
        onDragOver={e=>{ e.preventDefault(); setIsDragging(true); }}
        onDragLeave={e=>{ e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-all ${isDragging ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300 bg-white hover:scale-105'}`}
      >
        <input type="file" multiple accept="image/*,video/*" onChange={handleFileInput} className="hidden" id="fileUpload"/>
        <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center gap-2">
          <UploadIcon className="h-12 w-12 text-blue-600 animate-bounce"/>
          <span className="font-semibold">{isDragging ? "Drop files here" : "Click to upload or drag & drop"}</span>
          <Button className="mt-2"><UploadIcon className="mr-2 h-5 w-5"/> Browse Files</Button>
        </label>
      </div>

      {/* Upload Progress */}
      {loading && (
        <div className="mb-4 w-full max-w-xl mx-auto bg-gray-200 rounded-full h-4 overflow-hidden">
          <div className="bg-green-500 h-4 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <Button onClick={handleDetect} disabled={loading || files.length===0}>{loading ? "Detecting..." : "Detect Uploaded"}</Button>
        <Button onClick={toggleLiveMode} variant="outline">{liveMode ? "Stop Live":"Start Live"}</Button>
        <Button onClick={()=>window.open("http://127.0.0.1:5000/export/csv")}>Export CSV</Button>
        <Button onClick={()=>window.open("http://127.0.0.1:5000/export/pdf")}>Export PDF</Button>
      </div>

      {/* Selected Files */}
      {files.length>0 && (
        <Card className="mb-8">
          <CardHeader><CardTitle>Selected Files ({files.length})</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((file,i)=>(
              <div key={i} className="relative group rounded-lg overflow-hidden border p-1 hover:shadow-lg hover:scale-105 transition-all duration-300">
                {file.type.startsWith("video") ? (
                  <video src={URL.createObjectURL(file)} controls className="w-full h-40 object-cover rounded-lg"/>
                ) : (
                  <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-40 object-cover rounded-lg"/>
                )}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">{file.name} ({formatFileSize(file.size)})</div>
                <Button size="sm" variant="destructive" className="absolute top-2 right-2 p-1" onClick={()=>removeFile(i)}><X className="h-4 w-4"/></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Live Feed */}
      {liveMode && (
        <div className="flex flex-col items-center mb-8">
          <img src="http://127.0.0.1:5000/live" alt="Live Stream" className="rounded-lg shadow-lg max-w-3xl animate-pulse"/>
          <div className="mt-4 flex gap-6">
            <div className="text-green-600 font-bold text-lg">Helmet: {detectionCounts.slice(-1)[0]?.helmet_count || 0}</div>
            <div className="text-blue-600 font-bold text-lg">Vest: {detectionCounts.slice(-1)[0]?.vest_count || 0}</div>
          </div>
          <div className="mt-6 w-full max-w-3xl"><Line data={lineGraphData}/></div>
          <div className="mt-6 w-full max-w-3xl">
            <h2 className="text-lg font-bold mb-2">Heatmap</h2>
            <Plot data={[heatmapData]} layout={{autosize:true,height:400}}/>
          </div>
          {sankeyGraph && (
            <div className="mt-6 w-full max-w-3xl">
              <h2 className="text-lg font-bold mb-2">Compliance Sankey Chart</h2>
              <Plot data={[sankeyGraph]} layout={{autosize:true,height:400}}/>
            </div>
          )}
        </div>
      )}

      {/* Detection Results */}
      {resultImages.length>0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detection Results</CardTitle>
            <CardDescription>Annotated PPE Images/Videos</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {resultImages.map((url,i)=>(
              <img key={i} src={url} alt={`Detection ${i}`} className="w-full h-40 object-cover rounded-lg border hover:scale-105 transition-all"/>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Upload;
