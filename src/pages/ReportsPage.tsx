import { useState } from 'react';
import { Calendar, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface HumidityDataPoint {
  day: string;
  hoursAboveLimit: number;
}

// Generate mock data for the last 30 days
const generateMonthlyData = (): HumidityDataPoint[] => {
  const data: HumidityDataPoint[] = [];
  for (let i = 1; i <= 30; i++) {
    const day = i.toString().padStart(2, '0');
    // Random hours above limit, with some days having high values
    const baseHours = Math.random() > 0.7 ? Math.floor(Math.random() * 12) + 4 : Math.floor(Math.random() * 4);
    data.push({ day, hoursAboveLimit: baseHours });
  }
  return data;
};

const monthlyData = generateMonthlyData();

export function ReportsPage() {
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-01-31');

  // Calculate total hours above limit
  const totalHoursAbove = monthlyData.reduce((sum, d) => sum + d.hoursAboveLimit, 0);
  const highRiskDays = monthlyData.filter(d => d.hoursAboveLimit > 8).length;

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 shadow-lg">
          <p className="text-zinc-500 text-xs mb-1">January {label}</p>
          <p className="text-emerald-500 text-sm font-medium">
            {payload[0].value} hours above limit
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Reports</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Historical analysis and predictive insights
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <span className="text-sm text-zinc-400">Date Range</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
            />
            <span className="text-zinc-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-400">
            Hours Above Safe Humidity Limit
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-500">Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-zinc-500">Elevated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-zinc-500">Critical</span>
            </div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="#3f3f46"
                tick={{ fill: '#71717a', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
                interval={4}
              />
              <YAxis
                stroke="#3f3f46"
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="hoursAboveLimit"
                fill="#10b981"
                radius={[2, 2, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-medium text-zinc-100">Analytics Summary</h2>
        </div>

        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 pb-4 border-b border-zinc-800">
            <div>
              <p className="text-2xl font-semibold text-zinc-100">{totalHoursAbove}</p>
              <p className="text-xs text-zinc-500 mt-1">Total hours above limit</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-amber-500">{highRiskDays}</p>
              <p className="text-xs text-zinc-500 mt-1">High-risk days</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-emerald-500">{Math.round((1 - highRiskDays / 30) * 100)}%</p>
              <p className="text-xs text-zinc-500 mt-1">Safe days percentage</p>
            </div>
          </div>

          {/* Insight Message */}
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                The bathroom humidity stayed dangerously high for <span className="text-amber-500 font-medium">40 hours total</span> last month. 
                Predictive model indicates a <span className="text-red-500 font-medium">high probability of mold growth</span> if conditions persist. 
                Recommend increasing ventilation and checking for leaks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
