import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { GaugeData } from '@/types';

interface StatCardProps {
  data: GaugeData;
  index: number;
  status?: 'safe' | 'warning' | 'critical';
}

const statusConfig = {
  safe: { dotClass: 'bg-emerald-500', textClass: 'text-emerald-500' },
  warning: { dotClass: 'bg-amber-500', textClass: 'text-amber-500' },
  critical: { dotClass: 'bg-red-500', textClass: 'text-red-500' },
};

export function StatCard({ data, index, status = 'safe' }: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const config = statusConfig[status];

  useEffect(() => {
    if (!cardRef.current) return;

    const ctx = gsap.context(() => {
      // Card fade in
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          delay: index * 0.08,
          ease: 'power2.out',
        }
      );

      // Value count up
      gsap.to(
        { value: 0 },
        {
          value: data.value,
          duration: 0.8,
          delay: index * 0.08 + 0.2,
          ease: 'power2.out',
          onUpdate: function () {
            const val = this.targets()[0].value;
            setDisplayValue(Number.isInteger(data.value) ? Math.round(val) : Math.round(val * 10) / 10);
          },
        }
      );
    });

    return () => ctx.revert();
  }, [data.value, index]);

  return (
    <div
      ref={cardRef}
      className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-5 flex flex-col justify-between h-32"
    >
      {/* Label - top left */}
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        {data.label}
      </span>

      {/* Value - center */}
      <div className="flex items-baseline gap-1">
        <span
          ref={valueRef}
          className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {displayValue}
        </span>
        <span className="text-lg text-zinc-500 dark:text-zinc-400">{data.unit}</span>
      </div>

      {/* Status indicator - bottom */}
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
        <span className={`text-xs ${config.textClass}`}>
          {data.caption || 'Normal'}
        </span>
      </div>
    </div>
  );
}
