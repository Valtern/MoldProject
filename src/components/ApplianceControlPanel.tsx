import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { Fan, Droplets, SlidersHorizontal } from 'lucide-react';
import { doc, updateDoc, setDoc, onSnapshot, collection, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Slider } from '@/components/ui/slider';

interface ApplianceControlPanelProps {
  /** Appliance list from telemetry (fanStatus / dehumidifierStatus from SensorLogs) */
  appliances: { id: string; name: string; icon: string; state: string }[];
  /** Legacy callback — kept for parent compatibility but no longer the primary write path */
  onStateChange: (id: string, newState: boolean) => void;
  /** The Firestore deviceID for the currently selected room */
  deviceID?: string;
  /** Live humidity reading from SensorLogs — used to derive optimistic appliance status in auto mode */
  currentHumidity?: number;
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
  const { t } = useTranslation();
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
        {t('dashboard.appliances.auto')}
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
        {t('dashboard.appliances.manual') || 'Manual'}
      </button>
    </div>
  );
}

// ── Threshold Slider with debounced save ──
function ThresholdSlider({
  label,
  value,
  onChange,
  color = 'emerald',
  icon: Icon,
}: {
  label: string;
  value: number;
  onChange: (newValue: number) => void;
  color?: 'emerald' | 'sky';
  icon: typeof Fan;
}) {
  const colorMap = {
    emerald: {
      badge: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
      icon: 'text-emerald-600 dark:text-emerald-400',
      track: '[&_[data-slot=slider-range]]:bg-emerald-500 [&_[data-slot=slider-thumb]]:border-emerald-500',
    },
    sky: {
      badge: 'bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400',
      icon: 'text-sky-600 dark:text-sky-400',
      track: '[&_[data-slot=slider-range]]:bg-sky-500 [&_[data-slot=slider-thumb]]:border-sky-500',
    },
  };

  const colors = colorMap[color];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${colors.icon}`} strokeWidth={2} />
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            {label}
          </span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
          {value}%
        </span>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={100}
        step={1}
        onValueChange={(vals: number[]) => onChange(vals[0])}
        className={`w-full ${colors.track}`}
      />
      <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500 px-0.5">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

export function ApplianceControlPanel({ appliances, deviceID, currentHumidity }: ApplianceControlPanelProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Firestore-driven state ──
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [fanOverride, setFanOverride] = useState<'ON' | 'OFF'>('OFF');
  const [dehumidifierOverride, setDehumidifierOverride] = useState<'ON' | 'OFF'>('OFF');
  const [deviceDocId, setDeviceDocId] = useState<string | null>(null);

  // ── Threshold state ──
  const [fanThreshold, setFanThreshold] = useState<number>(70);
  const [dehumidifierThreshold, setDehumidifierThreshold] = useState<number>(85);
  const [thresholdsExpanded, setThresholdsExpanded] = useState<boolean>(false);

  // Debounce timers for threshold saves
  const fanThresholdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dehumThresholdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

        // Sync threshold values from Firestore (fallback to safe defaults)
        setFanThreshold(data.fanThreshold ?? 70);
        setDehumidifierThreshold(data.dehumidifierThreshold ?? 85);
      }
    }, (error: any) => {
      // Infrastructure/config issues shouldn't spam the error counter
      if (error?.code === 'permission-denied') {
        console.warn('[ApplianceControlPanel] Firestore permission denied — check security rules:', error.message);
      } else if (error?.message?.includes('index') || error?.code === 'failed-precondition') {
        console.warn('[ApplianceControlPanel] Firestore index required:', error.message);
      } else {
        console.error('[ApplianceControlPanel] Device listener error:', error);
      }
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

  // ── Debounced Firestore write: threshold changes ──
  const saveFanThreshold = useCallback((value: number) => {
    setFanThreshold(value);
    if (fanThresholdTimer.current) clearTimeout(fanThresholdTimer.current);
    fanThresholdTimer.current = setTimeout(async () => {
      if (!deviceDocId) return;
      try {
        const deviceRef = doc(db, 'Devices', deviceDocId);
        await setDoc(deviceRef, { fanThreshold: value }, { merge: true });
        console.log(`[ApplianceControlPanel] Fan threshold saved: ${value}%`);
      } catch (error) {
        console.error('[ApplianceControlPanel] Failed to save fanThreshold:', error);
      }
    }, 500);
  }, [deviceDocId]);

  const saveDehumidifierThreshold = useCallback((value: number) => {
    setDehumidifierThreshold(value);
    if (dehumThresholdTimer.current) clearTimeout(dehumThresholdTimer.current);
    dehumThresholdTimer.current = setTimeout(async () => {
      if (!deviceDocId) return;
      try {
        const deviceRef = doc(db, 'Devices', deviceDocId);
        await setDoc(deviceRef, { dehumidifierThreshold: value }, { merge: true });
        console.log(`[ApplianceControlPanel] Dehumidifier threshold saved: ${value}%`);
      } catch (error) {
        console.error('[ApplianceControlPanel] Failed to save dehumidifierThreshold:', error);
      }
    }, 500);
  }, [deviceDocId]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      if (fanThresholdTimer.current) clearTimeout(fanThresholdTimer.current);
      if (dehumThresholdTimer.current) clearTimeout(dehumThresholdTimer.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-5"
    >
      {/* Header with Mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {t('dashboard.appliances.title')}
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
          ? t('dashboard.appliances.autoDesc') || 'Devices are controlled automatically by the ESP32 logic.'
          : t('dashboard.appliances.manualDesc') || 'Manual override is active — you control the devices.'}
      </div>

      <div className="space-y-3">
        {appliances.map((appliance) => {
          const Icon = appliance.icon === 'fan' ? Fan : Droplets;
          const isFan = appliance.icon === 'fan';

          // ── Derived Optimistic UI State ──
          // In auto mode: derive expected state from currentHumidity vs threshold.
          // This eliminates the 5-minute UI lag caused by waiting for the next
          // ESP32 telemetry push. If currentHumidity is unavailable (undefined/null),
          // fall back to the last-known telemetry state from the appliances prop.
          // In manual mode: show the Firestore override value directly.
          let isOn: boolean;
          if (mode === 'auto') {
            if (currentHumidity != null) {
              const threshold = isFan ? fanThreshold : dehumidifierThreshold;
              isOn = currentHumidity > threshold;
            } else {
              // Fallback: no humidity reading yet — use stale telemetry
              isOn = appliance.state === 'manual-on';
            }
          } else {
            isOn = isFan ? fanOverride === 'ON' : dehumidifierOverride === 'ON';
          }

          const statusLabel = mode === 'auto'
            ? (isOn
              ? `${t('dashboard.appliances.on')} (${t('dashboard.appliances.auto')})`
              : `${t('dashboard.appliances.off')} (${t('dashboard.appliances.auto')})`)
            : (isOn
              ? `${t('dashboard.appliances.on')} (Manual)`
              : `${t('dashboard.appliances.off')} (Manual)`);

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

      {/* ── Threshold Sliders Section ── */}
      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5">
        <button
          id="threshold-toggle"
          onClick={() => setThresholdsExpanded((prev) => !prev)}
          className="w-full flex items-center justify-between py-1.5 group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
              {t('dashboard.appliances.thresholds') || 'Trigger Thresholds'}
            </span>
          </div>
          <svg
            className={`w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${thresholdsExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {thresholdsExpanded && (
          <div className="mt-3 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
              {t('dashboard.appliances.thresholdsDesc') || 'Set the humidity level at which each appliance activates automatically.'}
            </p>

            <ThresholdSlider
              label={t('dashboard.appliances.fanThreshold') || 'Fan Trigger'}
              value={fanThreshold}
              onChange={saveFanThreshold}
              color="emerald"
              icon={Fan}
            />

            <ThresholdSlider
              label={t('dashboard.appliances.dehumidifierThreshold') || 'Dehumidifier Trigger'}
              value={dehumidifierThreshold}
              onChange={saveDehumidifierThreshold}
              color="sky"
              icon={Droplets}
            />
          </div>
        )}
      </div>

      <div className={`${thresholdsExpanded ? 'mt-4' : 'mt-3'} pt-3 border-t border-slate-200/60 dark:border-white/5`}>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {mode === 'auto'
            ? t('dashboard.appliances.autoFooter') || 'The ESP32 manages appliances automatically based on sensor readings.'
            : t('dashboard.appliances.manualFooter') || 'Overrides are sent to the ESP32 on its next data push cycle.'}
        </p>
      </div>
    </div>
  );
}
