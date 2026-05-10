import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Fan, Droplets } from 'lucide-react';
import { doc, updateDoc, onSnapshot, collection, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ApplianceControlPanelProps {
  /** Appliance list from telemetry (fanStatus / dehumidifierStatus from SensorLogs) */
  appliances: { id: string; name: string; icon: string; state: string }[];
  /** Legacy callback — kept for parent compatibility but no longer the primary write path */
  onStateChange: (id: string, newState: boolean) => void;
  /** The Firestore deviceID for the currently selected room */
  deviceID?: string;
}

// ── iOS-style toggle ──
function IOSToggle({
  isOn,
  onChange,
  disabled = false,
}: {
  isOn: boolean;
  onChange: (newState: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => onChange(!isOn)}
      disabled={disabled}
      className={`
        relative w-11 h-6 rounded-full transition-colors duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-emerald-500/30
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${isOn ? 'bg-emerald-500' : 'bg-zinc-700'}
      `}
    >
      <span
        className={`
          absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
          transition-transform duration-200 ease-out
          ${isOn ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
}

// ── Mode pill toggle (Auto / Manual) ──
function ModePillToggle({
  mode,
  onChange,
}: {
  mode: 'auto' | 'manual';
  onChange: (newMode: 'auto' | 'manual') => void;
}) {
  return (
    <div className="flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-medium">
      <button
        onClick={() => onChange('auto')}
        className={`
          px-3 py-1 rounded-full transition-all duration-200
          ${mode === 'auto'
            ? 'bg-emerald-500 text-white shadow-sm'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}
        `}
      >
        Auto
      </button>
      <button
        onClick={() => onChange('manual')}
        className={`
          px-3 py-1 rounded-full transition-all duration-200
          ${mode === 'manual'
            ? 'bg-amber-500 text-white shadow-sm'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}
        `}
      >
        Manual
      </button>
    </div>
  );
}

export function ApplianceControlPanel({ appliances, deviceID }: ApplianceControlPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Firestore-driven state ──
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [fanOverride, setFanOverride] = useState<'ON' | 'OFF'>('OFF');
  const [dehumidifierOverride, setDehumidifierOverride] = useState<'ON' | 'OFF'>('OFF');
  const [deviceDocId, setDeviceDocId] = useState<string | null>(null);

  // ── Subscribe to the device document for real-time updates (source of truth) ──
  useEffect(() => {
    if (!deviceID) return;

    const devicesRef = collection(db, 'Devices');
    const q = query(devicesRef, where('deviceID', '==', deviceID), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        setDeviceDocId(docSnap.id);
        setMode((data.mode as 'auto' | 'manual') || 'auto');
        setFanOverride((data.fanOverride as 'ON' | 'OFF') || 'OFF');
        setDehumidifierOverride((data.dehumidifierOverride as 'ON' | 'OFF') || 'OFF');
      }
    }, (error) => {
      console.error('[ApplianceControlPanel] Device listener error:', error);
    });

    return () => unsubscribe();
  }, [deviceID]);

  // ── Entrance animation ──
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.32, ease: 'power2.out' }
      );
    });

    return () => ctx.revert();
  }, []);

  // ── Helper: rebuild the existing appliances array with correct state values ──
  // Maps (mode + override) → the existing ApplianceState schema:
  //   auto → "auto" | manual + ON → "manual-on" | manual + OFF → "manual-off"
  const buildUpdatedAppliances = (
    currentMode: 'auto' | 'manual',
    currentFanOverride: 'ON' | 'OFF',
    currentDehumOverride: 'ON' | 'OFF',
  ) => {
    return appliances.map((app) => {
      const isFan = app.icon === 'fan';
      let newState: string;

      if (currentMode === 'auto') {
        newState = 'auto';
      } else {
        const override = isFan ? currentFanOverride : currentDehumOverride;
        newState = override === 'ON' ? 'manual-on' : 'manual-off';
      }

      return { id: app.id, name: app.name, icon: app.icon, state: newState };
    });
  };

  // ── Firestore write: mode toggle ──
  const handleModeChange = async (newMode: 'auto' | 'manual') => {
    if (!deviceDocId) return;

    // Optimistic update
    setMode(newMode);

    try {
      const deviceRef = doc(db, 'Devices', deviceDocId);
      const updatedAppliances = buildUpdatedAppliances(newMode, fanOverride, dehumidifierOverride);
      await updateDoc(deviceRef, {
        mode: newMode,
        appliances: updatedAppliances,
      });
    } catch (error) {
      console.error('[ApplianceControlPanel] Failed to update mode:', error);
      // onSnapshot will correct the state if the write failed
    }
  };

  // ── Firestore write: manual override toggles ──
  // Handlers receive the explicit boolean from the UI toggle and translate
  // it into the strict "ON"/"OFF" strings the ESP32 firmware expects.
  const handleFanOverride = async (turnOn: boolean) => {
    if (!deviceDocId) return;
    const newValue: 'ON' | 'OFF' = turnOn ? 'ON' : 'OFF';

    // Optimistic update
    setFanOverride(newValue);

    try {
      const deviceRef = doc(db, 'Devices', deviceDocId);
      const updatedAppliances = buildUpdatedAppliances(mode, newValue, dehumidifierOverride);
      await updateDoc(deviceRef, {
        fanOverride: newValue,
        appliances: updatedAppliances,
      });
    } catch (error) {
      console.error('[ApplianceControlPanel] Failed to update fanOverride:', error);
    }
  };

  const handleDehumidifierOverride = async (turnOn: boolean) => {
    if (!deviceDocId) return;
    const newValue: 'ON' | 'OFF' = turnOn ? 'ON' : 'OFF';

    // Optimistic update
    setDehumidifierOverride(newValue);

    try {
      const deviceRef = doc(db, 'Devices', deviceDocId);
      const updatedAppliances = buildUpdatedAppliances(mode, fanOverride, newValue);
      await updateDoc(deviceRef, {
        dehumidifierOverride: newValue,
        appliances: updatedAppliances,
      });
    } catch (error) {
      console.error('[ApplianceControlPanel] Failed to update dehumidifierOverride:', error);
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-5"
    >
      {/* Header with Mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Appliance Control
        </h2>
        <ModePillToggle mode={mode} onChange={handleModeChange} />
      </div>

      {/* Mode indicator banner */}
      <div className={`
        mb-4 px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2
        ${mode === 'auto'
          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'}
      `}>
        <span className={`w-1.5 h-1.5 rounded-full ${mode === 'auto' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
        {mode === 'auto'
          ? 'Devices are controlled automatically by the ESP32 logic.'
          : 'Manual override is active — you control the devices.'}
      </div>

      <div className="space-y-3">
        {appliances.map((appliance) => {
          const Icon = appliance.icon === 'fan' ? Fan : Droplets;
          const isFan = appliance.icon === 'fan';

          // In auto mode: show the live telemetry status from the ESP32
          // In manual mode: show the Firestore override value
          const isOn = mode === 'auto'
            ? appliance.state === 'manual-on'
            : (isFan ? fanOverride === 'ON' : dehumidifierOverride === 'ON');

          const statusLabel = mode === 'auto'
            ? (appliance.state === 'manual-on' ? 'ON (Auto)' : 'OFF (Auto)')
            : (isOn ? 'ON (Manual)' : 'OFF (Manual)');

          return (
            <div key={appliance.id} className="space-y-2">
              {/* Status row */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-md flex items-center justify-center transition-colors duration-200
                    ${isOn
                      ? 'bg-emerald-100 dark:bg-emerald-500/20'
                      : 'bg-zinc-100 dark:bg-zinc-800'}
                  `}>
                    <Icon
                      className={`w-4 h-4 transition-colors duration-200 ${
                        isOn
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {appliance.name}
                    </p>
                    <p className={`text-xs transition-colors duration-200 ${
                      isOn
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}>
                      {statusLabel}
                    </p>
                  </div>
                </div>

                {/* In auto mode: show a static indicator dot. In manual mode: show the toggle. */}
                {mode === 'auto' ? (
                  <div className={`
                    w-2.5 h-2.5 rounded-full transition-colors duration-200
                    ${isOn ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400 dark:bg-zinc-600'}
                  `} />
                ) : (
                  <IOSToggle
                    isOn={isOn}
                    onChange={isFan ? handleFanOverride : handleDehumidifierOverride}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {mode === 'auto'
            ? 'The ESP32 manages appliances automatically based on sensor readings.'
            : 'Overrides are sent to the ESP32 on its next data push cycle.'}
        </p>
      </div>
    </div>
  );
}
