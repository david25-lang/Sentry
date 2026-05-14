import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DetectionCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "orange" | "red" | "cyan" | "emerald";
}

const toneMap = {
  orange: "text-orange-300",
  red: "text-red-300",
  cyan: "text-cyan-300",
  emerald: "text-emerald-300",
};

export function DetectionCard({ label, value, icon: Icon, tone = "orange" }: DetectionCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-between py-5">
        <div>
          <p className="text-xs text-zinc-400">{label}</p>
          <p className="text-2xl font-semibold text-white">{value}</p>
        </div>
        {Icon ? <Icon className={`h-5 w-5 ${toneMap[tone]}`} /> : null}
      </CardContent>
    </Card>
  );
}
