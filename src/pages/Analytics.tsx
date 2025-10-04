import { Shield, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const complianceData = [
  { date: "Mon", compliant: 85, violations: 15 },
  { date: "Tue", compliant: 92, violations: 8 },
  { date: "Wed", compliant: 78, violations: 22 },
  { date: "Thu", compliant: 88, violations: 12 },
  { date: "Fri", compliant: 95, violations: 5 },
  { date: "Sat", compliant: 82, violations: 18 },
  { date: "Sun", compliant: 90, violations: 10 },
];

const ppeTypeData = [
  { name: "Helmets", value: 95, color: "hsl(var(--success))" },
  { name: "Vests", value: 88, color: "hsl(var(--primary))" },
  { name: "Gloves", value: 72, color: "hsl(var(--warning))" },
  { name: "Masks", value: 45, color: "hsl(var(--destructive))" },
];

const categoryData = [
  { category: "Construction", compliance: 92 },
  { category: "Manufacturing", compliance: 85 },
  { category: "Warehouse", compliance: 78 },
  { category: "Laboratory", compliance: 95 },
];

const Analytics = () => {
  const totalDetections = 1247;
  const complianceRate = 87.4;
  const activeAlerts = 12;
  const avgConfidence = 84.2;

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
              <h2 className="text-4xl font-bold mb-2">Analytics Dashboard</h2>
              <p className="text-lg text-muted-foreground">Comprehensive PPE compliance insights</p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-accent">
              <Calendar className="mr-2 h-4 w-4" />
              Last 7 Days
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="border-2 hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Detections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">{totalDetections.toLocaleString()}</p>
                  <TrendingUp className="h-8 w-8 text-success" />
                </div>
                <p className="text-xs text-success mt-2">↑ 12.5% from last week</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">{complianceRate}%</p>
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <p className="text-xs text-success mt-2">↑ 5.2% from last week</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">{activeAlerts}</p>
                  <AlertCircle className="h-8 w-8 text-warning" />
                </div>
                <p className="text-xs text-destructive mt-2">↓ 3 from yesterday</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">{avgConfidence}%</p>
                  <TrendingUp className="h-8 w-8 text-success" />
                </div>
                <p className="text-xs text-success mt-2">↑ 2.1% from last week</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Compliance Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Compliance Trend</CardTitle>
                <CardDescription>Daily compliance vs violations over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={complianceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="compliant"
                      stroke="hsl(var(--success))"
                      strokeWidth={3}
                      name="Compliant"
                    />
                    <Line
                      type="monotone"
                      dataKey="violations"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={3}
                      name="Violations"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* PPE Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>PPE Type Compliance</CardTitle>
                <CardDescription>Compliance rate by PPE category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ppeTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {ppeTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category-wise Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance by Work Area</CardTitle>
                <CardDescription>Compliance percentage across different areas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="compliance" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Violations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Violation Alerts</CardTitle>
                <CardDescription>Latest PPE compliance violations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: "10 min ago", location: "Construction Site A", issue: "No safety helmet" },
                    { time: "25 min ago", location: "Warehouse B", issue: "Missing safety vest" },
                    { time: "1 hour ago", location: "Manufacturing Floor", issue: "No protective gloves" },
                    { time: "2 hours ago", location: "Laboratory C", issue: "Mask not detected" },
                  ].map((violation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                    >
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{violation.issue}</p>
                        <p className="text-xs text-muted-foreground">{violation.location}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{violation.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Section */}
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Export Compliance Report</h3>
                  <p className="text-muted-foreground">
                    Download detailed analytics and compliance data in CSV or PDF format
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">Export CSV</Button>
                  <Button className="bg-gradient-to-r from-primary to-accent">Export PDF</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
