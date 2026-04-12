import { Wifi, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface Device {
  id: string;
  name: string;
  room: string;
  wifiSignal: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Offline';
  uptime: string;
  status: 'online' | 'offline' | 'warning';
}

const mockDevices: Device[] = [
  { id: '1', name: 'ESP32_01', room: 'Living Room', wifiSignal: 'Good', uptime: '14 Days', status: 'online' },
  { id: '2', name: 'ESP32_02', room: 'Master Bedroom', wifiSignal: 'Excellent', uptime: '14 Days', status: 'online' },
  { id: '3', name: 'DHT22_01', room: 'Kitchen', wifiSignal: 'Good', uptime: '7 Days', status: 'online' },
  { id: '4', name: 'DHT22_02', room: 'Basement', wifiSignal: 'Poor', uptime: '3 Days', status: 'warning' },
  { id: '5', name: 'ESP32_03', room: 'Garage', wifiSignal: 'Offline', uptime: '-', status: 'offline' },
  { id: '6', name: 'DHT22_03', room: 'Office', wifiSignal: 'Good', uptime: '12 Days', status: 'online' },
  { id: '7', name: 'ESP32_04', room: 'Master Bathroom', wifiSignal: 'Fair', uptime: '5 Days', status: 'online' },
];

const wifiConfig = {
  Excellent: { icon: Wifi, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  Good: { icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  Fair: { icon: Wifi, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  Poor: { icon: Wifi, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  Offline: { icon: AlertCircle, color: 'text-zinc-500', bg: 'bg-zinc-800' },
};

const statusConfig = {
  online: { label: 'Online', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  offline: { label: 'Offline', className: 'bg-zinc-800 text-zinc-500 border-zinc-700' },
  warning: { label: 'Warning', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
};

export function DevicesPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Devices</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Monitor hardware health and connectivity status
        </p>
      </div>

      {/* Devices Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr className="bg-zinc-950 border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Device Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Assigned Room
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Wi-Fi Signal
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Uptime
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {mockDevices.map((device) => {
              const wifi = wifiConfig[device.wifiSignal];
              const WifiIcon = wifi.icon;
              const status = statusConfig[device.status];

              return (
                <tr
                  key={device.id}
                  className={`
                    border-b border-zinc-800 last:border-b-0
                    hover:bg-zinc-800/50 transition-colors
                  `}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center">
                        <span className="text-xs font-mono text-zinc-400">IoT</span>
                      </div>
                      <span className="font-medium text-zinc-100">{device.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-zinc-400">{device.room}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md ${wifi.bg}`}>
                      <WifiIcon className={`w-3.5 h-3.5 ${wifi.color}`} />
                      <span className={`text-xs font-medium ${wifi.color}`}>
                        {device.wifiSignal}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-sm">{device.uptime}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`
                      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border
                      ${status.className}
                    `}>
                      {device.status === 'online' && (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {device.status === 'offline' && (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {device.status === 'warning' && (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-zinc-400">{mockDevices.filter(d => d.status === 'online').length} Online</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-zinc-400">{mockDevices.filter(d => d.status === 'warning').length} Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-zinc-500" />
          <span className="text-zinc-400">{mockDevices.filter(d => d.status === 'offline').length} Offline</span>
        </div>
      </div>
    </div>
  );
}
