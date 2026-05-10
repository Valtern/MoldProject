import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wifi, AlertCircle, CheckCircle2, Thermometer, Droplets, Plus, Search, Loader2 } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

const wifiConfig = {
  Excellent: { icon: Wifi, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  Good: { icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  Fair: { icon: Wifi, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  Poor: { icon: Wifi, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  Offline: { icon: AlertCircle, color: 'text-zinc-500 dark:text-zinc-400', bg: 'bg-zinc-100 dark:bg-zinc-800' },
};

function getStatusConfig(t: (key: string) => string) {
  return {
    online: { label: t('devices.status.online'), className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    offline: { label: t('devices.status.offline'), className: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700' },
    warning: { label: t('devices.status.unstable'), className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  };
}

function DeviceTableRow({ room }: { room: any }) {
  const { t } = useTranslation();
  const [latestLog, setLatestLog] = useState<any>(null);
  const [status, setStatus] = useState<'online' | 'warning' | 'offline'>('offline');
  const statusConfig = getStatusConfig(t);

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
    }, (error: any) => {
      if (error?.code === 'permission-denied') {
        console.warn('[DevicesPage] Listener permission denied for', room.deviceID, ':', error.message);
      } else {
        console.error('[DevicesPage] Listener error for', room.deviceID, ':', error);
      }
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
     wifiStrengthKey = 'Good';
     wifiSignalText = t('devices.table.active');
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
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{room.deviceID || t('devices.table.unassigned')}</span>
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
          <span className="text-sm text-zinc-600">{t('devices.table.waiting')}</span>
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

// ── Claim Device Form ────────────────────────────────────────────────────────
type ClaimStatus = 'idle' | 'loading' | 'success' | 'error';

function ClaimDeviceCard() {
  const { t } = useTranslation();
  const [deviceIdInput, setDeviceIdInput] = useState('');
  const [roomNameInput, setRoomNameInput] = useState('');
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = deviceIdInput.trim();
    const trimmedName = roomNameInput.trim();

    if (!trimmedId || !trimmedName) return;

    setClaimStatus('loading');
    setErrorMessage('');

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setClaimStatus('error');
        setErrorMessage(t('devices.claimDevice.error.notLoggedIn'));
        return;
      }

      // Query the Devices collection for a matching unclaimed device.
      // The status constraint is required to satisfy Firestore's "rules are not filters"
      // principle — our security rules only permit reads where status == "unclaimed".
      const devicesRef = collection(db, 'Devices');
      const q = query(devicesRef, where('deviceID', '==', trimmedId), where('status', '==', 'unclaimed'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setClaimStatus('error');
        setErrorMessage(t('devices.claimDevice.error.notFound'));
        return;
      }

      const deviceDoc = snapshot.docs[0];

      // Claim the device: assign ownership, room name, and default analytical fields
      await updateDoc(deviceDoc.ref, {
        userId: uid,
        status: 'claimed',
        name: trimmedName,
        apiKey: trimmedId,
        safeLimit: 60,
        criticalLimit: 85,
        claimedAt: serverTimestamp(),
        appliances: [
          { id: 'fan', name: 'Exhaust Fan', icon: 'fan', state: 'auto' },
          { id: 'dehumidifier', name: 'Dehumidifier', icon: 'dehumidifier', state: 'auto' }
        ]
      });

      setClaimStatus('success');
      setDeviceIdInput('');
      setRoomNameInput('');
      toast.success(t('devices.claimDevice.success'));

      // Reset back to idle after a short delay
      setTimeout(() => setClaimStatus('idle'), 3000);

    } catch (error: any) {
      console.error('[ClaimDevice] Error:', error);
      setClaimStatus('error');

      if (error?.code === 'permission-denied') {
        setErrorMessage(t('devices.claimDevice.error.permissionDenied'));
      } else {
        setErrorMessage(t('devices.claimDevice.error.generic'));
      }
    }
  };

  return (
    <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-4 md:p-5 mb-4 md:mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Plus className="w-4 h-4 text-emerald-500" />
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t('devices.claimDevice.title')}</h2>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
        {t('devices.claimDevice.description')}
      </p>

      <form onSubmit={handleClaim} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 space-y-1.5">
          <label htmlFor="claim-device-id" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t('devices.claimDevice.deviceId')}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            <input
              id="claim-device-id"
              type="text"
              value={deviceIdInput}
              onChange={(e) => { setDeviceIdInput(e.target.value); setClaimStatus('idle'); setErrorMessage(''); }}
              placeholder={t('devices.claimDevice.deviceIdPlaceholder')}
              required
              disabled={claimStatus === 'loading'}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md pl-10 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          <label htmlFor="claim-room-name" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t('devices.claimDevice.roomName')}
          </label>
          <input
            id="claim-room-name"
            type="text"
            value={roomNameInput}
            onChange={(e) => { setRoomNameInput(e.target.value); setClaimStatus('idle'); setErrorMessage(''); }}
            placeholder={t('devices.claimDevice.roomNamePlaceholder')}
            required
            disabled={claimStatus === 'loading'}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={claimStatus === 'loading' || !deviceIdInput.trim() || !roomNameInput.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap h-[38px]"
          >
            {claimStatus === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('devices.claimDevice.claiming')}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {t('devices.claimDevice.claim')}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Status Messages */}
      {claimStatus === 'error' && errorMessage && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-400">{errorMessage}</p>
        </div>
      )}

      {claimStatus === 'success' && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-emerald-400">{t('devices.claimDevice.success')}</p>
        </div>
      )}
    </div>
  );
}

interface DevicesPageProps {
  availableRooms?: any[];
}

export function DevicesPage({ availableRooms = [] }: DevicesPageProps) {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-[1920px] mx-auto transition-all">
      <div className="px-3 py-3 md:p-6 lg:p-8 2xl:p-10">
      {/* Page Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100">{t('devices.title')}</h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {t('devices.subtitle')}
        </p>
      </div>

      {/* Claim Device Card */}
      <ClaimDeviceCard />

      {availableRooms.length === 0 ? (
        <div className="text-center py-12 border border-slate-200/60 dark:border-zinc-800 rounded-lg border-dashed">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('devices.noDevices')}</p>
        </div>
      ) : (
        <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/60 dark:border-white/5">
                <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {t('devices.table.deviceId')}
                </th>
                <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {t('devices.table.assignedRoom')}
                </th>
                <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {t('devices.table.wifiSignal')}
                </th>
                <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {t('devices.table.sensors')}
                </th>
                <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {t('devices.table.status')}
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
         <div className="mt-3 md:mt-4 flex flex-wrap gap-3 md:gap-6 text-xs md:text-sm">
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500" />
             <span className="text-zinc-500 dark:text-zinc-400">{t('devices.legend.online')}</span>
           </div>
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-amber-500" />
             <span className="text-zinc-500 dark:text-zinc-400">{t('devices.legend.unstable')}</span>
           </div>
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-zinc-500" />
             <span className="text-zinc-500 dark:text-zinc-400">{t('devices.legend.offline')}</span>
           </div>
         </div>
      )}
      </div>
    </div>
  );
}
