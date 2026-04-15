import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { HumidityDataPoint } from '@/types';

interface HumidityChartProps {
  deviceID?: string;
}

export function HumidityChart({ deviceID }: HumidityChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Array<{time: string, humidity: number}>>([]);

  useEffect(() => {
    if (!deviceID) return;

    const logsRef = collection(db, 'SensorLogs');
    const q = query(
      logsRef,
      where('deviceID', '==', deviceID),
      orderBy('timestamp', 'asc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chartData = snapshot.docs.map(doc => {
        const payload = doc.data();
        let formattedTime = '';
        if (payload.timestamp) {
           const d = payload.timestamp.toDate ? payload.timestamp.toDate() : new Date(payload.timestamp);
           formattedTime = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        }
        return {
          time: formattedTime,
          humidity: payload.humidity ?? 0
        };
      });
      setData(chartData);
    });

    return () => unsubscribe();
  }, [deviceID]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.24, ease: 'power2.out' }
      );
    });

    return () => ctx.revert();
  }, []);

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 shadow-lg">
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">{label}</p>
          <p className="text-emerald-500 text-sm font-medium">
            {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Humidity — Last 24 Hours
        </h2>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Safe range 40-60%</span>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="#3f3f46"
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#27272a' }}
              interval={5}
            />
            <YAxis
              stroke="#3f3f46"
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#27272a' }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="humidity"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#emeraldGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: '#10b981',
                stroke: '#18181b',
                strokeWidth: 2,
              }}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
