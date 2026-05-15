import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  Info,
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { auth } from '@/lib/firebase';
import type { PageId } from '@/App';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
}

export function Sidebar({ currentPage, onPageChange, onLogout }: Readonly<SidebarProps>) {
  const { t } = useTranslation();
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const userEmail = auth.currentUser?.email || 'admin@moldprev.io';

  const navItems = getNavItems(t);
  const desktopNavItems = getDesktopNavItems(t);

  const displayName = useMemo(() => {
    const prefix = userEmail.split('@')[0] || 'Admin';
    return prefix
      .split(/[._-]+/g)
      .map((word) => word ? word.charAt(0).toUpperCase() + word.slice(1) : word)
      .join(' ');
  }, [userEmail]);

  const handlePageChange = (page: PageId) => {
    onPageChange(page);
  };

  const handleLogout = () => {
    onLogout?.();
  };

  const handleSettings = () => {
    onPageChange('settings');
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
                    className={`w-full flex items-center gap-3 rounded-md px-3 py-2 transition-colors duration-150 ${
                      isActive
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
            <Popover open={isConfirmingLogout} onOpenChange={setIsConfirmingLogout}>
              <TooltipProvider>
                <Tooltip open={isConfirmingLogout ? false : undefined}>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setIsConfirmingLogout(true);
                        }}
                        className="rounded-md p-1.5 text-emerald-500 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        aria-label="Log out"
                      >
                        <LogOut className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center" sideOffset={8} className="bg-slate-900 text-white border-none dark:bg-zinc-800 [&_svg]:!bg-slate-900 [&_svg]:!fill-slate-900 dark:[&_svg]:!bg-zinc-800 dark:[&_svg]:!fill-zinc-800">
                    <p>{t('nav.logout')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <PopoverContent className="w-auto p-3 bg-slate-900 border-none shadow-xl dark:bg-zinc-800" side="top" align="center" sideOffset={8}>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-white text-center">{t('nav.logoutConfirm')}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsConfirmingLogout(false)}
                      className="rounded px-3 py-1 text-xs font-medium bg-slate-700 text-slate-200 hover:bg-slate-600 dark:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors"
                    >
                      {t('nav.no')}
                    </button>
                    <button
                      onClick={() => {
                        setIsConfirmingLogout(false);
                        handleLogout();
                      }}
                      className="rounded px-3 py-1 text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                    >
                      {t('nav.yes')}
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <p className="mt-2 px-1 text-xs text-slate-400 dark:text-zinc-600">{t('app.version')}</p>
        </div>
      </aside>

      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-slate-200/60 bg-white/95 backdrop-blur-xl dark:border-white/5 dark:bg-zinc-950/95 md:hidden">
        <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
              <Shield className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-bold text-slate-900 dark:text-zinc-100">
                {t('nav.mobileTitle')}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">{t('app.tagline')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
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
                  onSelect={() => {
                    handleSettings();
                  }}
                  className="flex h-14 items-center gap-4 rounded-2xl px-4 text-lg text-slate-700 dark:text-zinc-200"
                >
                  <Settings className="h-5 w-5 text-slate-600 dark:text-zinc-300" />
                  <span>{t('nav.settings')}</span>
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
