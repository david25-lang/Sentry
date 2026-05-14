import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export function LoadingSpinner({ className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-zinc-400", className)}>
      <LoaderCircle className="h-4 w-4 animate-spin text-orange-300" />
      {label ? <span>{label}</span> : null}
    </div>
  );
}
