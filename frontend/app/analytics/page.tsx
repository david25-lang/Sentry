"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DetectionCard } from "@/components/detection-card";
import { AnalyticsChart } from "@/components/analytics-chart";
import { ResultCard } from "@/components/result-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Camera, TriangleAlert, Activity, BarChart3 } from "lucide-react";

const trendData = [
  { day: "Mon", detections: 32, potholes: 14, cracks: 18 },
  { day: "Tue", detections: 44, potholes: 19, cracks: 25 },
  { day: "Wed", detections: 38, potholes: 15, cracks: 23 },
  { day: "Thu", detections: 58, potholes: 26, cracks: 32 },
  { day: "Fri", detections: 64, potholes: 30, cracks: 34 },
  { day: "Sat", detections: 51, potholes: 21, cracks: 30 },
  { day: "Sun", detections: 47, potholes: 20, cracks: 27 },
];

const severityData = [
  { name: "Low", value: 32 },
  { name: "Moderate", value: 44 },
  { name: "High", value: 18 },
  { name: "Severe", value: 6 },
];

const hotspotData = [
  { zone: "North", incidents: 28 },
  { zone: "Central", incidents: 42 },
  { zone: "East", incidents: 36 },
  { zone: "South", incidents: 24 },
  { zone: "West", incidents: 31 },
];

const severityColors = ["#22c55e", "#f59e0b", "#f97316", "#ef4444"];

const recentDetections = [
  {
    id: "R-0941",
    location: "District 3 - Market Road",
    type: "Pothole",
    severity: "High",
    confidence: "92%",
  },
  {
    id: "R-0936",
    location: "Airport Expressway",
    type: "Crack",
    severity: "Moderate",
    confidence: "86%",
  },
  {
    id: "R-0929",
    location: "Ring Road - East",
    type: "Pothole",
    severity: "Severe",
    confidence: "95%",
  },
  {
    id: "R-0922",
    location: "Main Gate Avenue",
    type: "Crack",
    severity: "Low",
    confidence: "78%",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs text-orange-200">Operational Intelligence</p>
        <h1 className="text-3xl font-semibold text-white">Analytics Dashboard</h1>
        <p className="text-sm text-zinc-400">
          Track detections, severity distribution, and inspection trends across the city.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DetectionCard label="Images Analyzed" value="1,240" icon={Camera} tone="cyan" />
        <DetectionCard label="Potholes Detected" value="324" icon={TriangleAlert} tone="red" />
        <DetectionCard label="Cracks Detected" value="516" icon={Activity} tone="orange" />
        <DetectionCard label="Active Alerts" value="28" icon={BarChart3} tone="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChart title="Detection Trends" description="Daily detections across the last 7 days.">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(6,10,20,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
                <Line type="monotone" dataKey="detections" stroke="#f97316" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="potholes" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cracks" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChart>

        <AnalyticsChart title="Severity Distribution" description="Share of detections by severity.">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {severityData.map((entry, index) => (
                    <Cell key={entry.name} fill={severityColors[index % severityColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(6,10,20,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChart>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChart title="Hotspot Zones" description="Incidents per inspection zone.">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hotspotData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="zone" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(6,10,20,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="incidents" fill="#22d3ee" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChart>

        <ResultCard title="AI Performance" subtitle="Model health metrics">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white">YOLOv8 Precision</p>
                <Badge className="border border-orange-500/30 bg-orange-500/10 text-orange-200">89.7%</Badge>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white">CNN Accuracy</p>
                <Badge className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-200">88.1%</Badge>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white">Avg Processing</p>
                <Badge className="border border-white/10 bg-white/5 text-zinc-200">16 ms</Badge>
              </div>
            </div>
          </div>
        </ResultCard>
      </div>

      <ResultCard title="Recent Detections" subtitle="Latest inspection reports">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentDetections.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell className="text-zinc-300">{row.location}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>
                  <Badge className="border border-white/10 bg-white/5 text-zinc-200">{row.severity}</Badge>
                </TableCell>
                <TableCell>{row.confidence}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ResultCard>
    </div>
  );
}
