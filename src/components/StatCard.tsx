import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import type { GaugeData } from '@/types';

interface StatCardProps {
  data: GaugeData;
  index: number;
  status?: 'safe' | 'warning' | 'critical';
  safeLimit?: number;
}

const statusConfig = {
  safe: { dotClass: 'bg-emerald-500', textClass: 'text-emerald-500' },
  warning: { dotClass: 'bg-amber-500', textClass: 'text-amber-500' },
  critical: { dotClass: 'bg-red-500', textClass: 'text-red-500' },
};

export function StatCard({ data, index, status = 'safe', safeLimit = 60 }: StatCardProps) {
  const { t, i18n } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [lang, setLang] = useState(i18n.language);
  const config = statusConfig[status];

  // Subscribe to language changes
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setLang(lng);
    };
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  useEffect(() => {
    if (!cardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, delay: index * 0.08, ease: 'power2.out' }
      );
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

  const val = data.value;
  const label = data.type === 'temperature' ? t('dashboard.stats.temperature.label') :
                data.type === 'humidity' ? t('dashboard.stats.humidity.label') :
                data.type === 'lightLevel' ? t('dashboard.stats.lightLevel.label') : '';

  const caption = data.type === 'temperature' ?
                  (val < 18 ? t('dashboard.stats.temperature.caption.cool') :
                   val > 26 ? t('dashboard.stats.temperature.caption.warm') :
                   t('dashboard.stats.temperature.caption.comfortable')) :
                  data.type === 'humidity' ?
                  (val < 40 ? t('dashboard.stats.humidity.caption.dry') :
                   val >= safeLimit ? t('dashboard.stats.humidity.caption.humid') :
                   t('dashboard.stats.humidity.caption.optimal')) :
                  data.type === 'lightLevel' ?
                  (val < 100 ? t('dashboard.stats.lightLevel.caption.dim') :
                   val > 500 ? t('dashboard.stats.lightLevel.caption.bright') :
                   t('dashboard.stats.lightLevel.caption.moderate')) :
                  t('dashboard.status.safe');

  return (
    <div
      ref={cardRef}
      data-lang={lang}
      className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-3 md:p-5 flex flex-col justify-between h-28 md:h-32"
    >
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span ref={valueRef} className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
          {displayValue}
        </span>
        <span className="text-sm md:text-lg text-zinc-500 dark:text-zinc-400">{data.unit}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
        <span className={`text-xs ${config.textClass}`}>{caption}</span>
      </div>
    </div>
  );
}
