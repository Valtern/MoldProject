import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';

interface MoldRiskGaugeProps {
  humidity: number;
  criticalLimit: number;
  riskScore?: number;
  title?: string;
  embedded?: boolean;
  index?: number;
}

const VIEWBOX = 120;
const STROKE_W = 10;
const RADIUS = (VIEWBOX - STROKE_W) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC = 0.75;

function calcScore(humidity: number, criticalLimit: number): number {
  return Math.min(100, Math.round((humidity / Math.max(criticalLimit, 1)) * 100));
}

export function MoldRiskGauge({ humidity, criticalLimit, riskScore, title, embedded = false, index = 3 }: MoldRiskGaugeProps) {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const scoreRef = useRef(0);
  const [displayScore, setDisplayScore] = useState(0);

  // Use the direct predictive riskScore when provided; otherwise fall back to the humidity-based calculation
  const score = riskScore != null
    ? Math.min(100, Math.max(0, Math.round(riskScore)))
    : calcScore(humidity, criticalLimit);

  const riskColor    = score >= 75 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#10b981';
  const riskTextClass = score >= 75 ? 'text-red-500' : score >= 40 ? 'text-amber-500' : 'text-emerald-500';
  const riskDotClass  = score >= 75 ? 'bg-red-500'  : score >= 40 ? 'bg-amber-500'  : 'bg-emerald-500';
  const trackColor    = score >= 75
    ? 'rgba(239,68,68,0.12)'
    : score >= 40
    ? 'rgba(245,158,11,0.12)'
    : 'rgba(16,185,129,0.12)';
  const riskLabel = score >= 75
    ? t('dashboard.moldRisk.high')
    : score >= 40
    ? t('dashboard.moldRisk.medium')
    : t('dashboard.moldRisk.low');

  // mount fade-in (same delay pattern as StatCard)
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, delay: index * 0.08, ease: 'power2.out' }
    );
  }, [index]);

  // animate arc + counter on every data change
  useEffect(() => {
    if (!circleRef.current) return;
    const targetOffset = CIRCUMFERENCE * ARC * (1 - score / 100);

    gsap.killTweensOf(circleRef.current);
    gsap.killTweensOf(scoreRef);

    gsap.to(circleRef.current, {
      strokeDashoffset: targetOffset,
      duration: 0.9,
      ease: 'power2.out',
    });
    gsap.to(scoreRef, {
      current: score,
      duration: 0.9,
      ease: 'power2.out',
      onUpdate: () => setDisplayScore(Math.round(scoreRef.current)),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [humidity, criticalLimit, riskScore]);

  const cardClass = embedded
    ? 'flex flex-col justify-between flex-1 min-w-0'
    : 'bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-3 md:p-5 flex flex-col justify-between h-28 md:h-32';

  return (
    <div
      ref={cardRef}
      className={cardClass}
    >
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        {title || t('dashboard.moldRisk.label')}
      </span>

      <div className="flex items-center gap-2.5">
        {/* mini arc gauge */}
        <div className="relative flex-shrink-0" style={{ width: 48, height: 48 }}>
          <svg
            width={48}
            height={48}
            viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
            style={{ transform: 'rotate(135deg)' }}
          >
            <circle
              cx={VIEWBOX / 2}
              cy={VIEWBOX / 2}
              r={RADIUS}
              fill="none"
              stroke={trackColor}
              strokeWidth={STROKE_W}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE * ARC} ${CIRCUMFERENCE}`}
            />
            <circle
              ref={circleRef}
              cx={VIEWBOX / 2}
              cy={VIEWBOX / 2}
              r={RADIUS}
              fill="none"
              stroke={riskColor}
              strokeWidth={STROKE_W}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE * ARC} ${CIRCUMFERENCE}`}
              strokeDashoffset={CIRCUMFERENCE * ARC}
            />
          </svg>
        </div>

        <div className="flex items-baseline gap-0.5">
          <span className={`text-2xl md:text-3xl font-semibold ${riskTextClass}`}>
            {displayScore}
          </span>
          <span className="text-sm md:text-base text-zinc-500 dark:text-zinc-400">%</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${riskDotClass}`} />
        <span className={`text-xs ${riskTextClass}`}>{riskLabel}</span>
      </div>
    </div>
  );
}
