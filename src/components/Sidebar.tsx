import { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Radio,
  Zap,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  User,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import type { PageId } from '@/App';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'rooms', label: 'Sensors', icon: Radio },
  { id: 'devices', label: 'Device', icon: Zap },
  { id: 'reports', label: 'Analytics', icon: BarChart3 },
];

interface SidebarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  onLogout?: () => void;
}

export function Sidebar({ currentPage, onPageChange, onLogout }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userEmail = auth.currentUser?.email || 'admin@moldprev.io';
  const displayName = useMemo(() => {
    const prefix = userEmail.split('@')[0] || 'Admin';
    return prefix
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }, [userEmail]);

  const handlePageChange = (page: PageId) => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    onLogout?.();
  };

  const handleSettings = () => {
    onPageChange('settings');
    setIsMobileMenuOpen(false);
  };

  const topBar = (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-slate-200/60 dark:border-white/5 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between px-4 md:px-6 lg:px-8 2xl:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
            <Shield className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-bold text-slate-900 dark:text-zinc-100 md:text-base">
              Mold Prevention
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">Sensors</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-3xl border border-slate-200/80 dark:border-white/5 bg-slate-100/70 dark:bg-zinc-900/70 px-3 py-2 shadow-sm transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800/70">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm">
                <User className="h-5 w-5" />
              </div>
              <div className="hidden min-w-0 flex-col items-start text-left sm:flex">
                <span className="truncate text-lg font-medium text-slate-800 dark:text-zinc-100">
                  Hi, {displayName}
                </span>
              </div>
              <ChevronDown className="h-5 w-5 text-slate-500 dark:text-zinc-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-[28px] border border-slate-200/80 bg-white p-0 shadow-2xl dark:border-white/10 dark:bg-zinc-950">
            <div className="border-b border-slate-200/70 px-6 py-5 dark:border-white/10">
              <p className="text-xl font-bold text-slate-900 dark:text-zinc-100">{displayName}</p>
              <p className="mt-1 text-base text-slate-500 dark:text-zinc-400">{userEmail}</p>
            </div>
            <div className="p-3">
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  handleSettings();
                }}
                className="flex h-14 items-center gap-4 rounded-2xl px-4 text-lg text-slate-700 dark:text-zinc-200"
              >
                <Settings className="h-5 w-5 text-slate-600 dark:text-zinc-300" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  handleLogout();
                }}
                className="flex h-14 items-center gap-4 rounded-2xl px-4 text-lg !text-red-500 focus:!text-red-500 dark:!text-red-400 [&_svg]:!text-red-500 dark:[&_svg]:!text-red-400"
                variant="destructive"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );

  return (
    <>
      {topBar}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-20 items-center justify-around gap-0.5 border-t border-slate-200/60 bg-white/95 px-1 backdrop-blur-xl dark:border-white/5 dark:bg-zinc-950/95 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 transition-all duration-150 ${
                isActive
                  ? 'bg-blue-500/15 text-blue-500'
                  : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/30 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
              <span className="w-full truncate text-[10px] font-semibold leading-tight text-center">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
