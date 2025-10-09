import { Shield, Upload, BarChart3, Settings, AlertTriangle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-safety.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 relative overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b border-border bg-white/70 backdrop-blur-sm sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              SafetySnap AI
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login"><Button variant="ghost">Sign In</Button></Link>
            <Link to="/signup"><Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg">Get Started</Button></Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Button variant="ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden flex flex-col bg-white border-t border-border shadow-md"
            >
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Sign In</Button>
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg">Get Started</Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 animate-gradient-x blur-3xl opacity-50" />
        <div className="container mx-auto px-6 py-24 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl font-bold leading-tight"
              >
                Safety with{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Real-Time PPE Detection
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-xl text-gray-700"
              >
                AI-powered PPE detection instantly identifies helmets, vests, gloves, and other safety equipment, providing real-time alerts and analytics dashboards. YOLOv11 ensures fast, accurate detection for compliance monitoring on-site or on edge devices.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex gap-4"
              >
                <Link to="/upload">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl transition-all flex items-center gap-2">
                    <Upload className="h-5 w-5" /> Start Detection
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button size="lg" variant="outline" className="hover:bg-indigo-50 transition-all">
                    View Analytics
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-purple-200 blur-3xl opacity-30 animate-pulse" />
              <motion.img
                src={heroImage}
                alt="Safety Detection System"
                className="relative rounded-3xl shadow-2xl border border-gray-200"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Comprehensive Safety Monitoring</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Leverage cutting-edge AI to ensure complete PPE compliance across your organization.
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-8">
            {[{ icon: Upload, title: "Image & Video Upload", desc: "Upload single or batch images, or stream live video for real-time detection", color: "from-indigo-500 to-indigo-600" },
              { icon: Shield, title: "AI-Powered Detection", desc: "Advanced YOLO-based detection for helmets, vests, gloves, masks, and more", color: "from-green-500 to-green-600" },
              { icon: AlertTriangle, title: "Instant Alerts", desc: "Immediate notifications for PPE violations with detailed reports", color: "from-red-500 to-red-600" },
              { icon: BarChart3, title: "Analytics Dashboard", desc: "Compliance tracking with charts and exportable reports", color: "from-indigo-500 to-indigo-600" },
              { icon: Settings, title: "Customizable Filters", desc: "Adjust thresholds and filter by specific PPE types for precise results", color: "from-green-500 to-green-600" },
              { icon: Shield, title: "Violation History", desc: "Review past violations with timestamped snapshots and logs", color: "from-purple-500 to-purple-600" }].map((f, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }} className="border-2 border-gray-200 rounded-2xl p-6 bg-white shadow hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader>
                    <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                      <f.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{f.title}</CardTitle>
                    <CardDescription>{f.desc}</CardDescription>
                  </CardHeader>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* Floating AI Assistant */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <Button className="rounded-full w-14 h-14 flex items-center justify-center shadow-xl bg-indigo-600 text-white" onClick={() => setAiOpen(!aiOpen)}>
            AI
          </Button>
          <AnimatePresence>
            {aiOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-16 right-0 w-80 bg-white rounded-xl shadow-2xl p-4"
              >
                <h4 className="font-bold text-lg mb-2">AI Assistant</h4>
                <p className="text-gray-600 text-sm">Ask me anything about PPE detection or system usage!</p>
                {/* Optional: integrate chat input here */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 bg-white">
        <div className="container mx-auto px-6 text-center text-gray-500">
          © 2025 SafetySnap. AI-Powered PPE Detection System. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home; 