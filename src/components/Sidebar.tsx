import { useState } from 'react';
import {
  LayoutDashboard,
  Home,
  Cpu,
  FileText,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
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
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handlePageChange = (page: PageId) => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

  // Shared navigation + logout content (used by both desktop sidebar and mobile drawer)
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-slate-200/60 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-500" strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              MoldGuard
            </span>
          </div>
          {/* Close button — only visible in mobile drawer */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-md text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
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
                  onClick={() => handlePageChange(item.id)}
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

      {/* User Profile / Logout Panel */}
      <div className="px-3 py-3 border-t border-slate-200/60 dark:border-white/5">
        {onLogout && (
          <div
            className="w-full flex items-center justify-between gap-3 p-3 bg-zinc-100 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/50 mb-2"
          >
            <span className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
              {auth.currentUser?.email || 'User'}
            </span>
            <div className="relative group flex items-center">
              {/* Tooltip / Confirmation Bubble */}
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 text-xs font-medium text-white bg-zinc-900 dark:text-zinc-900 dark:bg-zinc-100 rounded-lg shadow-lg z-50 transition-opacity duration-150 ${
                isConfirmingLogout
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100 pointer-events-none'
              }`}>
                {isConfirmingLogout ? (
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span>Log out?</span>
                    <button
                      onClick={() => { setIsConfirmingLogout(false); setIsMobileMenuOpen(false); onLogout?.(); }}
                      className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setIsConfirmingLogout(false)}
                      className="px-2 py-0.5 rounded bg-zinc-700 hover:bg-zinc-600 dark:bg-zinc-300 dark:hover:bg-zinc-400 text-white dark:text-zinc-900 text-xs font-semibold transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <span className="whitespace-nowrap">Log out</span>
                )}
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100"></div>
              </div>
              {/* Logout Icon Button */}
              <button
                onClick={() => setIsConfirmingLogout(true)}
                className={`p-1.5 rounded-md transition-colors duration-150 ${
                  isConfirmingLogout
                    ? 'bg-zinc-200 dark:bg-zinc-700'
                    : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={2} />
              </button>
            </div>
          </div>
        )}
        <p className="text-xs text-slate-400 dark:text-zinc-600 px-1">v2.4.0</p>
      </div>
    </>
  );

  return (
    <>
      {/* ═══ Mobile Top Header (visible below md:) ═══ */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/70 dark:bg-zinc-950/40 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 z-50 flex md:hidden items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-500" strokeWidth={2} />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            MoldGuard
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-md text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ═══ Mobile Drawer Overlay (visible below md: when open) ═══ */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setIsMobileMenuOpen(false); setIsConfirmingLogout(false); }}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-64 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-r border-slate-200/60 dark:border-white/5 flex flex-col shadow-2xl animate-slide-in-left">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ═══ Desktop Sidebar (visible md: and above) ═══ */}
      <aside className="fixed left-0 top-0 h-full w-56 bg-white/70 dark:bg-zinc-950/40 backdrop-blur-xl border-r border-slate-200/60 dark:border-white/5 z-50 hidden md:flex flex-col">
        {sidebarContent}
      </aside>
    </>
  );
}
