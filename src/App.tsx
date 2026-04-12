import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Sidebar } from '@/components/Sidebar';
import { StatusBanner } from '@/components/StatusBanner';
import { StatCard } from '@/components/StatCard';
import { HumidityChart } from '@/components/HumidityChart';
import { ApplianceControlPanel } from '@/components/ApplianceControlPanel';
import { RoomsPage } from '@/pages/RoomsPage';
import { DevicesPage } from '@/pages/DevicesPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import type { RoomData, HumidityDataPoint } from '@/types';

// Generate mock humidity data for 24 hours
function generateHumidityData(baseHumidity: number): HumidityDataPoint[] {
  const data: HumidityDataPoint[] = [];

  for (let i = 0; i <= 24; i++) {
    const hour = i % 24;
    const time = `${hour.toString().padStart(2, '0')}:00`;
    const timeFactor = Math.sin((hour - 6) * Math.PI / 12) * 12;
    const randomFactor = (Math.random() - 0.5) * 8;
    const humidity = Math.max(30, Math.min(80, Math.round(baseHumidity + timeFactor + randomFactor)));
    data.push({ time, humidity });
  }

  return data;
}

// Mock data for all rooms
const roomsData: Record<string, RoomData> = {
  'living-room': {
    name: 'Living Room',
    status: 'safe',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: { value: 22, min: 0, max: 50, unit: '°C', label: 'Temperature', caption: 'Comfortable' },
    humidity: { value: 48, min: 0, max: 100, unit: '%', label: 'Humidity', caption: 'Optimal' },
    lightLevel: { value: 320, min: 0, max: 1000, unit: 'lux', label: 'Light Level', caption: 'Well-lit' },
    humidityHistory: generateHumidityData(48),
    appliances: [
      { id: 'fan', name: 'Exhaust Fan', icon: 'fan', state: 'auto' },
      { id: 'dehumidifier', name: 'Dehumidifier', icon: 'dehumidifier', state: 'auto' },
    ],
  },
  'master-bedroom': {
    name: 'Master Bedroom',
    status: 'safe',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: { value: 21, min: 0, max: 50, unit: '°C', label: 'Temperature', caption: 'Comfortable' },
    humidity: { value: 45, min: 0, max: 100, unit: '%', label: 'Humidity', caption: 'Optimal' },
    lightLevel: { value: 180, min: 0, max: 1000, unit: 'lux', label: 'Light Level', caption: 'Moderate' },
    humidityHistory: generateHumidityData(45),
    appliances: [
      { id: 'fan', name: 'Exhaust Fan', icon: 'fan', state: 'auto' },
      { id: 'dehumidifier', name: 'Dehumidifier', icon: 'dehumidifier', state: 'auto' },
    ],
  },
  'kitchen': {
    name: 'Kitchen',
    status: 'safe',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: { value: 23, min: 0, max: 50, unit: '°C', label: 'Temperature', caption: 'Warm' },
    humidity: { value: 52, min: 0, max: 100, unit: '%', label: 'Humidity', caption: 'Optimal' },
    lightLevel: { value: 450, min: 0, max: 1000, unit: 'lux', label: 'Light Level', caption: 'Bright' },
    humidityHistory: generateHumidityData(52),
    appliances: [
      { id: 'fan', name: 'Range Hood Fan', icon: 'fan', state: 'auto' },
      { id: 'dehumidifier', name: 'Dehumidifier', icon: 'dehumidifier', state: 'auto' },
    ],
  },
  'master-bathroom': {
    name: 'Master Bathroom',
    status: 'safe',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: { value: 24, min: 0, max: 50, unit: '°C', label: 'Temperature', caption: 'Warm' },
    humidity: { value: 58, min: 0, max: 100, unit: '%', label: 'Humidity', caption: 'Optimal' },
    lightLevel: { value: 280, min: 0, max: 1000, unit: 'lux', label: 'Light Level', caption: 'Well-lit' },
    humidityHistory: generateHumidityData(58),
    appliances: [
      { id: 'fan', name: 'Exhaust Fan', icon: 'fan', state: 'auto' },
      { id: 'dehumidifier', name: 'Dehumidifier', icon: 'dehumidifier', state: 'manual-on' },
    ],
  },
  'guest-bedroom': {
    name: 'Guest Bedroom',
    status: 'safe',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: { value: 20, min: 0, max: 50, unit: '°C', label: 'Temperature', caption: 'Cool' },
    humidity: { value: 42, min: 0, max: 100, unit: '%', label: 'Humidity', caption: 'Dry' },
    lightLevel: { value: 150, min: 0, max: 1000, unit: 'lux', label: 'Light Level', caption: 'Dim' },
    humidityHistory: generateHumidityData(42),
    appliances: [
      { id: 'fan', name: 'Exhaust Fan', icon: 'fan', state: 'auto' },
      { id: 'dehumidifier', name: 'Dehumidifier', icon: 'dehumidifier', state: 'auto' },
    ],
  },
  'basement': {
    name: 'Basement',
    status: 'critical',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: { value: 18, min: 0, max: 50, unit: '°C', label: 'Temperature', caption: 'Cool' },
    humidity: { value: 78, min: 0, max: 100, unit: '%', label: 'Humidity', caption: 'Critical' },
    lightLevel: { value: 80, min: 0, max: 1000, unit: 'lux', label: 'Light Level', caption: 'Dim' },
    humidityHistory: generateHumidityData(78),
    appliances: [
      { id: 'fan', name: 'Exhaust Fan', icon: 'fan', state: 'manual-on' },
      { id: 'dehumidifier', name: 'Dehumidifier', icon: 'dehumidifier', state: 'manual-on' },
    ],
  },
  'garage': {
    name: 'Garage',
    status: 'warning',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: { value: 19, min: 0, max: 50, unit: '°C', label: 'Temperature', caption: 'Cool' },
    humidity: { value: 65, min: 0, max: 100, unit: '%', label: 'Humidity', caption: 'Elevated' },
    lightLevel: { value: 200, min: 0, max: 1000, unit: 'lux', label: 'Light Level', caption: 'Moderate' },
    humidityHistory: generateHumidityData(65),
    appliances: [
      { id: 'fan', name: 'Ventilation Fan', icon: 'fan', state: 'auto' },
      { id: 'dehumidifier', name: 'Dehumidifier', icon: 'dehumidifier', state: 'auto' },
    ],
  },
  'office': {
    name: 'Office',
    status: 'safe',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: { value: 22, min: 0, max: 50, unit: '°C', label: 'Temperature', caption: 'Comfortable' },
    humidity: { value: 47, min: 0, max: 100, unit: '%', label: 'Humidity', caption: 'Optimal' },
    lightLevel: { value: 380, min: 0, max: 1000, unit: 'lux', label: 'Light Level', caption: 'Well-lit' },
    humidityHistory: generateHumidityData(47),
    appliances: [
      { id: 'fan', name: 'Exhaust Fan', icon: 'fan', state: 'auto' },
      { id: 'dehumidifier', name: 'Dehumidifier', icon: 'dehumidifier', state: 'auto' },
    ],
  },
};

