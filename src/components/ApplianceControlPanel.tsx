import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Fan, Droplets } from 'lucide-react';
import type { ApplianceControl } from '@/types';

interface ApplianceControlPanelProps {
  appliances: ApplianceControl[];
  onStateChange: (id: string, newState: boolean) => void;
}

const stateLabels: Record<string, string> = {
  'auto': 'Auto',
  'manual-on': 'Manual',
  'manual-off': 'Off',
};

function IOSToggle({
  isOn,
  onChange,
}: {
  isOn: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`
        relative w-11 h-6 rounded-full transition-colors duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-emerald-500/30
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

export function ApplianceControlPanel({ appliances, onStateChange }: ApplianceControlPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={containerRef}
      className="bg-zinc-900 border border-zinc-800 rounded-lg p-5"
    >
      <h2 className="text-sm font-medium text-zinc-400 mb-4">
        Appliance Control
      </h2>

      <div className="space-y-3">
        {appliances.map((appliance) => {
          const Icon = appliance.icon === 'fan' ? Fan : Droplets;
          const isOn = appliance.state === 'manual-on';

          return (
            <div
              key={appliance.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-zinc-400" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">
                    {appliance.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {stateLabels[appliance.state]}
                  </p>
                </div>
              </div>

              <IOSToggle
                isOn={isOn}
                onChange={() => onStateChange(appliance.id, !isOn)}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800">
        <p className="text-xs text-zinc-500">
          Controls respond to the selected room
        </p>
      </div>
    </div>
  );
}
