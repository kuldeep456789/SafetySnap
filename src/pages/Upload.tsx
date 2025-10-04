import { useState, useCallback } from "react";
import { Upload as UploadIcon, Image as ImageIcon, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    
    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles]);
      toast.success(`${droppedFiles.length} image(s) added`);
    } else {
      toast.error("Please upload image files only");
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
      toast.success(`${selectedFiles.length} image(s) added`);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    toast.info("Image removed");
  };

  const handleDetect = () => {
    if (files.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    toast.success("Processing images...");
    setTimeout(() => {
      navigate("/detection");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SafetySnap
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/upload">
              <Button variant="ghost">Upload</Button>
            </Link>
            <Link to="/analytics">
              <Button variant="ghost">Analytics</Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost">Settings</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Upload Images for PPE Detection</h2>
            <p className="text-lg text-muted-foreground">
              Upload single or multiple images to detect PPE compliance
            </p>
          </div>

          {/* Upload Area */}
          <Card className="border-2 border-dashed hover:border-primary/50 transition-all">
            <CardContent className="p-8">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-xl p-12 text-center transition-all ${
                  dragActive
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-muted/30 border-2 border-dashed border-muted-foreground/20"
                }`}
              >
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <UploadIcon className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-semibold">
                      {dragActive ? "Drop your images here" : "Drag & drop images here"}
                    </p>
                    <p className="text-muted-foreground">or click to browse</p>
                  </div>
                  <Button type="button" variant="outline" className="mt-4">
                    Select Images
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* File Preview */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Images ({files.length})</CardTitle>
                <CardDescription>Review your images before detection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden border border-border bg-muted/30 aspect-video"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFile(index)}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-white text-xs truncate">{file.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              onClick={handleDetect}
              disabled={files.length === 0}
              className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
            >
              <ImageIcon className="mr-2 h-5 w-5" />
              Detect PPE ({files.length} {files.length === 1 ? "image" : "images"})
            </Button>
            {files.length > 0 && (
              <Button size="lg" variant="outline" onClick={() => setFiles([])}>
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
