import { useState, useEffect } from 'react';
import { Wifi, AlertCircle, CheckCircle2, Thermometer, Droplets } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

const wifiConfig = {
  Excellent: { icon: Wifi, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  Good: { icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  Fair: { icon: Wifi, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  Poor: { icon: Wifi, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  Offline: { icon: AlertCircle, color: 'text-zinc-500 dark:text-zinc-400', bg: 'bg-zinc-100 dark:bg-zinc-800' },
};

const statusConfig = {
  online: { label: 'Online', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  offline: { label: 'Offline', className: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700' },
  warning: { label: 'Unstable', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
};

function DeviceTableRow({ room }: { room: any }) {
  const [latestLog, setLatestLog] = useState<any>(null);
  const [status, setStatus] = useState<'online' | 'warning' | 'offline'>('offline');

  // Fetch the 1 most recent log for this device
  useEffect(() => {
    if (!room.deviceID) return;

    const logsRef = collection(db, 'SensorLogs');
    const q = query(
      logsRef,
      where('deviceID', '==', room.deviceID),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLatestLog(snapshot.docs[0].data());
      } else {
        setLatestLog(null);
      }
    }, (error) => {
      console.error('[DevicesPage] Listener error for', room.deviceID, ':', error);
    });

    return () => unsubscribe();
  }, [room.deviceID]);

  // Calculate status natively every 30 seconds internally to keep "Unstable / Offline" accurate even if DB is quiet
  useEffect(() => {
    const evaluateStatus = () => {
      if (!latestLog || !latestLog.timestamp) {
        setStatus('offline');
        return;
      }

      const logTime = latestLog.timestamp?.toDate ? latestLog.timestamp.toDate().getTime() : new Date(latestLog.timestamp).getTime();
      const diffMs = Date.now() - logTime;
      const diffMinutes = diffMs / 1000 / 60;

      if (diffMinutes < 5) {
        setStatus('online');
      } else if (diffMinutes < 15) {
        setStatus('warning');
      } else {
        setStatus('offline');
      }
    };

    evaluateStatus();
    const interval = setInterval(evaluateStatus, 30000);
    return () => clearInterval(interval);
  }, [latestLog]);

  // Derive Wifi Strength
  let wifiStrengthKey: keyof typeof wifiConfig = 'Offline';
  let wifiSignalText = '--';
  if (status !== 'offline' && latestLog?.wifiSignal !== undefined) {
    const sig = Number(latestLog.wifiSignal);
    wifiSignalText = `${sig} dBm`;
    if (sig >= -60) wifiStrengthKey = 'Excellent';
    else if (sig >= -70) wifiStrengthKey = 'Good';
    else if (sig >= -80) wifiStrengthKey = 'Fair';
    else wifiStrengthKey = 'Poor';
  } else if (status !== 'offline') {
     // If they don't have wifi tracking yet but are online
     wifiStrengthKey = 'Good';
     wifiSignalText = 'Active';
  }

  const wifi = wifiConfig[wifiStrengthKey];
  const WifiIcon = wifi.icon;
  const stat = statusConfig[status];

  return (
    <tr className="border-b border-slate-200/60 dark:border-white/5 last:border-b-0 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">IoT</span>
          </div>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{room.deviceID || 'Unassigned'}</span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{room.name}</span>
      </td>
      <td className="px-4 py-3.5">
        {latestLog ? (
          <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md ${wifi.bg}`}>
            <WifiIcon className={`w-3.5 h-3.5 ${wifi.color}`} />
            <span className={`text-xs font-medium ${wifi.color}`}>
              {wifiSignalText}
            </span>
          </div>
        ) : (
          <span className="text-sm text-zinc-600">Waiting for data...</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        {latestLog ? (
          <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span className="text-sm">{latestLog.temperature ?? '--'}°C</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span className="text-sm">{latestLog.humidity ?? '--'}%</span>
            </div>
          </div>
        ) : (
          <span className="text-sm text-zinc-600">--</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <span className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border
          ${stat.className}
        `}>
          {status === 'online' && <CheckCircle2 className="w-3 h-3" />}
          {status === 'offline' && <AlertCircle className="w-3 h-3" />}
          {status === 'warning' && <AlertCircle className="w-3 h-3" />}
          {stat.label}
        </span>
      </td>
    </tr>
  );
}

interface DevicesPageProps {
  availableRooms?: any[];
}

export function DevicesPage({ availableRooms = [] }: DevicesPageProps) {
  return (
    <div className="p-4 md:p-6 lg:p-8 2xl:p-10 w-full max-w-[1920px] mx-auto transition-all">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Devices</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Monitor hardware health and connectivity status
        </p>
      </div>

      {availableRooms.length === 0 ? (
        <div className="text-center py-12 border border-slate-200/60 dark:border-zinc-800 rounded-lg border-dashed">
          <p className="text-zinc-500 dark:text-zinc-400">No devices configured yet. Please add a room to track devices.</p>
        </div>
      ) : (
        <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/60 dark:border-white/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Device ID
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Assigned Room
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Wi-Fi Signal
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Sensors
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {availableRooms.map((room) => (
                <DeviceTableRow key={room.id} room={room} />
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Summary Reference */}
      {availableRooms.length > 0 && (
         <div className="mt-4 flex items-center gap-6 text-sm">
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500" />
             <span className="text-zinc-500 dark:text-zinc-400">Online (&lt; 5m)</span>
           </div>
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-amber-500" />
             <span className="text-zinc-500 dark:text-zinc-400">Unstable (5-15m)</span>
           </div>
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-zinc-500" />
             <span className="text-zinc-500 dark:text-zinc-400">Offline (&gt; 15m)</span>
           </div>
         </div>
      )}
    </div>
  );
}
