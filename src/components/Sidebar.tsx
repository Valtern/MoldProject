import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Radio,
  Zap,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Info,
  Bell,
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { auth } from '@/lib/firebase';
import type { PageId } from '@/App';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
}

function getNavItems(t: (key: string) => string): NavItem[] {
  return [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'rooms', label: t('nav.rooms'), icon: Radio },
    { id: 'devices', label: t('nav.devices'), icon: Zap },
    { id: 'reports', label: t('nav.reports'), icon: BarChart3 },

  ];
}

function getDesktopNavItems(t: (key: string) => string): NavItem[] {
  return [
    ...getNavItems(t),
    { id: 'about', label: t('nav.about'), icon: Info },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];
}

interface SidebarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  onLogout?: () => void;
  recentAlerts?: any[];
}

function alertTimeAgo(ts: any): string {
  if (!ts) return '';
  const d: Date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

export function Sidebar({ currentPage, onPageChange, onLogout, recentAlerts = [] }: Readonly<SidebarProps>) {
  const { t } = useTranslation();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const userEmail = auth.currentUser?.email || 'admin@moldprev.io';

  const navItems = getNavItems(t);
  const desktopNavItems = getDesktopNavItems(t);

  const displayName = useMemo(() => {
    const prefix = userEmail.split('@')[0] || 'Admin';
    const name = prefix
      .split(/[._-]+/g)
      .map((word) => word ? word.charAt(0).toUpperCase() + word.slice(1) : word)
      .join(' ');
    // Limit to 6 characters
    return name.substring(0, 6);
  }, [userEmail]);

  const handlePageChange = (page: PageId) => {
    onPageChange(page);
  };

  const handleLogout = () => {
    onLogout?.();
  };

  const triggerLogout = () => {
    setShowLogoutAlert(true);
  };

  return (
    <>
      <aside className="hidden md:fixed md:left-0 md:top-0 md:flex md:h-screen md:w-56 md:flex-col md:border-r md:border-slate-200/60 md:bg-white/95 md:backdrop-blur-xl md:z-40 dark:md:border-white/5 dark:md:bg-zinc-950/95">
        <div className="flex h-16 items-center justify-between border-b border-slate-200/70 px-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="MoldGuard Logo" className="h-7 w-7 object-contain rounded-md" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                {t('app.name')}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">{t('app.tagline')}</span>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-0.5">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handlePageChange(item.id)}
                    className={`w-full flex items-center gap-3 rounded-md px-3 py-2 transition-colors duration-150 ${isActive
                        ? 'bg-slate-200/80 text-slate-900 shadow-sm dark:bg-zinc-800/60 dark:text-zinc-100'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/30 dark:hover:text-zinc-100'
                      }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-200/60 px-3 py-3 dark:border-white/10">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-100 p-3 dark:border-zinc-700/50 dark:bg-zinc-800/40">
            <span className="truncate text-sm text-zinc-600 dark:text-zinc-400">
              {userEmail}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={triggerLogout}
                    className="rounded-md p-1.5 text-emerald-500 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    aria-label="Log out"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={2} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" sideOffset={8} className="bg-slate-900 text-white border-none dark:bg-zinc-800 [&_svg]:!bg-slate-900 [&_svg]:!fill-slate-900 dark:[&_svg]:!bg-zinc-800 dark:[&_svg]:!fill-zinc-800">
                  <p>{t('nav.logout')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="mt-2 px-1 text-xs text-slate-400 dark:text-zinc-600">{t('app.version')}</p>
        </div>
      </aside>

      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-slate-200/60 bg-white/95 backdrop-blur-xl dark:border-white/5 dark:bg-zinc-950/95 md:hidden">
        <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <LayoutDashboard className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[13px] font-bold text-slate-900 dark:text-zinc-100">
                {t('nav.mobileTitle')}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">{t('app.tagline')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ── Notification Bell ── */}
            <Popover open={bellOpen} onOpenChange={setBellOpen}>
              <PopoverTrigger asChild>
                <button
                  className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60 transition-colors"
                  aria-label={t('nav.notifications')}
                >
                  <Bell className="h-5 w-5" />
                  {recentAlerts.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                      {recentAlerts.length > 9 ? '9+' : recentAlerts.length}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-80 p-0 rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-950 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 dark:border-white/10">
                  <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {t('nav.notifications')}
                  </span>
                  {recentAlerts.length > 0 && (
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-500">
                      {recentAlerts.length}
                    </span>
                  )}
                </div>

                {/* Alert list */}
                {recentAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                    <Bell className="h-8 w-8 text-slate-300 dark:text-zinc-600" />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('nav.noAlerts')}</p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                    {recentAlerts.slice(0, 5).map((alert) => {
                      const maxProb = Math.max(alert.generalMoldProbability ?? 0, alert.blackMoldProbability ?? 0);
                      const dotColor = maxProb >= 80 ? 'bg-red-500' : maxProb >= 40 ? 'bg-amber-500' : 'bg-emerald-500';
                      return (
                        <div key={alert.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${dotColor}`} />
                              <span className="text-sm font-medium text-slate-900 dark:text-zinc-100 truncate">
                                {alert.deviceID}
                              </span>
                            </div>
                            <span className="text-xs text-zinc-400 whitespace-nowrap flex-shrink-0">
                              {alertTimeAgo(alert.timestamp)}
                            </span>
                          </div>
                          {alert.message && (
                            <p className="mt-1 ml-4 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                              {alert.message}
                            </p>
                          )}
                          <div className="mt-1.5 ml-4 flex gap-3 text-xs text-zinc-400">
                            <span>General: <strong className="text-zinc-600 dark:text-zinc-300">{(alert.generalMoldProbability ?? 0).toFixed(1)}%</strong></span>
                            <span>Black: <strong className="text-zinc-600 dark:text-zinc-300">{(alert.blackMoldProbability ?? 0).toFixed(1)}%</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-slate-200/60 px-4 py-2.5 dark:border-white/10">
                  <button
                    onClick={() => { onPageChange('reports'); setBellOpen(false); }}
                    className="text-xs font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
                  >
                    {t('nav.viewAllAlerts')} →
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <LanguageSwitcher compact={true} />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-3xl border border-slate-200/80 bg-slate-100/70 px-2.5 py-1.5 shadow-sm transition-colors hover:bg-slate-100 dark:border-white/5 dark:bg-zinc-900/70 dark:hover:bg-zinc-800/70">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex min-w-0 flex-col items-start text-left">
                  <span className="truncate text-lg font-medium text-slate-800 dark:text-zinc-100">
                    {t('nav.hi')} {displayName}
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
                  onSelect={() => onPageChange('about')}
                  className="flex h-12 items-center gap-3 rounded-2xl px-4 text-base text-slate-700 dark:text-zinc-200"
                >
                  <Info className="h-4.5 w-4.5 text-slate-600 dark:text-zinc-300" />
                  <span>{t('nav.about')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    handlePageChange('settings');
                  }}
                  className="flex h-14 items-center gap-4 rounded-2xl px-4 text-lg text-slate-700 dark:text-zinc-200"
                >
                  <Settings className="h-5 w-5 text-slate-600 dark:text-zinc-300" />
                  <span>{t('nav.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    triggerLogout();
                  }}
                  className="flex h-14 items-center gap-4 rounded-2xl px-4 text-lg !text-red-500 focus:!text-red-500 dark:!text-red-400 [&_svg]:!text-red-500 dark:[&_svg]:!text-red-400"
                  variant="destructive"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{t('nav.logout')}</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-20 items-center justify-around gap-0.5 border-t border-slate-200/60 bg-white/95 px-1 backdrop-blur-xl dark:border-white/5 dark:bg-zinc-950/95 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 transition-all duration-150 ${isActive
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/30 dark:hover:text-zinc-100'
                }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
              <span className="w-full truncate text-[10px] font-semibold leading-tight text-center">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Alert Dialog */}
      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent className="gap-3 border border-slate-200/80 bg-white text-slate-900 dark:border-white/10 dark:bg-black dark:text-white w-[calc(100%-3rem)] max-w-[17rem] p-4 sm:w-[calc(100%-2.5rem)] sm:max-w-[18rem] md:w-full md:max-w-sm md:p-5 shadow-2xl">
          <div className="text-center">
            <AlertDialogTitle className="text-lg font-semibold text-slate-900 dark:text-white md:text-xl">
              {t('nav.logoutConfirm')}
            </AlertDialogTitle>
          </div>
          <div className="flex gap-2.5 justify-center">
            <AlertDialogCancel className="border border-slate-600 bg-zinc-700 text-white hover:bg-zinc-600 dark:border-zinc-500 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-sm px-3.5 py-2 md:px-4">
              {t('nav.no')}
            </AlertDialogCancel>
            <AlertDialogAction 
              className="border-none bg-emerald-500 text-white hover:bg-emerald-600 text-sm px-3.5 py-2 md:px-4"
              onClick={handleLogout}
            >
              {t('nav.yes')}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
