import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const technologies = [
  "YOLOv8",
  "CNN (ResNet18)",
  "Next.js",
  "Tailwind CSS",
  "Framer Motion",
  "Recharts",
  "FastAPI",
  "PyTorch",
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs text-orange-200">About the Project</p>
        <h1 className="text-3xl font-semibold text-white">Sentry</h1>
        <p className="text-sm text-zinc-400">
          Pothole and Crack Detection System for smarter, safer road infrastructure.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">Project Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-400">
            <p>
              Sentry is a final year project that combines YOLOv8 object detection with CNN
              classification to identify road damage, assess severity, and prioritize maintenance.
            </p>
            <p>
              The platform targets government agencies and smart-city teams by providing real-time
              inspection insights, analytics, and decision-ready reports.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">Problem Statement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-400">
            <p>
              Manual road inspections are slow, costly, and inconsistent. Critical potholes may
              remain unreported, leading to accidents and infrastructure degradation.
            </p>
            <p>
              Sentry AI automates detection to deliver consistent, data-driven prioritization for
              maintenance teams.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-white">Technologies Used</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <Badge key={tech} className="border border-white/10 bg-white/5 text-zinc-200">
              {tech}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">Dataset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-400">
            <p>
              Curated road damage dataset with annotated potholes and cracks captured from urban and
              rural roads.
            </p>
            <p>Augmentation: rotation, brightness adjustment, blur, and perspective distortion.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">YOLOv8 Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-400">
            <p>Detects potholes and cracks with bounding boxes and confidence scores.</p>
            <p>Optimized for fast inference on edge devices and inspection cameras.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">CNN Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-400">
            <p>Classifies overall road condition and severity from captured frames.</p>
            <p>Supports maintenance prioritization by estimating risk levels.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-white">System Architecture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-400">
          <p>
            The frontend collects images from uploads or live camera feeds. The backend runs YOLOv8
            detection and CNN classification, then returns predictions and processed results.
          </p>
          <p>
            Analytics dashboards aggregate detections into actionable metrics for supervisors and
            maintenance planners.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">Student</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-400">
            <p>Student: [Shittu Oluyinka David]</p>
            <p>Department: Computer Science</p>
            <p>Institution: [Bowen University]</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">Supervisor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-400">
            <p>Supervisor: [Dr. Abiodun Moses]</p>
            <p>Faculty: College of Computing</p>
            <p>Contact: [Supervisor Email]</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
