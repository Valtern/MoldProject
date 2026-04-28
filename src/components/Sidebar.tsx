import {
  LayoutDashboard,
  Home,
  Cpu,
  FileText,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react';
import type { PageId } from '@/App';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'rooms', label: 'Rooms', icon: Home },
  { id: 'devices', label: 'Devices', icon: Cpu },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  onLogout?: () => void;
}

export function Sidebar({ currentPage, onPageChange, onLogout }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white/70 dark:bg-zinc-950/40 backdrop-blur-xl border-r border-slate-200/60 dark:border-white/5 z-50 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-slate-200/60 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-500" strokeWidth={2} />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            MoldGuard
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md
                    transition-colors duration-150
                    ${isActive
                      ? 'bg-slate-200/80 dark:bg-zinc-800/60 text-slate-900 dark:text-zinc-100 shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/30'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  <span className="text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Version */}
      <div className="px-4 py-3 border-t border-slate-200/60 dark:border-white/5">
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/30 transition-colors duration-150 mb-2"
          >
            <LogOut className="w-4 h-4" strokeWidth={2} />
            <span className="text-sm">Logout</span>
          </button>
        )}
        <p className="text-xs text-slate-400 dark:text-zinc-600">v2.4.0</p>
      </div>
    </aside>
  );
}
