import { useState, useEffect } from 'react';
import { AlertTriangle, Activity, Clock, ShieldCheck, Thermometer, Droplets, Zap } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function ReportsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  // Bar Chart State
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // 1. Alerts Subscriber
    const alertsRef = collection(db, 'AnalyticsAlerts');
    const qAlerts = query(alertsRef, orderBy('timestamp', 'desc'));
    
    const unsubscribeAlerts = onSnapshot(qAlerts, (snapshot) => {
      const parsedAlerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlerts(parsedAlerts);
    }, (error) => {
      console.error('[Reports] Alerts listener error:', error);
    });

    // 2. Recent Activity Subscriber
    const logsRef = collection(db, 'SensorLogs');
    const qLogs = query(logsRef, orderBy('timestamp', 'desc'), limit(10));
    
    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
      const parsedLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentActivity(parsedLogs);
    }, (error) => {
      console.error('[Reports] Activity listener error:', error);
    });

    return () => {
      unsubscribeAlerts();
      unsubscribeLogs();
    };
  }, []);

  // 3. Historical Data Subscriber (Timeframe-dependent)
  useEffect(() => {
    let daysToSubtract = 1;
    if (timeframe === '7d') daysToSubtract = 7;
    if (timeframe === '30d') daysToSubtract = 30;

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysToSubtract);

    const logsRef = collection(db, 'SensorLogs');
    const q = query(
      logsRef,
      where('timestamp', '>=', thresholdDate),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const grouped: Record<string, { timeLabel: string, sumHum: number, sumTemp: number, count: number }> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
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
    }, (error) => {
      console.error('[Reports] Chart listener error:', error);
    });

    return () => unsubscribe();
  }, [timeframe]);


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
    <div className="p-4 md:p-6 lg:p-8 2xl:p-10 w-full max-w-[1920px] mx-auto transition-all">
      <div className="grid grid-cols-1 xl:grid-cols-3 3xl:grid-cols-4 gap-6 2xl:gap-8 transition-all">
        
        {/* Left Column: Predictive Alerts Sidebar (xl:col-span-1) */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">Predictive Alerts</h2>
          </div>
          
          {alerts.length === 0 ? (
            <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-8 flex flex-col items-center justify-center text-center">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mb-3" />
              <p className="text-zinc-900 dark:text-zinc-100 font-medium">No active risks</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Our predictive models indicate all rooms are perfectly safe.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border shadow-lg dark:shadow-xl rounded-lg p-4 transition-colors ${
                    alert.riskLevel === 'High' 
                      ? 'border-red-500/50' 
                      : 'border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium outline outline-1 outline-transparent ${
                        alert.riskLevel === 'High' 
                          ? 'bg-red-500/10 text-red-500 outline-red-500/20' 
                          : 'bg-amber-500/10 text-amber-500 outline-amber-500/20'
                      }`}>
                        {alert.riskLevel} Risk
                      </span>
                      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-2">
                        {alert.deviceID}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {alert.message}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">
                        {formatLocalTime(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                  {alert.averageHumidity && (
                     <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between text-sm">
                       <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                         <Droplets className="w-3.5 h-3.5" /> Avg Humidity
                       </span>
                       <span className={`font-medium ${alert.averageHumidity > 65 ? 'text-red-400' : 'text-amber-400'}`}>
                         {alert.averageHumidity}%
                       </span>
                     </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Main View (xl:col-span-2, 3xl:col-span-3) */}
        <div className="xl:col-span-2 3xl:col-span-3 flex flex-col gap-6 2xl:gap-8">
          
          {/* Top: Page Header & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Reports</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Historical analysis and predictive insights
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
                <Activity className="w-4 h-4" /> Trend Aggregation ({timeframe})
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-zinc-500 dark:text-zinc-400">Humidity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-zinc-500 dark:text-zinc-400">Temperature</span>
                </div>
              </div>
            </div>

            <div className="h-64">
              {chartData.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 text-sm">
                  <p>Waiting for database index calculation...</p>
                  <p className="mt-1 text-xs opacity-75">Verify console permissions if this persists.</p>
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
              <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">Global Stream</h2>
            </div>
            
            <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg overflow-hidden">
              {recentActivity.length === 0 ? (
                 <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                   Waiting for IoT hardware data limit(10)...
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
  );
}
