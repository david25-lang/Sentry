'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModelMetrics } from '@/lib/ml-types';
import {
  TrendingUp,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface MetricsCardProps {
  metrics: ModelMetrics;
}

export function MetricsCard({ metrics }: MetricsCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'training':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
    }
  };

  const statusIcon = metrics.trainingStatus === 'completed' ? CheckmarkCircle01Icon : AlertCircleIcon;

  return (
    <Card className="border-white/10 bg-black/40 text-zinc-100 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-white text-lg sm:text-2xl">{metrics.modelName}</CardTitle>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Epoch {metrics.currentEpoch}/{metrics.totalEpochs}
            </p>
          </div>
          <Badge className={`${getStatusColor(metrics.trainingStatus)} border capitalize text-xs`}>
            <HugeiconsIcon icon={statusIcon} strokeWidth={2} className="h-3 w-3 mr-1" />
            {metrics.trainingStatus}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* mAP */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-2 sm:p-3 hover:border-orange-500/30 transition-colors">
            <p className="text-xs uppercase tracking-wider text-zinc-400">mAP</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">{(metrics.mAP * 100).toFixed(1)}%</p>
            <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
              <HugeiconsIcon icon={TrendingUp} strokeWidth={2} className="h-3 w-3 text-emerald-400" />
              Target: 85%
            </p>
          </div>

          {/* Precision */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-2 sm:p-3 hover:border-orange-500/30 transition-colors">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Precision</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">{(metrics.precision * 100).toFixed(1)}%</p>
            <p className="text-xs text-zinc-500 mt-0.5">True positives</p>
          </div>

          {/* Recall */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-2 sm:p-3 hover:border-orange-500/30 transition-colors">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Recall</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">{(metrics.recall * 100).toFixed(1)}%</p>
            <p className="text-xs text-zinc-500 mt-0.5">Detection rate</p>
          </div>

          {/* Loss */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-2 sm:p-3 hover:border-orange-500/30 transition-colors">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Loss</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">{metrics.loss.toFixed(4)}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Training loss</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-zinc-400">
          <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="h-4 w-4" />
          <span>
            Last trained: {metrics.lastTrained.toLocaleDateString()} at{' '}
            {metrics.lastTrained.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
