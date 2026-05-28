import {
  Cloud,
  Wifi,
  Brain,
  SlidersHorizontal,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';

const teamMembers = [
  { number: 1, name: 'Antonius Kaharap Kautsar', roleKey: 'about.team.role' },
  { number: 2, name: 'Charellino Kalingga S', roleKey: 'about.team.role' },
  { number: 3, name: 'Baskoro Seno Aji', roleKey: 'about.team.role' },
  { number: 4, name: 'Hammam Abdullah S BG', roleKey: 'about.team.role' },
];

const lecturers = [
  'Yoppy Yunhasnawa, S.ST., M.Sc.',
  'Agung Nugroho Pramudhita, S.T., M.T.',
  'Dian Hanifudin Subhi, S.Kom., M.Kom.',
];

const features = [
  {
    icon: Cloud,
    titleKey: 'about.features.items.cloudFirst.title',
    descriptionKey: 'about.features.items.cloudFirst.description',
  },
  {
    icon: Wifi,
    titleKey: 'about.features.items.iotNetwork.title',
    descriptionKey: 'about.features.items.iotNetwork.description',
  },
  {
    icon: Brain,
    titleKey: 'about.features.items.aiPrevention.title',
    descriptionKey: 'about.features.items.aiPrevention.description',
  },
  {
    icon: SlidersHorizontal,
    titleKey: 'about.features.items.proactiveControl.title',
    descriptionKey: 'about.features.items.proactiveControl.description',
  },
];

export function AboutPage() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const heroStyle = isDark
    ? {
        background: 'linear-gradient(168deg, #0f172a 0%, #0f766e 48%, #10b981 100%)',
      }
    : {
        background: 'linear-gradient(168deg, #ecfeff 0%, #f0fdfa 52%, #a7f3d0 100%)',
      };

  const heroCardClass = isDark
    ? 'relative overflow-hidden rounded-none border border-emerald-500/20 p-6 shadow-[0px_20px_25px_-5px_rgba(16,185,129,0.14),0px_8px_10px_-6px_rgba(16,185,129,0.14)] md:p-8'
    : 'relative overflow-hidden rounded-none border border-emerald-200/70 p-6 shadow-[0px_20px_25px_-5px_rgba(16,185,129,0.10),0px_8px_10px_-6px_rgba(16,185,129,0.10)] md:p-8';

  const heroTitleClass = isDark ? 'text-white' : 'text-slate-900';
  const heroSubtitleClass = isDark ? 'text-white/80' : 'text-slate-600';
  const heroBodyClass = isDark ? 'text-white/90' : 'text-slate-700';
  const aboutProjectTextClass = isDark ? 'text-zinc-400' : 'text-slate-600';
  const cardTitleClass = isDark ? 'text-zinc-100' : 'text-slate-900';
  const cardBodyClass = isDark ? 'text-zinc-400' : 'text-slate-600';

  const teamCardClass = isDark
    ? 'rounded-none border border-zinc-700 bg-zinc-900'
    : 'rounded-none border border-emerald-100/70 bg-emerald-50/80';

  const instituteCardClass = isDark
    ? 'rounded-none border border-zinc-700 bg-zinc-900'
    : 'rounded-none border border-emerald-200 bg-emerald-50/80';

  return (
    <div className="w-full max-w-[1280px] mx-auto transition-all">
      <div className="px-3 py-3 md:p-6 lg:p-8">
        <div className="flex flex-col gap-5 md:gap-6">

          {/* ── Hero Banner ── */}
          <div className={heroCardClass} style={heroStyle}>
            {/* Decorative blobs */}
            <div
              className={`pointer-events-none absolute -top-10 right-36 h-48 w-48 rounded-full blur-[40px] ${
                isDark ? 'bg-white/10' : 'bg-emerald-300/20'
              }`}
            />
            <div
              className={`pointer-events-none absolute bottom-0 -left-10 h-48 w-48 rounded-full blur-[40px] ${
                isDark ? 'bg-white/10' : 'bg-teal-300/20'
              }`}
            />

            <div className="relative">
              {/* Logo row */}
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-none border ${isDark ? 'border-white/20 bg-white/10' : 'border-emerald-200 bg-white/70'}`}>
                  <img src="/logo.png" alt="MoldGuard logo" className="h-8 w-8 object-contain" />
                </div>
                <div>
                  <p className={`text-2xl font-bold leading-tight ${heroTitleClass}`}>{t('about.hero.title')}</p>
                  <p className={`text-sm ${heroSubtitleClass}`}>{t('about.hero.subtitle')}</p>
                </div>
              </div>

              {/* Description */}
              <p className={`max-w-2xl text-sm leading-relaxed md:text-base ${heroBodyClass}`}>
                {t('about.hero.description')}
              </p>
            </div>
          </div>

          {/* ── Tentang Proyek ── */}
          <div className="rounded-none border border-zinc-200 bg-white px-7 py-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 flex-shrink-0 text-emerald-500" strokeWidth={2} />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('about.project.title')}</h2>
            </div>
            <p className={`mb-3 text-sm leading-relaxed md:text-base ${aboutProjectTextClass}`}>
              {t('about.project.p1')}
            </p>
            <p className={`text-sm leading-relaxed md:text-base ${aboutProjectTextClass}`}>
              {t('about.project.p2')}
            </p>
          </div>

          {/* ── Keunggulan Teknologi ── */}
          <div>
            <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {t('about.features.title')}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {features.map(({ icon: Icon, titleKey, descriptionKey }) => (
                <div
                  key={titleKey}
                  className="rounded-none border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-none border border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(20,184,166,0.14) 100%)',
                    }}
                  >
                    <Icon className="h-5 w-5 text-emerald-500" strokeWidth={2} />
                  </div>
                  <h3 className={`mb-2 text-base font-semibold ${cardTitleClass}`}>
                    {t(titleKey)}
                  </h3>
                  <p className={`text-sm leading-relaxed ${cardBodyClass}`}>
                    {t(descriptionKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tim Pengembang ── */}
          <div className="rounded-none border border-zinc-200 bg-white px-7 py-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-1 flex items-center gap-2">
              <Users className="h-5 w-5 flex-shrink-0 text-emerald-500" strokeWidth={2} />
              <h2 className={`text-lg font-bold ${cardTitleClass}`}>{t('about.team.title')}</h2>
            </div>
            <p className={`mb-5 text-sm ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{t('about.team.group')}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {teamMembers.map(({ number, name, roleKey }) => (
                <div
                  key={number}
                  className={`flex items-center gap-3 px-3.5 py-3 ${teamCardClass}`}
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-none text-base font-semibold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #0f766e 100%)',
                    }}
                  >
                    {number}
                  </div>
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                      {name}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{t(roleKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Dosen Pembimbing + Institusi ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Dosen Pembimbing */}
            <div className="rounded-none border border-zinc-200 bg-white px-6 py-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 flex-shrink-0 text-emerald-500" strokeWidth={2} />
                <h2 className={`text-base font-bold ${cardTitleClass}`}>{t('about.lecturers.title')}</h2>
              </div>
              <ul className="space-y-3">
                {lecturers.map((name) => (
                  <li key={name} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-none bg-emerald-500" />
                    <span className={`text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                      {name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Institusi */}
            <div className={`${instituteCardClass} px-6 py-5`}>
              <div className="mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 flex-shrink-0 text-emerald-500" strokeWidth={2} />
                <h2 className={`text-base font-bold ${cardTitleClass}`}>{t('about.institution.title')}</h2>
              </div>
              <div className="mb-4 space-y-1.5">
                <p className={`text-sm font-semibold ${cardTitleClass}`}>
                  {t('about.institution.program')}
                </p>
                <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                  {t('about.institution.department')}
                </p>
                <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                  {t('about.institution.campus')}
                </p>
              </div>
              <div className="flex items-center gap-2.5 border-t border-emerald-200/60 pt-4 dark:border-emerald-500/20">
                <Sparkles className="h-4 w-4 flex-shrink-0 text-emerald-500" strokeWidth={2} />
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {t('about.institution.tagline')}
                </p>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="py-2 text-center">
            <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              {t('about.footer')}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
