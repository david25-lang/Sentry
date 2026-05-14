'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrainingData } from '@/lib/ml-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartSectionProps {
  trainingData: TrainingData;
}

export function ChartSection({ trainingData }: ChartSectionProps) {
  // Combine data for dual axis chart
  const combinedData = trainingData.lossHistory.map((item) => ({
    epoch: item.epoch,
    loss: parseFloat(item.value.toFixed(4)),
    mAP: parseFloat(
      (trainingData.mAPHistory[item.epoch - 1]?.value || 0).toFixed(3)
    ),
  }));

  const metricsData = trainingData.precisionHistory.map((item) => ({
    epoch: item.epoch,
    precision: parseFloat(item.value.toFixed(3)),
    recall: parseFloat(
      (trainingData.recallHistory[item.epoch - 1]?.value || 0).toFixed(3)
    ),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Loss vs Epoch */}
      <Card className="border-white/10 bg-black/40 text-zinc-100 animate-fade-in [animation-delay:100ms]">
        <CardHeader>
          <CardTitle className="text-white text-lg sm:text-xl">Training Loss</CardTitle>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">Loss progression per epoch</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={combinedData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="epoch"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                stroke="rgba(255,255,255,0.2)"
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                stroke="rgba(255,255,255,0.2)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                formatter={(value) => value}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="loss"
                stroke="#ef4444"
                dot={false}
                strokeWidth={2}
                name="Loss"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* mAP vs Epoch */}
      <Card className="border-white/10 bg-black/40 text-zinc-100 animate-fade-in [animation-delay:200ms]">
        <CardHeader>
          <CardTitle className="text-white text-lg sm:text-xl">Model Accuracy (mAP)</CardTitle>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">Mean Average Precision over training</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={combinedData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="epoch"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                stroke="rgba(255,255,255,0.2)"
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                stroke="rgba(255,255,255,0.2)"
                domain={[0, 1]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                formatter={(value: number | string) => `${(Number(value) * 100).toFixed(1)}%`}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="mAP"
                stroke="#f59e0b"
                dot={false}
                strokeWidth={2}
                name="mAP"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Precision & Recall */}
      <Card className="border-white/10 bg-black/40 text-zinc-100 lg:col-span-2 animate-fade-in [animation-delay:300ms]">
        <CardHeader>
          <CardTitle className="text-white text-lg sm:text-xl">Precision vs Recall</CardTitle>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">Trade-off during training</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={metricsData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="epoch"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                stroke="rgba(255,255,255,0.2)"
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                stroke="rgba(255,255,255,0.2)"
                domain={[0, 1]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                formatter={(value: number | string) => `${(Number(value) * 100).toFixed(1)}%`}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="precision"
                stroke="#10b981"
                dot={false}
                strokeWidth={2}
                name="Precision"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="recall"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
                name="Recall"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
