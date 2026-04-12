import { useState } from 'react';
import { Copy, Check, Mail, Bell, Key, Sliders } from 'lucide-react';

export function SettingsPage() {
  const [safeHumidityLimit, setSafeHumidityLimit] = useState('60');
  const [criticalHumidityLimit, setCriticalHumidityLimit] = useState('70');
  const [email, setEmail] = useState('admin@example.com');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [copied, setCopied] = useState(false);

  const apiKey = 'sk-moldguard-7f8a9b2c3d4e5f6g7h8i9j0k1l2m3n4o';

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    // Simulate save action
    alert('Settings saved successfully!');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Configure thresholds, alerts, and system integration
        </p>
      </div>

      {/* Threshold Configuration */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-medium text-zinc-100">Threshold Configuration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-2">
              Safe Humidity Limit (%)
            </label>
            <input
              type="number"
              value={safeHumidityLimit}
              onChange={(e) => setSafeHumidityLimit(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              min="0"
              max="100"
            />
            <p className="text-xs text-zinc-600 mt-1.5">
              Humidity below this value is considered safe
            </p>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-2">
              Critical Humidity Limit (%)
            </label>
            <input
              type="number"
              value={criticalHumidityLimit}
              onChange={(e) => setCriticalHumidityLimit(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-medium text-zinc-100">Alert Preferences</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-2">
              Email Address for Alerts
            </label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-500 absolute ml-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-10 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm text-zinc-100">Enable Email Alerts</p>
              <p className="text-xs text-zinc-500 mt-0.5">
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

      {/* System Integration */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-medium text-zinc-100">System Integration</h2>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-2">
            API Key
          </label>
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={apiKey}
              readOnly
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-500 font-mono"
            />
            <button
              onClick={handleCopyApiKey}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                transition-colors duration-150
                ${copied
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                }
              `}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-zinc-600 mt-1.5">
            Use this key to integrate with external systems and services
          </p>
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
