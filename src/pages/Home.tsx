import { Shield, Upload, BarChart3, Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-safety.jpg";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SafetySnap
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-primary to-accent">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {/* <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                <span className="text-sm font-medium text-primary">AI-Powered Safety Detection</span>
              </div> */}
              <h2 className="text-5xl font-bold leading-tight">
                Safety with{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Real-Time PPE Detection
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Safety PPE detection uses AI to instantly identify helmets, vests, and other protective gear, ensuring worker safety in real-time. 
                YOLOv11 delivers lightning-fast, accurate detection with clear visuals, counts, and alerts for missing equipment. 
                It powers smart dashboards, compliance analytics, and can run on-site or on edge devices for seamless, proactive safety monitoring.
              </p>
              <div className="flex gap-4">
                <Link to="/upload">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg transition-all">
                    <Upload className="mr-2 h-5 w-5" />
                    Start Detection
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button size="lg" variant="outline">
                    View Analytics
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl" />
              <img
                src={heroImage}
                alt="Safety Detection System"
                className="relative rounded-2xl shadow-2xl border border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Comprehensive Safety Monitoring</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Leverage cutting-edge AI to ensure complete PPE compliance across your organization
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>Image & Video Upload</CardTitle>
                <CardDescription>
                  Upload single or batch images, or stream live video for real-time detection
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-success/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-success-foreground" />
                </div>
                <CardTitle>AI-Powered Detection</CardTitle>
                <CardDescription>
                  Advanced YOLO-based detection for helmets, vests, gloves, masks, and more
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle>Instant Alerts</CardTitle>
                <CardDescription>
                  Get immediate notifications for PPE violations with detailed violation reports
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive compliance tracking with visual charts and exportable reports
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-success/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-4">
                  <Settings className="h-6 w-6 text-success-foreground" />
                </div>
                <CardTitle>Customizable Filters</CardTitle>
                <CardDescription>
                  Adjust confidence thresholds and filter by specific PPE types for precise results
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle>Violation History</CardTitle>
                <CardDescription>
                  Track and review past violations with timestamped snapshots and detailed logs
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-6">Ready to Enhance Workplace Safety?</h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Start detecting PPE compliance today and protect your workforce with AI-powered monitoring
          </p>
          <Link to="/upload">
            <Button size="lg" variant="secondary" className="hover:scale-105 transition-transform">
              <Upload className="mr-2 h-5 w-5" />
              Upload Your First Image
            </Button>
          </Link>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card">
        {/* <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 SafetySnap. AI-Powered PPE Detection System.</p>
        </div> */}
      </footer>
    </div>
  );
};

export default Home;