// Navigation context to share between Sidebar and App
export type PageId = 'dashboard' | 'rooms' | 'devices' | 'reports' | 'settings';

function DashboardPage({
  roomData,
  onApplianceStateChange,
}: {
  roomData: RoomData;
  onApplianceStateChange: (id: string, turnOn: boolean) => void;
}) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Status Banner */}
      <section className="mb-6">
        <StatusBanner
          roomName={roomData.name}
          status={roomData.status}
          lastUpdated={roomData.lastUpdated}
        />
      </section>

      {/* Stats Row */}
      <section className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            data={roomData.temperature}
            index={0}
            status={roomData.status}
          />
          <StatCard
            data={roomData.humidity}
            index={1}
            status={roomData.status}
          />
          <StatCard
            data={roomData.lightLevel}
            index={2}
            status="safe"
          />
        </div>
      </section>

      {/* Chart and Control Panel Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Humidity Chart - takes 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <HumidityChart data={roomData.humidityHistory} />
        </div>

        {/* Appliance Control Panel - takes 1/3 width on large screens */}
        <div className="lg:col-span-1">
          <ApplianceControlPanel
            appliances={roomData.appliances}
            onStateChange={onApplianceStateChange}
          />
        </div>
      </section>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [roomData, setRoomData] = useState<RoomData>(roomsData['living-room']);

  // Handle room selection from Rooms page
  const handleRoomSelect = useCallback((roomId: string) => {
    const selectedRoom = roomsData[roomId];
    if (selectedRoom) {
      setRoomData(selectedRoom);
      setCurrentPage('dashboard');
    }
  }, []);

  // Handle appliance state changes
  const handleApplianceStateChange = useCallback((id: string, turnOn: boolean) => {
    setRoomData((prev) => ({
      ...prev,
      appliances: prev.appliances.map((app) =>
        app.id === id
          ? { ...app, state: turnOn ? 'manual-on' : 'manual-off' }
          : app
      ),
    }));
  }, []);

  // Listen to real-time updates from Firestore
  useEffect(() => {
    if (currentPage !== 'dashboard') return;

    const sensorLogsRef = collection(db, 'SensorLogs');
    const q = query(sensorLogsRef, orderBy('timestamp', 'desc'), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        
        setRoomData((prev) => {
          // Fallback to previous values if fields are missing in DB
          const newTemp = data.temperature ?? prev.temperature.value;
          const newHumidity = data.humidity ?? prev.humidity.value;
          const newLight = data.lightLevel ?? prev.lightLevel.value;

          let newStatus: 'safe' | 'warning' | 'critical' = 'safe';
          if (newHumidity > 70) {
            newStatus = 'critical';
          } else if (newHumidity > 60) {
            newStatus = 'warning';
          }

          let formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (data.timestamp?.toDate) {
             formattedTime = data.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }

          return {
            ...prev,
            status: newStatus,
            lastUpdated: formattedTime,
            temperature: {
              ...prev.temperature,
              value: Math.round(newTemp * 10) / 10,
              caption: newTemp < 18 ? 'Cool' : newTemp > 26 ? 'Warm' : 'Comfortable',
            },
            humidity: {
              ...prev.humidity,
              value: Math.round(newHumidity),
              caption: newHumidity < 40 ? 'Dry' : newHumidity > 60 ? 'Humid' : 'Optimal',
            },
            lightLevel: {
              ...prev.lightLevel,
              value: Math.round(newLight),
              caption: newLight < 100 ? 'Dim' : newLight > 500 ? 'Bright' : 'Moderate',
            },
          };
        });
      }
    });

    return () => unsubscribe();
  }, [currentPage]);

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardPage
            roomData={roomData}
            onApplianceStateChange={handleApplianceStateChange}
          />
        );
      case 'rooms':
        return <RoomsPage onRoomSelect={handleRoomSelect} />;
      case 'devices':
        return <DevicesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <DashboardPage
            roomData={roomData}
            onApplianceStateChange={handleApplianceStateChange}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Main Content */}
      <main className="ml-56 min-h-screen">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
