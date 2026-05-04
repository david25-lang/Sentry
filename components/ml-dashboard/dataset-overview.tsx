'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DatasetInfo } from '@/lib/ml-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DatasetOverviewProps {
  dataset: DatasetInfo;
}

const classColors = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export function DatasetOverview({ dataset }: DatasetOverviewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Dataset Stats */}
      <Card className="border-white/10 bg-black/40 text-zinc-100 animate-fade-in [animation-delay:400ms]">
        <CardHeader>
          <CardTitle className="text-white text-lg sm:text-xl">Dataset Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-zinc-400 mb-1">Total Images</p>
            <p className="text-3xl sm:text-4xl font-bold text-white">{dataset.totalImages.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400 mb-1">Classes</p>
            <p className="text-3xl sm:text-4xl font-bold text-orange-400">{dataset.numClasses}</p>
          </div>
          <div className="pt-3 border-t border-white/10">
            <p className="text-sm text-zinc-400 mb-2">Train/Test Split</p>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span>Training</span>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  {dataset.trainTestSplit.train}%
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span>Validation</span>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {dataset.trainTestSplit.val}%
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span>Testing</span>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {dataset.trainTestSplit.test}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Distribution */}
      <Card className="border-white/10 bg-black/40 text-zinc-100 lg:col-span-2 animate-fade-in [animation-delay:500ms]">
        <CardHeader>
          <CardTitle className="text-white text-lg sm:text-xl">Class Distribution</CardTitle>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">Number of labeled samples per class</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={dataset.classDistribution}
              margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                stroke="rgba(255,255,255,0.2)"
                angle={-45}
                textAnchor="end"
                height={80}
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
              />
              <Bar dataKey="count" fill="#8884d8" name="Samples" radius={[8, 8, 0, 0]}>
                {dataset.classDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={classColors[index % classColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
