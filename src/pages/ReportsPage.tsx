import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Activity, Clock, ShieldCheck, Thermometer, Droplets, Sun, Zap, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── Chunking Utility ─────────────────────────────────────────────────────────
// Splits an array into smaller arrays of at most `size` elements.
// This bypasses the Firestore 'in' operator's 10-item limit.
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ── Timestamp helper ─────────────────────────────────────────────────────────
// Converts a Firestore Timestamp or Date-like value to epoch ms for sorting.
function toEpoch(timestamp: any): number {
  if (!timestamp) return 0;
  if (typeof timestamp.toMillis === 'function') return timestamp.toMillis();
  if (typeof timestamp.toDate === 'function') return timestamp.toDate().getTime();
  return new Date(timestamp).getTime();
}

const FIRESTORE_IN_LIMIT = 10;

// ── Severity Color Helper ────────────────────────────────────────────────────
// Returns a Tailwind background class based on the probability percentage.
function severityBarColor(value: number): string {
  if (value >= 80) return 'bg-red-500';
  if (value >= 40) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function severityTextColor(value: number): string {
  if (value >= 80) return 'text-red-400';
  if (value >= 40) return 'text-amber-400';
  return 'text-emerald-400';
}

function severityBorderColor(value: number): string {
  if (value >= 80) return 'border-red-500/50';
  if (value >= 40) return 'border-amber-500/30';
  return 'border-emerald-500/30';
}

interface ReportsPageProps {
  availableRooms: any[];
}

export function ReportsPage({ availableRooms }: ReportsPageProps) {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  // Bar Chart State
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [chartData, setChartData] = useState<any[]>([]);

  // Predictive Alerts Pagination
  const ALERTS_PER_PAGE = 5;
  const [alertPage, setAlertPage] = useState(0);

  // Derive the user's device IDs from their isolated rooms
  const userDeviceIds = availableRooms.map(room => room.deviceID).filter(Boolean);

  // ── 1 & 2. Alerts + Recent Activity (real-time listeners, chunked) ─────────
  useEffect(() => {
    if (userDeviceIds.length === 0) {
      console.log('[Reports] No device IDs available — skipping alert/activity listeners.');
      setAlerts([]);
      setRecentActivity([]);
      return;
    }

    console.log('[Reports] Setting up listeners for device IDs:', userDeviceIds);
    const chunks = chunkArray(userDeviceIds, FIRESTORE_IN_LIMIT);

    // 3-month cutoff — alerts older than this will be hidden
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const threeMonthsCutoff = threeMonthsAgo.getTime();

    // We accumulate partial results per-chunk and merge on every snapshot update.
    const alertsByChunk: Record<number, any[]> = {};
    const logsByChunk: Record<number, any[]> = {};
    const unsubscribers: (() => void)[] = [];

    chunks.forEach((chunk, idx) => {
      // --- Alerts listener for this chunk ---
      // NOTE: We intentionally omit orderBy to avoid requiring a composite index.
      // Sorting is performed client-side after merging all chunks.
      const alertsRef = collection(db, 'AnalyticsAlerts');
      const qAlerts = query(
        alertsRef,
        where('deviceID', 'in', chunk)
      );

      const unsubAlerts = onSnapshot(qAlerts, (snapshot) => {
        alertsByChunk[idx] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Merge all chunks, filter out alerts older than 3 months, then sort descending
        const merged = Object.values(alertsByChunk).flat();
        const filtered = merged.filter(alert => toEpoch(alert.timestamp) >= threeMonthsCutoff);
        filtered.sort((a, b) => toEpoch(b.timestamp) - toEpoch(a.timestamp));

        console.log('[Reports] Alerts fetched:', filtered.length, 'of', merged.length, '(after 3-month filter)');
        setAlerts(filtered);
      }, (error: any) => {
        if (error?.code === 'permission-denied') {
          console.warn(`[Reports] Alerts chunk ${idx} permission denied — check security rules:`, error.message);
        } else if (error?.message?.includes('index') || error?.code === 'failed-precondition') {
          console.warn(`[Reports] Alerts chunk ${idx} requires Firestore index:`, error.message);
        } else {
          console.error(`[Reports] Alerts chunk ${idx} listener error:`, error);
        }
      });
      unsubscribers.push(unsubAlerts);

      // --- Recent Activity listener for this chunk ---
      const logsRef = collection(db, 'SensorLogs');
      const qLogs = query(
        logsRef,
        where('deviceID', 'in', chunk),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      const unsubLogs = onSnapshot(qLogs, (snapshot) => {
        logsByChunk[idx] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Merge all chunks, re-sort descending, then trim to 10 most recent
        const merged = Object.values(logsByChunk).flat();
        merged.sort((a, b) => toEpoch(b.timestamp) - toEpoch(a.timestamp));
        setRecentActivity(merged.slice(0, 10));
      }, (error: any) => {
        if (error?.code === 'permission-denied') {
          console.warn(`[Reports] Activity chunk ${idx} permission denied — check security rules:`, error.message);
        } else if (error?.message?.includes('index') || error?.code === 'failed-precondition') {
          console.warn(`[Reports] Activity chunk ${idx} requires Firestore index:`, error.message);
        } else {
          console.error(`[Reports] Activity chunk ${idx} listener error:`, error);
        }
      });
      unsubscribers.push(unsubLogs);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [userDeviceIds.join(',')]);

  // ── 3. Historical Chart Data (one-shot chunked queries via Promise.all) ────
  useEffect(() => {
    if (userDeviceIds.length === 0) {
      setChartData([]);
      return;
    }

    let cancelled = false;

    let daysToSubtract = 1;
    if (timeframe === '7d') daysToSubtract = 7;
    if (timeframe === '30d') daysToSubtract = 30;

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysToSubtract);

    const chunks = chunkArray(userDeviceIds, FIRESTORE_IN_LIMIT);

    // Fire one getDocs per chunk in parallel
    const chunkPromises = chunks.map((chunk) => {
      const logsRef = collection(db, 'SensorLogs');
      const q = query(
        logsRef,
        where('deviceID', 'in', chunk),
        where('timestamp', '>=', thresholdDate),
        orderBy('timestamp', 'asc')
      );
      return getDocs(q);
    });

    Promise.all(chunkPromises)
      .then((snapshots) => {
        if (cancelled) return;

        // Flatten all docs from all chunks into a single array
        const allDocs = snapshots.flatMap(snap =>
          snap.docs.map(doc => doc.data())
        );

        // Sort ascending by timestamp before grouping
        allDocs.sort((a, b) => toEpoch(a.timestamp) - toEpoch(b.timestamp));

        // Group into time buckets
        const grouped: Record<string, { timeLabel: string, sumHum: number, sumTemp: number, count: number }> = {};

        allDocs.forEach(data => {
          if (!data.timestamp) return;
          const d = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);

          let key = '';
          if (timeframe === '24h') {
            key = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
          } else {
            key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          }

          if (!grouped[key]) {
            grouped[key] = { timeLabel: key, sumHum: 0, sumTemp: 0, count: 0 };
          }
          grouped[key].sumHum += (data.humidity || 0);
          grouped[key].sumTemp += (data.temperature || 0);
          grouped[key].count += 1;
        });

        const aggregated = Object.values(grouped).map((g) => ({
          timeLabel: g.timeLabel,
          humidity: Math.round(g.sumHum / g.count),
          temperature: Math.round(g.sumTemp / g.count)
        }));

        setChartData(aggregated);
      })
      .catch((error: any) => {
        if (error?.code === 'permission-denied') {
          console.warn('[Reports] Chart query permission denied — check security rules:', error.message);
        } else if (error?.message?.includes('index') || error?.code === 'failed-precondition') {
          console.warn('[Reports] Chart query requires Firestore index:', error.message);
        } else {
          console.error('[Reports] Chart chunked query error:', error);
        }
      });

    return () => { cancelled = true; };
  }, [timeframe, userDeviceIds.join(',')]);


  const formatTimeAgo = (date: any) => {
    if (!date) return 'Just now';
    const d = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const formatLocalTime = (date: any) => {
    if (!date) return 'Unknown';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  // ── Predictive Alert Dismiss Handler ────────────────────────────────────────
  const handleDismissAlert = async (alertId: string) => {
    try {
      await deleteDoc(doc(db, 'AnalyticsAlerts', alertId));
      toast.success(t('reports.alertDismissed'));
    } catch (error) {
      console.error('[Reports] Failed to dismiss alert:', error);
      toast.error(t('reports.alertDismissFailed'));
    }
  };

  // ── Pagination Derived Values ───────────────────────────────────────────────
  const totalAlertPages = Math.max(1, Math.ceil(alerts.length / ALERTS_PER_PAGE));
  const paginatedAlerts = alerts.slice(alertPage * ALERTS_PER_PAGE, (alertPage + 1) * ALERTS_PER_PAGE);

  // Reset to first page if current page is out of bounds (e.g. after dismissals)
  useEffect(() => {
    if (alertPage >= totalAlertPages) {
      setAlertPage(Math.max(0, totalAlertPages - 1));
    }
  }, [alerts.length]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 shadow-lg z-50">
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">{label}</p>
          <div className="flex flex-col gap-1 mt-2">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
                {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}: {entry.value}{entry.name === 'humidity' ? '%' : '°C'}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto transition-all">
      <div className="px-3 py-3 md:p-6 lg:p-8 2xl:p-10">
      <div className="grid grid-cols-1 xl:grid-cols-3 3xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6 2xl:gap-8 transition-all">
        
        {/* Left Column: Predictive Alerts Sidebar (xl:col-span-1) */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{t('reports.predictiveAlerts')}</h2>
          </div>
          
          {alerts.length === 0 ? (
            <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-8 flex flex-col items-center justify-center text-center">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mb-3" />
              <p className="text-zinc-900 dark:text-zinc-100 font-medium">{t('reports.noActiveRisks')}</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">{t('reports.allRoomsSafe')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {paginatedAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border shadow-lg dark:shadow-xl rounded-lg p-4 transition-colors ${severityBorderColor(Math.max(alert.generalMoldProbability ?? 0, alert.blackMoldProbability ?? 0))}`}
                >
                  {/* Header Row: Device ID, Time, Dismiss */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {alert.deviceID}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {alert.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">
                        {formatLocalTime(alert.timestamp)}
                      </span>
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title={t('reports.dismissAlert')}
                      >
                        <X className="w-3 h-3" />
                        {t('reports.dismiss')}
                      </button>
                    </div>
                  </div>

                  {/* Dual Probability Progress Bars */}
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-zinc-800 flex flex-col gap-2.5">
                    {/* General Mold Risk */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{t('reports.generalMoldRisk')}</span>
                        <span className={`text-xs font-semibold ${severityTextColor(alert.generalMoldProbability ?? 0)}`}>
                          {(alert.generalMoldProbability ?? 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-200/60 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${severityBarColor(alert.generalMoldProbability ?? 0)}`}
                          style={{ width: `${Math.min(100, Math.max(0, alert.generalMoldProbability ?? 0))}%` }}
                        />
                      </div>
                    </div>

                    {/* Toxic Black Mold Risk */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{t('reports.blackMoldRisk')}</span>
                        <span className={`text-xs font-semibold ${severityTextColor(alert.blackMoldProbability ?? 0)}`}>
                          {(alert.blackMoldProbability ?? 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-200/60 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${severityBarColor(alert.blackMoldProbability ?? 0)}`}
                          style={{ width: `${Math.min(100, Math.max(0, alert.blackMoldProbability ?? 0))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Compact 24h Environmental Averages */}
                  {(alert.averageTemperature != null || alert.averageHumidity != null || alert.averageLightLevel != null) && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between gap-2">
                      {alert.averageTemperature != null && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <Thermometer className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          {alert.averageTemperature.toFixed(1)}°C
                        </span>
                      )}
                      {alert.averageHumidity != null && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <Droplets className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          {alert.averageHumidity.toFixed(1)}%
                        </span>
                      )}
                      {alert.averageLightLevel != null && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <Sun className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                          {alert.averageLightLevel.toFixed(1)} lux
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination Controls */}
              {alerts.length > ALERTS_PER_PAGE && (
                <div className="flex items-center justify-between mt-1">
                  <button
                    onClick={() => setAlertPage(p => Math.max(0, p - 1))}
                    disabled={alertPage === 0}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    {t('reports.previous')}
                  </button>
                  <span className="text-xs text-zinc-500">
                    {alertPage + 1} / {totalAlertPages}
                  </span>
                  <button
                    onClick={() => setAlertPage(p => Math.min(totalAlertPages - 1, p + 1))}
                    disabled={alertPage >= totalAlertPages - 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('reports.next')}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Main View (xl:col-span-2, 3xl:col-span-3) */}
        <div className="xl:col-span-2 3xl:col-span-3 flex flex-col gap-6 2xl:gap-8">
          
          {/* Top: Page Header & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100">{t('reports.title')}</h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {t('reports.subtitle')}
              </p>
            </div>
            <div className="flex bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 p-1 rounded-lg">
              {(['24h', '7d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeframe(range)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    timeframe === range
                      ? 'bg-slate-200/80 dark:bg-zinc-700/80 text-slate-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Middle: Historical Bar Chart */}
          <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <Activity className="w-4 h-4" /> {t('reports.trendAggregation')} ({timeframe})
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-zinc-500 dark:text-zinc-400">{t('reports.humidity')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-zinc-500 dark:text-zinc-400">{t('reports.temperature')}</span>
                </div>
              </div>
            </div>

            <div className="h-64">
              {chartData.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 text-sm">
                  <p>{t('reports.waitingIndex')}</p>
                  <p className="mt-1 text-xs opacity-75">{t('reports.checkConsole')}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis 
                      dataKey="timeLabel" 
                      stroke="#3f3f46" 
                      tick={{ fill: '#71717a', fontSize: 10 }} 
                      tickLine={false} 
                      axisLine={{ stroke: '#27272a' }} 
                    />
                    <YAxis 
                      yAxisId="humidity"
                      stroke="#3f3f46" 
                      tick={{ fill: '#71717a', fontSize: 11 }} 
                      tickLine={false} 
                      axisLine={{ stroke: '#27272a' }}
                      domain={[0, 100]}
                    />
                    <YAxis 
                      yAxisId="temp"
                      orientation="right"
                      stroke="#3f3f46" 
                      tick={{ fill: '#71717a', fontSize: 11 }} 
                      tickLine={false} 
                      axisLine={{ stroke: '#27272a' }}
                      domain={[0, 50]}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeDasharray: '3 3' }} />
                    <Area
                      yAxisId="humidity"
                      type="monotone"
                      dataKey="humidity"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#humidityGradient)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#10b981', stroke: '#18181b', strokeWidth: 2 }}
                      animationDuration={800}
                    />
                    <Area
                      yAxisId="temp"
                      type="monotone"
                      dataKey="temperature"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#tempGradient)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#f59e0b', stroke: '#18181b', strokeWidth: 2 }}
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bottom: Recent Activity Feed */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{t('reports.globalStream')}</h2>
            </div>
            
            <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg overflow-hidden">
              {recentActivity.length === 0 ? (
                 <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                   {t('reports.waitingData')}
                 </div>
              ) : (
                 <div className="divide-y divide-slate-200/60 dark:divide-zinc-800/50">
                   {recentActivity.map((log) => (
                     <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-zinc-800/50 transition-colors">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                           <Zap className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                         </div>
                         <div>
                           <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{log.deviceID}</p>
                           <div className="flex items-center gap-3 mt-0.5">
                             <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1"><Thermometer className="w-3 h-3"/> {log.temperature ?? '--'}°C</span>
                             <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1"><Droplets className="w-3 h-3"/> {log.humidity ?? '--'}%</span>
                           </div>
                         </div>
                       </div>
                       <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                         <Clock className="w-3 h-3" />
                         {formatTimeAgo(log.timestamp)}
                       </div>
                     </div>
                   ))}
                 </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
      </div>
    </div>
  );
}
