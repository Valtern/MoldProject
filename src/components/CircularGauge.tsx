import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { GaugeData } from '@/types';

interface CircularGaugeProps {
  data: GaugeData;
  index: number;
}

export function CircularGauge({ data, index }: CircularGaugeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);

  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate progress (0-1)
  const progress = Math.min(Math.max((data.value - data.min) / (data.max - data.min), 0), 1);
  const rotation = 135; // Start from bottom-left

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Container fade in and slide up
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: index * 0.12,
          ease: 'power2.out',
        }
      );

      // Circle progress animation
      if (circleRef.current) {
        gsap.fromTo(
          circleRef.current,
          { strokeDashoffset: circumference * 0.75 },
          {
            strokeDashoffset: circumference * 0.75 - progress * circumference * 0.75,
            duration: 1.2,
            delay: index * 0.12 + 0.3,
            ease: 'power2.out',
          }
        );
      }

      // Value count up animation
      gsap.to(
        { value: 0 },
        {
          value: data.value,
          duration: 1.2,
          delay: index * 0.12 + 0.3,
          ease: 'power2.out',
          onUpdate: function () {
            setDisplayValue(Math.round(this.targets()[0].value));
          },
        }
      );
    });

    return () => ctx.revert();
  }, [data.value, progress, index, circumference]);

  return (
    <div
      ref={containerRef}
      className="panel-hologram rounded-xl p-6 flex flex-col items-center justify-center"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(169, 179, 194, 0.18)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
          />
          {/* Progress fill */}
          <circle
            ref={circleRef}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#39FF14"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            strokeDashoffset={circumference * 0.75}
            style={{ filter: 'drop-shadow(0 0 4px rgba(57, 255, 20, 0.5))' }}
          />
        </svg>
        {/* Inner content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            ref={valueRef}
            className="text-4xl md:text-5xl font-semibold text-[#F4F6FA] tracking-tight"
          >
            {displayValue}
          </span>
          <span className="text-sm text-[#A9B3C2] mt-1">{data.unit}</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-sm font-medium text-[#A9B3C2] uppercase tracking-wider">
          {data.label}
        </h3>
        {data.caption && (
          <p className="text-xs text-[#39FF14] mt-1">{data.caption}</p>
        )}
      </div>
    </div>
  );
}
