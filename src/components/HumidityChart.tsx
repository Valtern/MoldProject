import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';


interface HumidityChartProps {
  deviceID?: string;
}

export function HumidityChart({ deviceID }: HumidityChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Array<{time: string, humidity: number}>>([]);

  useEffect(() => {
    if (!deviceID) return;

    setData([]);

    // Fetch last 24 hours of data
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    const q = query(
      collection(db, 'SensorLogs'),
      where('deviceID', '==', deviceID),
      where('timestamp', '>=', cutoff),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const MAX_POINTS = 50;

      // Map all raw docs to data points
      const allPoints = snapshot.docs.map(doc => {
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

      // If we have fewer points than the max, use them all
      if (allPoints.length <= MAX_POINTS) {
        setData(allPoints);
        return;
      }

      // Downsample using peak/valley preservation:
      // Always keep first and last point, then divide the rest into
      // (MAX_POINTS - 2) buckets and pick the most significant point
      // from each bucket (the one furthest from the bucket average).
      const downsampled: typeof allPoints = [];
      downsampled.push(allPoints[0]); // always keep first

      const bucketSize = (allPoints.length - 2) / (MAX_POINTS - 2);

      for (let i = 0; i < MAX_POINTS - 2; i++) {
        const start = Math.floor(i * bucketSize) + 1;
        const end = Math.floor((i + 1) * bucketSize) + 1;
        const bucket = allPoints.slice(start, end);

        if (bucket.length === 0) continue;

        // Calculate bucket average
        const avg = bucket.reduce((sum, p) => sum + p.humidity, 0) / bucket.length;

        // Pick the point with the largest deviation from the average
        // This preserves spikes (rising trend) and dips (lowering trend)
        let maxDev = -1;
        let pick = bucket[0];
        for (const point of bucket) {
          const dev = Math.abs(point.humidity - avg);
          if (dev > maxDev) {
            maxDev = dev;
            pick = point;
          }
        }

        downsampled.push(pick);
      }

      downsampled.push(allPoints[allPoints.length - 1]); // always keep last
      setData(downsampled);
    }, (error) => {
      console.error('[HumidityChart] Listener error:', error);
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
        <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-lg border border-slate-200/60 dark:border-white/10 rounded-md px-3 py-2 shadow-xl">
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
      className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-5"
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
