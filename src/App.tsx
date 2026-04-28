import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { Sidebar } from '@/components/Sidebar';
import { StatusBanner } from '@/components/StatusBanner';
import { StatCard } from '@/components/StatCard';
import { HumidityChart } from '@/components/HumidityChart';
import { ApplianceControlPanel } from '@/components/ApplianceControlPanel';
import { RoomsPage } from '@/pages/RoomsPage';
import { DevicesPage } from '@/pages/DevicesPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { SignupPage } from '@/pages/SignupPage';
import type { RoomData } from '@/types';

// Navigation context to share between Sidebar and App
export type PageId = 'dashboard' | 'rooms' | 'devices' | 'reports' | 'settings';
export type AuthPageId = 'login' | 'forgot-password' | 'signup';

function DashboardPage({
  roomData,
  onApplianceStateChange,
}: {
  roomData: RoomData;
  onApplianceStateChange: (id: string, turnOn: boolean) => void;
}) {
  return (
    <div className="p-4 md:p-6 lg:p-8 2xl:p-10 w-full max-w-[1920px] mx-auto transition-all">
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
        <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-3 gap-4 lg:gap-6 2xl:gap-8 transition-all">
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
      <section className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6 2xl:gap-8 transition-all">
        {/* Humidity Chart - takes 2/3 width on large screens, more on 4K */}
        <div className="lg:col-span-2 2xl:col-span-3">
          <HumidityChart deviceID={roomData.deviceID} />
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authPage, setAuthPage] = useState<AuthPageId>('login');

  // ── Auth state listener ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  // ── Ripple wave system (direct DOM injection) ──
  const lastRippleTime = useRef(0);

  useEffect(() => {
    const spawnRipple = (e: MouseEvent) => {
      // Check if ripple is disabled via settings
      if (localStorage.getItem('moldguard-ripple-disabled') === 'true') return;

      const now = Date.now();
      if (now - lastRippleTime.current < 800) return;
      lastRippleTime.current = now;

      const el = document.createElement('div');
      el.className = 'ripple-ring';
      el.style.left = e.clientX + 'px';
      el.style.top = e.clientY + 'px';
      el.style.zIndex = '99999';
      document.body.appendChild(el);

      // Remove after animation
      const cleanup = () => { if (el.parentNode) el.remove(); };
      el.addEventListener('animationend', cleanup);
      setTimeout(cleanup, 7500);
    };

    // Use capture phase on window — fires before anything can stop it
    window.addEventListener('click', spawnRipple, true);
    return () => window.removeEventListener('click', spawnRipple, true);
  }, []);

  // Listen to available rooms from Devices collection
  useEffect(() => {
    const devicesRef = collection(db, 'Devices');
    const unsubscribe = onSnapshot(devicesRef, (snapshot) => {
      const rooms: any[] = snapshot.docs.map(doc => ({
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
    }, (error) => {
      console.error('[App] Devices listener error:', error);
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

          let formattedTime = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
          if (data.timestamp) {
             const d = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
             formattedTime = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
          }

          let newAppliances = prev.appliances;
          if (data.fanStatus || data.dehumidifierStatus) {
            newAppliances = prev.appliances.map(app => {
              if (app.icon === 'fan' && data.fanStatus) {
                return { ...app, state: data.fanStatus === 'ON' ? 'manual-on' : 'manual-off' };
              }
              if ((app.icon === 'droplets' || app.icon === 'dehumidifier') && data.dehumidifierStatus) {
                return { ...app, state: data.dehumidifierStatus === 'ON' ? 'manual-on' : 'manual-off' };
              }
              return app;
            });
          }

          return {
            ...prev,
            status: newStatus,
            lastUpdated: formattedTime,
            appliances: newAppliances,
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
    }, (error) => {
      console.error('[App] SensorLogs listener error:', error);
    });

    return () => unsubscribe();
  }, [currentPage, roomData?.deviceID]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    await signOut(auth);
    setAuthPage('login');
  }, []);

  // Render current page
  const renderPage = () => {
    // Show auth pages if not authenticated
    if (isAuthenticated === false) {
      switch (authPage) {
        case 'login':
          return (
            <LoginPage 
              onLoginSuccess={() => setIsAuthenticated(true)}
              onForgotPassword={() => setAuthPage('forgot-password')}
              onSignup={() => setAuthPage('signup')}
            />
          );
        case 'forgot-password':
          return (
            <ForgotPasswordPage 
              onBackToLogin={() => setAuthPage('login')}
            />
          );
        case 'signup':
          return (
            <SignupPage 
              onBackToLogin={() => setAuthPage('login')}
            />
          );
        default:
          return (
            <LoginPage 
              onLoginSuccess={() => setIsAuthenticated(true)}
              onForgotPassword={() => setAuthPage('forgot-password')}
              onSignup={() => setAuthPage('signup')}
            />
          );
      }
    }

    // Show loading while checking auth
    if (isAuthenticated === null) {
      return (
        <div className="p-4 md:p-6 lg:p-8 2xl:p-10 w-full max-w-[1920px] mx-auto flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        if (!roomData) {
          return (
            <div className="p-4 md:p-6 lg:p-8 2xl:p-10 w-full max-w-[1920px] mx-auto flex items-center justify-center min-h-[50vh]">
              <div className="text-center space-y-4 2xl:space-y-6">
                <h2 className="text-2xl 2xl:text-4xl font-medium text-zinc-900 dark:text-zinc-100">Welcome to MoldyBase</h2>
                <p className="text-zinc-500 text-base 2xl:text-lg dark:text-zinc-400">Please add a room to begin monitoring.</p>
                <button
                  onClick={() => setCurrentPage('rooms')}
                  className="px-4 py-2 2xl:px-8 2xl:py-4 2xl:text-lg bg-emerald-500 text-white rounded font-medium hover:bg-emerald-600 transition-colors"
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
        return <DevicesPage availableRooms={availableRooms} />;
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
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 relative overflow-hidden font-sans selection:bg-emerald-500/30">
      
      {/* ══ Layer 1: Mesh Gradient (CSS radial — no blur artifacts) ══ */}
      <div 
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: [
            // Primary emerald wash — top-left quadrant
            'radial-gradient(ellipse 60% 50% at 10% 10%, rgba(16,185,129,0.12) 0%, transparent 70%)',
            // Teal bio-luminescence — center-right
            'radial-gradient(ellipse 40% 60% at 75% 45%, rgba(20,184,166,0.08) 0%, transparent 60%)',
            // Warm amber accent — bottom-left (humidity warmth)
            'radial-gradient(ellipse 50% 40% at 20% 85%, rgba(245,158,11,0.06) 0%, transparent 60%)',
            // Cool slate wash — top-right corner
            'radial-gradient(ellipse 45% 35% at 90% 15%, rgba(100,116,139,0.07) 0%, transparent 55%)',
            // Deep emerald pulse — bottom-right (scanner origin)
            'radial-gradient(ellipse 35% 45% at 80% 80%, rgba(5,150,105,0.1) 0%, transparent 50%)',
          ].join(', ')
        }}
      />

      {/* ══ Layer 2: Dot-grid microscope reticle ══ */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-dot-grid text-slate-300/[0.12] dark:text-white/[0.03]" />

      {/* ══ Layer 3: Film grain texture ══ */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
      />

      {/* ══ Layer 4: Floating spore particles ══ */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Large spores */}
        <div className="absolute w-2 h-2 rounded-full bg-emerald-500/20 dark:bg-emerald-400/15 top-[15%] left-[12%]" style={{ animation: 'spore-drift-1 18s ease-in-out infinite' }} />
        <div className="absolute w-3 h-3 rounded-full bg-teal-500/15 dark:bg-teal-400/10 top-[60%] left-[70%]" style={{ animation: 'spore-drift-2 22s ease-in-out infinite' }} />
        <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-600/15 dark:bg-emerald-500/10 top-[40%] left-[45%]" style={{ animation: 'spore-drift-3 25s ease-in-out infinite' }} />
        
        {/* Medium spores */}
        <div className="absolute w-1.5 h-1.5 rounded-full bg-teal-400/20 dark:bg-teal-300/10 top-[80%] left-[25%]" style={{ animation: 'spore-drift-2 20s ease-in-out infinite 3s' }} />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400/15 dark:bg-emerald-300/10 top-[25%] left-[85%]" style={{ animation: 'spore-drift-1 24s ease-in-out infinite 5s' }} />
        <div className="absolute w-2 h-2 rounded-full bg-amber-400/10 dark:bg-amber-300/8 top-[70%] left-[50%]" style={{ animation: 'spore-drift-3 19s ease-in-out infinite 2s' }} />
        
        {/* Small spores — micro dust */}
        <div className="absolute w-1 h-1 rounded-full bg-emerald-500/25 dark:bg-emerald-400/15 top-[35%] left-[22%]" style={{ animation: 'spore-drift-3 16s ease-in-out infinite 1s' }} />
        <div className="absolute w-1 h-1 rounded-full bg-slate-400/20 dark:bg-slate-300/10 top-[55%] left-[38%]" style={{ animation: 'spore-drift-1 21s ease-in-out infinite 4s' }} />
        <div className="absolute w-1 h-1 rounded-full bg-teal-500/20 dark:bg-teal-400/12 top-[18%] left-[60%]" style={{ animation: 'spore-drift-2 17s ease-in-out infinite 6s' }} />
        <div className="absolute w-0.5 h-0.5 rounded-full bg-emerald-400/30 dark:bg-emerald-300/15 top-[45%] left-[78%]" style={{ animation: 'spore-drift-1 23s ease-in-out infinite 7s' }} />
      </div>

      {/* ══ Layer 5: Scanner pulse ring (emanates from bottom-right) ══ */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div 
          className="absolute left-[75%] top-[85%] w-[800px] h-[800px] rounded-full border border-emerald-500/10 dark:border-emerald-400/8"
          style={{ animation: 'scanner-pulse 8s ease-out infinite', opacity: 0 }}
        />
        <div 
          className="absolute left-[75%] top-[85%] w-[800px] h-[800px] rounded-full border border-teal-500/8 dark:border-teal-400/5"
          style={{ animation: 'scanner-pulse 8s ease-out infinite 4s', opacity: 0 }}
        />
      </div>

      {/* Sidebar - only show when authenticated */}
      {isAuthenticated && (
        <div className="relative z-50">
          <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} onLogout={handleLogout} />
        </div>
      )}

      {/* Main Content */}
      <main className={`${isAuthenticated ? 'md:ml-56' : ''} min-h-screen relative z-10 text-slate-900 dark:text-zinc-100`}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
