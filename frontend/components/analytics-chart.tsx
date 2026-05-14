import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsChartProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AnalyticsChart({ title, description, children }: AnalyticsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-white">{title}</CardTitle>
        {description ? <p className="text-xs text-zinc-400">{description}</p> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
