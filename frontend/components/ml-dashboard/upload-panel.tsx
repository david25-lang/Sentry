'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadResponse, DetectionResult } from '@/lib/ml-types';
import {
  Upload02Icon,
  LoadingIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface UploadPanelProps {
  onUpload?: (file: File) => Promise<UploadResponse>;
}

export function UploadPanel({ onUpload }: UploadPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [processingTime, setProcessingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // If custom onUpload handler provided, use it
      if (onUpload) {
        const response = await onUpload(file);
        if (response.success) {
          setUploadedImage(response.imageUrl);
          setDetections(response.predictions);
          setProcessingTime(response.processingTime);
        } else {
          setError(response.error || 'Failed to process image');
        }
      } else {
        // Fallback: Show uploaded image locally without processing
        const reader = new FileReader();
        reader.onload = () => {
          setUploadedImage(reader.result as string);
          setDetections([]);
          setProcessingTime(0);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-white/10 bg-black/40 text-zinc-100 animate-fade-in [animation-delay:700ms]">
      <CardHeader>
        <CardTitle className="text-white text-lg sm:text-xl">Run Inference</CardTitle>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">Upload an image for real-time detection</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload Area */}
          <div>
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-48 sm:h-56 border-2 border-dashed border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <HugeiconsIcon
                  icon={isLoading ? LoadingIcon : Upload02Icon}
                  strokeWidth={2}
                  className={`h-8 sm:h-10 w-8 sm:w-10 text-orange-400 mb-2 transition-all ${
                    isLoading ? 'animate-spin' : 'group-hover:scale-110'
                  }`}
                />
                <p className="mb-2 text-sm sm:text-base font-semibold text-white">
                  {isLoading ? 'Processing...' : 'Click to upload image'}
                </p>
                <p className="text-xs sm:text-sm text-zinc-400">
                  PNG, JPG, or JPEG (max 10MB)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={isLoading}
                className="hidden"
              />
            </label>

            {/* File Info */}
            {uploadedImage && (
              <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    strokeWidth={2}
                    className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5"
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-emerald-300">Image uploaded successfully</p>
                    <p className="text-xs text-emerald-400 mt-1">Processing time: {processingTime}ms</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <HugeiconsIcon
                    icon={AlertCircleIcon}
                    strokeWidth={2}
                    className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5"
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-red-300">Error</p>
                    <p className="text-xs text-red-400 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                setUploadedImage(null);
                setDetections([]);
                setError(null);
              }}
              variant="outline"
              className="w-full mt-4 border-white/15 bg-white/5 text-white hover:bg-white/10"
              disabled={!uploadedImage}
            >
              Clear
            </Button>
          </div>

          {/* Preview & Results */}
          <div className="space-y-4">
            {uploadedImage && (
              <>
                <div className="rounded-lg overflow-hidden border border-white/10 bg-black/50">
                  <img
                    src={uploadedImage}
                    alt="Uploaded preview"
                    className="w-full h-48 sm:h-56 object-cover"
                  />
                </div>

                {detections.length > 0 && (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-2">
                    <p className="text-sm font-semibold text-white flex items-center gap-2">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="h-4 w-4" />
                      {detections.length} Detection{detections.length !== 1 ? 's' : ''}
                    </p>
                    <div className="space-y-1">
                      {detections.map((det, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">{det.class}</span>
                          <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                            {Math.round(det.confidence * 100)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detections.length === 0 && uploadedImage && (
                  <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs text-blue-300">
                    No detections found in this image
                  </div>
                )}
              </>
            )}

            {!uploadedImage && (
              <div className="h-48 sm:h-56 rounded-lg border border-dashed border-white/15 bg-white/5 flex items-center justify-center text-center p-4">
                <p className="text-sm text-zinc-500">
                  Upload an image to preview detection results
                </p>
              </div>
            )}
          </div>
        </div>

        {/* API Integration Note */}
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-lg">
          <p className="text-xs text-orange-200">
            <span className="font-semibold">💡 Ready for Backend Integration</span>
            <br />
            Replace the onUpload handler with your API endpoint to process images on your server.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
