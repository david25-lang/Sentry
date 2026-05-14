import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ResultCard({ title, subtitle, children }: ResultCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-white">{title}</CardTitle>
        {subtitle ? <p className="text-xs text-zinc-400">{subtitle}</p> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
