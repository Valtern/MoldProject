import { useTranslation } from 'react-i18next';
import { Shield, AlertTriangle, AlertCircle } from 'lucide-react';
import type { RoomStatus } from '@/types';

interface StatusBannerProps {
  roomName: string;
  status: RoomStatus;
  lastUpdated: string;
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

export function StatusBanner({ roomName, status, lastUpdated }: StatusBannerProps) {
  const { t } = useTranslation();
  const statusConfig = getStatusConfig(t);
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${config.textClass}`} strokeWidth={2} />
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {roomName}
            </h1>
            <span className="text-zinc-500 dark:text-zinc-400">—</span>
            <span className={`text-lg font-medium ${config.textClass}`}>
              {config.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`${config.dotClass}`} />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {t('dashboard.status.updatedAt', { time: lastUpdated })}
          </span>
        </div>
      </div>
    </div>
  );
}
