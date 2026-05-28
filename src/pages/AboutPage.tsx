import {
  Shield,
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

const teamMembers = [
  { number: 1, name: 'Antonius Kaharap Kautsar', role: 'Developer' },
  { number: 2, name: 'Charellino Kalingga S', role: 'Developer' },
  { number: 3, name: 'Baskoro Seno Aji', role: 'Developer' },
  { number: 4, name: 'Hammam Abdullah S BG', role: 'Developer' },
];

const lecturers = [
  'Yoppy Yunhasnawa, S.ST., M.Sc.',
  'Agung Nugroho Pramudhita, S.T., M.T.',
  'Dian Hanifudin Subhi, S.Kom., M.Kom.',
];

const features = [
  {
    icon: Cloud,
    title: 'Cloud-First Architecture',
    description:
      'Data sensor diproses dan disimpan secara terpusat di cloud untuk akses real-time kapan saja, di mana saja.',
  },
  {
    icon: Wifi,
    title: 'IoT Sensor Network',
    description:
      'Jaringan sensor pintar memantau kelembapan, suhu, dan risiko jamur secara berkelanjutan.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Prevention',
    description:
      'Algoritma cerdas memprediksi risiko pertumbuhan jamur sebelum terlihat secara visual.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Proactive Control',
    description:
      'Kontrol perangkat otomatis seperti dehumidifier, air purifier, dan smart fan untuk menjaga lingkungan tetap sehat.',
  },
];

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-[1280px] mx-auto transition-all">
      <div className="px-3 py-3 md:p-6 lg:p-8">
        <div className="flex flex-col gap-5 md:gap-6">

          {/* ── Hero Banner ── */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 md:p-8 shadow-[0px_20px_25px_-5px_rgba(43,127,255,0.2),0px_8px_10px_-6px_rgba(43,127,255,0.2)]"
            style={{
              background: 'linear-gradient(168deg, #2b7fff 0%, #615fff 50%, #ad46ff 100%)',
            }}
          >
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-10 right-36 h-48 w-48 rounded-full bg-white/10 blur-[40px]" />
            <div className="pointer-events-none absolute bottom-0 -left-10 h-48 w-48 rounded-full bg-white/10 blur-[40px]" />

            <div className="relative">
              {/* Logo row */}
            <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Shield className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
                <div>
                <p className="text-2xl font-bold leading-tight text-white">{t('about.hero.title')}</p>
                <p className="text-sm text-white/80">{t('about.hero.subtitle')}</p>
                </div>
              </div>

              {/* Description */}
            <p className="max-w-2xl text-sm leading-relaxed text-white/90 md:text-base">
              {t('about.hero.description')}
            </p>
            </div>
          </div>

          {/* ── Tentang Proyek ── */}
          <div className="rounded-2xl border border-zinc-100 bg-white px-7 py-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500 flex-shrink-0" strokeWidth={2} />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('about.project.title')}</h2>
            </div>
          <p className="mb-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-base">
            {t('about.project.p1')}
          </p>
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-base">
            {t('about.project.p2')}
          </p>
          </div>

          {/* ── Keunggulan Teknologi ── */}
          <div>
            <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {t('about.features.title')}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
                    }}
                  >
                    <Icon className="h-5 w-5 text-blue-500" strokeWidth={2} />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {title}
                  </h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {t(`about.features.items.${title}.description`, { defaultValue: description })}
                </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tim Pengembang ── */}
          <div className="rounded-2xl border border-zinc-100 bg-white px-7 py-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-1 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500 flex-shrink-0" strokeWidth={2} />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Tim Pengembang</h2>
            </div>
            <p className="mb-5 text-sm text-zinc-400 dark:text-zinc-500">Kelompok 2</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {teamMembers.map(({ number, name, role }) => (
                <div
                  key={number}
                  className="flex items-center gap-3 rounded-xl border border-blue-100/50 px-3.5 py-3 dark:border-zinc-700/50"
                  style={{
                    background:
                      'linear-gradient(174deg, rgba(239,246,255,0.6) 0%, rgba(238,242,255,0.6) 100%)',
                  }}
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white text-base font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #51a2ff 0%, #615fff 100%)',
                    }}
                  >
                    {number}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {name}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Dosen Pembimbing + Institusi ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Dosen Pembimbing */}
            <div className="rounded-2xl border border-zinc-100 bg-white px-6 py-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-500 flex-shrink-0" strokeWidth={2} />
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Dosen Pembimbing
                </h2>
              </div>
              <ul className="space-y-3">
                {lecturers.map((name) => (
                  <li key={name} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
                    <span className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                      {name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Institusi */}
            <div
              className="rounded-2xl border border-blue-200 px-6 py-5 dark:border-zinc-700"
              style={{
                background: 'linear-gradient(160deg, #eff6ff 0%, #eef2ff 100%)',
              }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500 flex-shrink-0" strokeWidth={2} />
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-800">Institusi</h2>
              </div>
              <div className="mb-4 space-y-1.5">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-800">
                  Program Studi D-IV Teknik Informatika
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-700">
                  Jurusan Teknologi Informasi
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-700">
                  Politeknik Negeri Malang
                </p>
              </div>
              <div className="flex items-center gap-2.5 border-t border-blue-200/60 pt-4 dark:border-blue-300/30">
                <Sparkles className="h-4 w-4 flex-shrink-0 text-blue-500" strokeWidth={2} />
                <p className="text-xs text-zinc-500 dark:text-zinc-600">
                  Innovation through Cloud &amp; IoT Integration
                </p>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="py-2 text-center">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              © 2026 MoldGuard — Smart Mold Prevention System
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
