import { useTranslation } from 'react-i18next';
import { Shield, AlertTriangle, AlertCircle } from 'lucide-react';
import type { RoomStatus } from '@/types';

interface StatusBannerProps {
  roomName: string;
  status: RoomStatus;
  lastUpdated: string;
  lastUpdatedTimestamp?: Date;
}

function getStatusConfig(t: (key: string) => string) {
  return {
    safe: {
      label: t('dashboard.status.safe'),
      icon: Shield,
      textClass: 'text-emerald-500',
      dotClass: 'status-dot safe',
    },
    warning: {
      label: t('dashboard.status.warning'),
      icon: AlertTriangle,
      textClass: 'text-amber-500',
      dotClass: 'status-dot warning',
    },
    critical: {
      label: t('dashboard.status.critical'),
      icon: AlertCircle,
      textClass: 'text-red-500',
      dotClass: 'status-dot critical',
    },
  };
}

export function StatusBanner({ roomName, status, lastUpdated, lastUpdatedTimestamp }: StatusBannerProps) {
  const { t } = useTranslation();
  const statusConfig = getStatusConfig(t);
  const config = statusConfig[status];
  const Icon = config.icon;

  const formattedTime = (() => {
    if (!lastUpdatedTimestamp) return lastUpdated;
    const d = lastUpdatedTimestamp;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = String(d.getFullYear());
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  })();

  const timeLabel = t('dashboard.status.updatedAt', { time: formattedTime });

  return (
    <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg px-4 py-4 md:px-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Icon className={`w-5 h-5 ${config.textClass}`} strokeWidth={2} />
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
            <h1 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {roomName}
            </h1>
            <span className="text-zinc-500 dark:text-zinc-400">—</span>
            <span className={`text-base sm:text-lg font-medium ${config.textClass}`}>
              {config.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:justify-end md:whitespace-nowrap md:self-auto self-start">
          <span
            className={`${config.dotClass}${status === 'critical' ? ' animate-pulse' : ''}`}
          />
          <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-tight">
            {timeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
