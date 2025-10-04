import { useState, useEffect } from "react";
import { Shield, CheckCircle, XCircle, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface Detection {
  id: string;
  label: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  status: "compliant" | "violation" | "partial";
}

const mockDetections: Detection[] = [
  { id: "1", label: "Safety Helmet", confidence: 0.95, bbox: { x: 120, y: 80, width: 100, height: 120 }, status: "compliant" },
  { id: "2", label: "Safety Vest", confidence: 0.88, bbox: { x: 100, y: 200, width: 150, height: 180 }, status: "compliant" },
  { id: "3", label: "Gloves", confidence: 0.72, bbox: { x: 80, y: 350, width: 80, height: 80 }, status: "partial" },
  { id: "4", label: "No Mask Detected", confidence: 0, bbox: { x: 0, y: 0, width: 0, height: 0 }, status: "violation" },
];

const Detection = () => {
  const [detections] = useState<Detection[]>(mockDetections);
  const [selectedImage] = useState<string>("https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&q=80");

  const compliantCount = detections.filter((d) => d.status === "compliant").length;
  const violationCount = detections.filter((d) => d.status === "violation").length;
  const partialCount = detections.filter((d) => d.status === "partial").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "border-success";
      case "violation":
        return "border-destructive";
      case "partial":
        return "border-warning";
      default:
        return "border-muted";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            Compliant
          </Badge>
        );
      case "violation":
        return (
          <Badge className="bg-destructive text-destructive-foreground">
            <XCircle className="h-3 w-3 mr-1" />
            Violation
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-warning text-warning-foreground">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Partial
          </Badge>
        );
      default:
        return null;
    }
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
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-2">Detection Results</h2>
              <p className="text-lg text-muted-foreground">AI-powered PPE compliance analysis</p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-accent">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-success/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  Compliant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{compliantCount}</p>
                <p className="text-sm text-muted-foreground">PPE items detected</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-warning/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-5 w-5" />
                  Partial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{partialCount}</p>
                <p className="text-sm text-muted-foreground">Low confidence items</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  Violations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{violationCount}</p>
                <p className="text-sm text-muted-foreground">Missing PPE items</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image with Overlays */}
            <Card>
              <CardHeader>
                <CardTitle>Detection Preview</CardTitle>
                <CardDescription>Bounding boxes showing detected PPE items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative rounded-lg overflow-hidden border-2 border-border">
                  <img src={selectedImage} alt="Detection" className="w-full" />
                  {/* Mock bounding boxes */}
                  <div className="absolute top-[15%] left-[30%] w-[20%] h-[22%] border-4 border-success rounded-lg animate-pulse">
                    <div className="absolute -top-8 left-0 bg-success text-success-foreground text-xs px-2 py-1 rounded">
                      Helmet 95%
                    </div>
                  </div>
                  <div className="absolute top-[38%] left-[25%] w-[30%] h-[33%] border-4 border-success rounded-lg animate-pulse">
                    <div className="absolute -top-8 left-0 bg-success text-success-foreground text-xs px-2 py-1 rounded">
                      Vest 88%
                    </div>
                  </div>
                  <div className="absolute top-[65%] left-[20%] w-[16%] h-[15%] border-4 border-warning rounded-lg animate-pulse">
                    <div className="absolute -top-8 left-0 bg-warning text-warning-foreground text-xs px-2 py-1 rounded">
                      Gloves 72%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detection Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detection Details</CardTitle>
                <CardDescription>Comprehensive breakdown of all detections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detections.map((detection) => (
                    <div
                      key={detection.id}
                      className={`p-4 rounded-lg border-2 ${getStatusColor(detection.status)} bg-card`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{detection.label}</h4>
                        {getStatusBadge(detection.status)}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {detection.confidence > 0 && (
                          <>
                            <p>Confidence: {(detection.confidence * 100).toFixed(1)}%</p>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  detection.status === "compliant"
                                    ? "bg-success"
                                    : detection.status === "partial"
                                    ? "bg-warning"
                                    : "bg-destructive"
                                }`}
                                style={{ width: `${detection.confidence * 100}%` }}
                              />
                            </div>
                          </>
                        )}
                        {detection.status === "violation" && (
                          <p className="text-destructive font-medium">Required PPE missing</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Link to="/upload">
              <Button size="lg" variant="outline">
                Upload Another Image
              </Button>
            </Link>
            <Link to="/analytics">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent">
                View Analytics Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detection;
