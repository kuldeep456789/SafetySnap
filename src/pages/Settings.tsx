import { useState } from "react";
import { Shield, Settings as SettingsIcon, Filter, Sliders } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Settings = () => {
  const [confidenceThreshold, setConfidenceThreshold] = useState([70]);
  const [ppeFilters, setPpeFilters] = useState({
    helmets: true,
    vests: true,
    gloves: true,
    masks: true,
    goggles: true,
    boots: true,
  });

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully!");
  };

  const handleToggleFilter = (filter: keyof typeof ppeFilters) => {
    setPpeFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
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
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold">Detection Settings</h2>
              <p className="text-lg text-muted-foreground">Configure PPE detection parameters</p>
            </div>
          </div>

          {/* Confidence Threshold */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                <CardTitle>Confidence Threshold</CardTitle>
              </div>
              <CardDescription>
                Set the minimum confidence level for PPE detection (0-100%)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg">Minimum Confidence</Label>
                  <span className="text-2xl font-bold text-primary">{confidenceThreshold[0]}%</span>
                </div>
                <Slider
                  value={confidenceThreshold}
                  onValueChange={setConfidenceThreshold}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low (0%)</span>
                  <span>Medium (50%)</span>
                  <span>High (100%)</span>
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  Detections below {confidenceThreshold[0]}% confidence will be filtered out. Higher thresholds
                  reduce false positives but may miss some valid detections.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* PPE Type Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle>PPE Type Filters</CardTitle>
              </div>
              <CardDescription>
                Enable or disable detection for specific PPE categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(ppeFilters).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        value ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Shield className={`h-5 w-5 ${value ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <Label htmlFor={key} className="text-base font-semibold capitalize cursor-pointer">
                          {key}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {value ? "Detection enabled" : "Detection disabled"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={() => handleToggleFilter(key as keyof typeof ppeFilters)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Options</CardTitle>
              <CardDescription>Configure advanced detection features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <Label htmlFor="auto-alert" className="text-base font-semibold">
                    Auto Alert on Violations
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically send alerts when violations are detected
                  </p>
                </div>
                <Switch id="auto-alert" defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <Label htmlFor="save-snapshots" className="text-base font-semibold">
                    Save Violation Snapshots
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Store images of detected violations for review
                  </p>
                </div>
                <Switch id="save-snapshots" defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <Label htmlFor="show-bboxes" className="text-base font-semibold">
                    Display Bounding Boxes
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show detection boxes on preview images
                  </p>
                </div>
                <Switch id="show-bboxes" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" size="lg">
              Reset to Defaults
            </Button>
            <Button
              size="lg"
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
