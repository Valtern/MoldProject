import { Thermometer, Droplets, ChevronRight } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  temperature: number;
  humidity: number;
  status: 'safe' | 'warning' | 'critical';
}

const mockRooms: Room[] = [
  { id: 'living-room', name: 'Living Room', temperature: 22, humidity: 48, status: 'safe' },
  { id: 'master-bedroom', name: 'Master Bedroom', temperature: 21, humidity: 45, status: 'safe' },
  { id: 'kitchen', name: 'Kitchen', temperature: 23, humidity: 52, status: 'safe' },
  { id: 'master-bathroom', name: 'Master Bathroom', temperature: 24, humidity: 58, status: 'safe' },
  { id: 'guest-bedroom', name: 'Guest Bedroom', temperature: 20, humidity: 42, status: 'safe' },
  { id: 'basement', name: 'Basement', temperature: 18, humidity: 78, status: 'critical' },
  { id: 'garage', name: 'Garage', temperature: 19, humidity: 65, status: 'warning' },
  { id: 'office', name: 'Office', temperature: 22, humidity: 47, status: 'safe' },
];

const statusConfig = {
  safe: { dotClass: 'bg-emerald-500', textClass: 'text-emerald-500', label: 'Safe' },
  warning: { dotClass: 'bg-amber-500', textClass: 'text-amber-500', label: 'Warning' },
  critical: { dotClass: 'bg-red-500', textClass: 'text-red-500', label: 'Critical Risk' },
};

interface RoomsPageProps {
  onRoomSelect: (roomId: string) => void;
}

export function RoomsPage({ onRoomSelect }: RoomsPageProps) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Rooms</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Monitor environmental conditions across all rooms
        </p>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockRooms.map((room) => {
          const config = statusConfig[room.status];

          return (
            <button
              key={room.id}
              onClick={() => onRoomSelect(room.id)}
              className="
                bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-left
                transition-all duration-150 hover:border-zinc-700 hover:bg-zinc-800/50
                focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50
              "
            >
              {/* Room Name */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-zinc-100">{room.name}</h3>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </div>

              {/* Temperature & Humidity */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Thermometer className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-zinc-400">{room.temperature}°C</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-zinc-400">{room.humidity}% humidity</span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
                <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
                <span className={`text-xs font-medium ${config.textClass}`}>
                  {config.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-semibold text-emerald-500">5</p>
          <p className="text-xs text-zinc-500 mt-1">Safe</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-semibold text-amber-500">1</p>
          <p className="text-xs text-zinc-500 mt-1">Warning</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-semibold text-red-500">1</p>
          <p className="text-xs text-zinc-500 mt-1">Critical</p>
        </div>
      </div>
    </div>
  );
}
