import { useState, useEffect } from 'react';
import { Sliders, Bell, Mail, Monitor, Moon, Sun } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

export function SettingsPage() {
  const [safeHumidityLimit, setSafeHumidityLimit] = useState<number | string>(60);
  const [criticalHumidityLimit, setCriticalHumidityLimit] = useState<number | string>(85);
  const [alertEmail, setAlertEmail] = useState<string>('');
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(false);
  const [rippleDisabled, setRippleDisabled] = useState(() => localStorage.getItem('moldguard-ripple-disabled') === 'true');

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const userSettingsRef = doc(db, 'Settings', uid);
    
    // Check if doc exists first before subscribing, to initialize if missing
    getDoc(userSettingsRef).then((snapshot) => {
      if (!snapshot.exists()) {
        setDoc(userSettingsRef, {
          safeHumidityLimit: 60,
          criticalHumidityLimit: 85,
          alertEmail: '',
          alertsEnabled: false,
          themePreference: 'system'
        }, { merge: true });
      }
    });

    const unsubscribe = onSnapshot(userSettingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSafeHumidityLimit(data.safeHumidityLimit ?? 60);
        setCriticalHumidityLimit(data.criticalHumidityLimit ?? 85);
        setAlertEmail(data.alertEmail ?? '');
        setAlertsEnabled(data.alertsEnabled ?? false);
        if (data.themePreference) {
          setTheme(data.themePreference);
        }
      }
    }, (error) => {
      console.error('[Settings] Listener error:', error);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('Not authenticated');
      await setDoc(doc(db, 'Settings', uid), {
        safeHumidityLimit: Number(safeHumidityLimit),
        criticalHumidityLimit: Number(criticalHumidityLimit),
        alertEmail,
        alertsEnabled,
        themePreference: theme || 'system'
      }, { merge: true });
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings.');
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 2xl:p-10 w-full max-w-4xl 2xl:max-w-5xl mx-auto transition-all">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Configure thresholds, alerts, and system appearance
        </p>
      </div>

      {/* Threshold Configuration */}
      <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Threshold Configuration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-2">
              Safe Humidity Limit (%)
            </label>
            <input
              type="number"
              value={safeHumidityLimit}
              onChange={(e) => setSafeHumidityLimit(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              min="0"
              max="100"
            />
            <p className="text-xs text-zinc-600 mt-1.5">
              Humidity below this value is considered safe
            </p>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-2">
              Critical Humidity Limit (%)
            </label>
            <input
              type="number"
              value={criticalHumidityLimit}
              onChange={(e) => setCriticalHumidityLimit(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
              min="0"
              max="100"
            />
            <p className="text-xs text-zinc-600 mt-1.5">
              Humidity above this value triggers critical alerts
            </p>
          </div>
        </div>
      </div>

      {/* Alert Preferences */}
      <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Alert Preferences</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-2">
              Email Address for Alerts
            </label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-500 dark:text-zinc-400 absolute ml-3" />
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md pl-10 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">Enable Email Alerts</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Receive automated mold warnings via email
              </p>
            </div>
            <button
              onClick={() => setAlertsEnabled(!alertsEnabled)}
              className={`
                relative w-11 h-6 rounded-full transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-emerald-500/30
                ${alertsEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}
              `}
            >
              <span
                className={`
                  absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
                  transition-transform duration-200
                  ${alertsEnabled ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Appearance</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
              theme === 'light' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <Sun className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Light</span>
          </button>
          
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
              theme === 'dark' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <Moon className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Dark</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
              theme === 'system' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <Monitor className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">System</span>
          </button>
        </div>

        {/* Click Ripple Toggle */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200/60 dark:border-white/5">
          <div>
            <p className="text-sm text-zinc-900 dark:text-zinc-100">Click Ripple Effect</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Show wave ripple animation on click</p>
          </div>
          <button
            onClick={() => {
              const next = localStorage.getItem('moldguard-ripple-disabled') !== 'true';
              localStorage.setItem('moldguard-ripple-disabled', String(next));
              setRippleDisabled(next);
            }}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
              !rippleDisabled ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
              !rippleDisabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="
            bg-emerald-500 hover:bg-emerald-600 text-zinc-950
            px-5 py-2 rounded-md text-sm font-medium
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-emerald-500/30
          "
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
