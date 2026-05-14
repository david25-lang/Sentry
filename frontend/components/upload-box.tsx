"use client";

import * as React from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadBoxProps {
  title: string;
  description: string;
  accept?: string;
  disabled?: boolean;
  onFileSelect: (file: File) => void;
}

export function UploadBox({
  title,
  description,
  accept = "image/*",
  disabled,
  onFileSelect,
}: UploadBoxProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    }
    if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center transition",
        dragActive && "border-orange-500/40 bg-orange-500/5",
        disabled && "opacity-60"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <UploadCloud className="h-6 w-6 text-orange-300" />
      </div>
      <p className="mt-4 text-sm font-medium text-white">{title}</p>
      <p className="mt-1 text-xs text-zinc-400">{description}</p>
      <Button
        type="button"
        variant="outline"
        className="mt-4 border-white/15 bg-white/5 text-white hover:bg-white/10"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
      >
        Browse File
      </Button>
    </div>
  );
}
