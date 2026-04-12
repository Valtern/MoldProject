import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
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
import type { RoomData } from '@/types';

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
          <HumidityChart data={roomData.humidityHistory || []} />
        </div>

        {/* Appliance Control Panel - takes 1/3 width on large screens */}
        <div className="lg:col-span-1">
          <ApplianceControlPanel
            appliances={roomData.appliances || []}
            onStateChange={onApplianceStateChange}
          />
        </div>
      </section>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [roomData, setRoomData] = useState<RoomData | null>(null);

  // Listen to available rooms from Devices collection
  useEffect(() => {
    const devicesRef = collection(db, 'Devices');
    const unsubscribe = onSnapshot(devicesRef, (snapshot) => {
      const rooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailableRooms(rooms);
      
      // If we don't have a roomData selected yet, default to the first room
      if (rooms.length > 0) {
        setRoomData((prev) => {
          if (!prev || !rooms.find(r => r.id === prev.id)) {
            // Re-hydrate the core schema locally to prevent undefined prop errors
            const freshRoom = rooms[0];
            return {
              id: freshRoom.id,
              name: freshRoom.name,
              deviceID: freshRoom.deviceID,
              safeLimit: freshRoom.safeLimit,
              criticalLimit: freshRoom.criticalLimit,
              status: 'safe',
              lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              temperature: { value: 0, min: 0, max: 50, unit: '°C', label: 'Temperature', caption: 'Pending' },
              humidity: { value: 0, min: 0, max: 100, unit: '%', label: 'Humidity', caption: 'Pending' },
              lightLevel: { value: 0, min: 0, max: 1000, unit: 'lux', label: 'Light Level', caption: 'Pending' },
              humidityHistory: [],
              appliances: freshRoom.appliances || [],
            } as any;
          }
          return prev;
        });
      } else {
        setRoomData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle room selection from Rooms page
  const handleRoomSelect = useCallback((roomId: string) => {
    const selectedRoom = availableRooms.find(r => r.id === roomId);
    if (selectedRoom) {
      setRoomData({
        id: selectedRoom.id,
        name: selectedRoom.name,
        deviceID: selectedRoom.deviceID,
        safeLimit: selectedRoom.safeLimit,
        criticalLimit: selectedRoom.criticalLimit,
        status: 'safe',
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: { value: 0, min: 0, max: 50, unit: '°C', label: 'Temperature', caption: 'Pending' },
        humidity: { value: 0, min: 0, max: 100, unit: '%', label: 'Humidity', caption: 'Pending' },
        lightLevel: { value: 0, min: 0, max: 1000, unit: 'lux', label: 'Light Level', caption: 'Pending' },
        humidityHistory: [],
        appliances: selectedRoom.appliances || [],
      } as any);
      setCurrentPage('dashboard');
    }
  }, [availableRooms]);

  // Handle appliance state changes
  const handleApplianceStateChange = useCallback((id: string, turnOn: boolean) => {
    setRoomData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        appliances: prev.appliances.map((app) =>
          app.id === id
            ? { ...app, state: turnOn ? 'manual-on' : 'manual-off' }
            : app
        ),
      };
    });
  }, []);

  // Listen to real-time updates from Firestore for the selected room
  useEffect(() => {
    if (currentPage !== 'dashboard' || !roomData?.deviceID) return;

    const sensorLogsRef = collection(db, 'SensorLogs');
    const q = query(
      sensorLogsRef,
      where('deviceID', '==', roomData.deviceID),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        
        setRoomData((prev) => {
          if (!prev) return prev;
          
          const newTemp = data.temperature ?? prev.temperature.value;
          const newHumidity = data.humidity ?? prev.humidity.value;
          const newLight = data.lightLevel ?? prev.lightLevel.value;

          const safeLimit = (prev as any).safeLimit ?? 60;
          const criticalLimit = (prev as any).criticalLimit ?? 85;

          let newStatus: 'safe' | 'warning' | 'critical' = 'safe';
          if (newHumidity >= criticalLimit) {
            newStatus = 'critical';
          } else if (newHumidity >= safeLimit) {
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
              caption: newHumidity < 40 ? 'Dry' : newHumidity >= safeLimit ? 'Humid' : 'Optimal',
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
  }, [currentPage, roomData?.deviceID]);

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        if (!roomData) {
          return (
            <div className="p-6 max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-medium text-zinc-100">Welcome to MoldyBase</h2>
                <p className="text-zinc-400">Please add a room to begin monitoring.</p>
                <button
                  onClick={() => setCurrentPage('rooms')}
                  className="px-4 py-2 bg-emerald-500 text-white rounded font-medium hover:bg-emerald-600 transition-colors"
                >
                  Manage Rooms
                </button>
              </div>
            </div>
          );
        }
        return (
          <DashboardPage
            roomData={roomData}
            onApplianceStateChange={handleApplianceStateChange}
          />
        );
      case 'rooms':
        return <RoomsPage availableRooms={availableRooms} onRoomSelect={handleRoomSelect} />;
      case 'devices':
        return <DevicesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return roomData ? (
          <DashboardPage
            roomData={roomData}
            onApplianceStateChange={handleApplianceStateChange}
          />
        ) : null;
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
