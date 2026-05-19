import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sliders, Bell, Mail, Monitor, Moon, Sun, AlertTriangle, Filter } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

export function SettingsPage() {
  const { t } = useTranslation();
  // ── Mold Threshold State (4 distinct fields) ────────────────────────────────
  const [generalSafeLimit, setGeneralSafeLimit] = useState<number | string>(60);
  const [generalCriticalLimit, setGeneralCriticalLimit] = useState<number | string>(80);
  const [blackMoldSafeLimit, setBlackMoldSafeLimit] = useState<number | string>(70);
  const [blackMoldCriticalLimit, setBlackMoldCriticalLimit] = useState<number | string>(90);

  // ── Other Settings State ────────────────────────────────────────────────────
  const [alertEmail, setAlertEmail] = useState<string>('');
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(false);
  const [emailAlertLevels, setEmailAlertLevels] = useState<string[]>(['High']);
  const [rippleDisabled, setRippleDisabled] = useState(() => localStorage.getItem('moldguard-ripple-disabled') === 'true');
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const userSettingsRef = doc(db, 'Settings', uid);
    
    // Check if doc exists first before subscribing, to initialize if missing
    getDoc(userSettingsRef).then((snapshot) => {
      if (!snapshot.exists()) {
        setDoc(userSettingsRef, {
          generalSafeLimit: 60,
          generalCriticalLimit: 80,
          blackMoldSafeLimit: 70,
          blackMoldCriticalLimit: 90,
          // Legacy field kept for Cloud Function backward compatibility
          criticalHumidityLimit: 80,
          alertEmail: '',
          alertsEnabled: false,
          emailAlertLevels: ['High'],
          themePreference: 'system'
        }, { merge: true });
      }
    });

    const unsubscribe = onSnapshot(userSettingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // New fields with fallback to legacy values for migration
        setGeneralSafeLimit(data.generalSafeLimit ?? data.safeHumidityLimit ?? 60);
        setGeneralCriticalLimit(data.generalCriticalLimit ?? data.criticalHumidityLimit ?? 80);
        setBlackMoldSafeLimit(data.blackMoldSafeLimit ?? 70);
        setBlackMoldCriticalLimit(data.blackMoldCriticalLimit ?? 90);
        setAlertEmail(data.alertEmail ?? '');
        setAlertsEnabled(data.alertsEnabled ?? false);
        // Multi-select levels with migration from legacy single-value field
        if (Array.isArray(data.emailAlertLevels)) {
          setEmailAlertLevels(data.emailAlertLevels);
        } else if (data.emailAlertThreshold) {
          // Migrate: old threshold "Medium" → ['Medium', 'High'], "Low" → all, "High" → ['High']
          const legacy = data.emailAlertThreshold;
          if (legacy === 'Low') setEmailAlertLevels(['Low', 'Medium', 'High']);
          else if (legacy === 'Medium') setEmailAlertLevels(['Medium', 'High']);
          else setEmailAlertLevels(['High']);
        } else {
          setEmailAlertLevels(['High']);
        }
        if (data.themePreference) {
          setTheme(data.themePreference);
        }
      }
    }, (error) => {
      console.error('[Settings] Listener error:', error);
    });

    return () => unsubscribe();
  }, []);

  // ── Input Sanitizer (integers only, clamped 0-100) ─────────────────────────
  const sanitizeIntegerInput = (raw: string): number | string => {
    // Allow empty field while the user is typing
    if (raw === '' || raw === '-') return '';
    // Strip any decimal portion and parse as integer
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) return '';
    // Clamp to 0-100 range
    return Math.max(0, Math.min(100, parsed));
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): string[] => {
    const errors: string[] = [];
    const gs = Number(generalSafeLimit);
    const gc = Number(generalCriticalLimit);
    const bs = Number(blackMoldSafeLimit);
    const bc = Number(blackMoldCriticalLimit);

    // Must be valid numbers
    if (isNaN(gs) || isNaN(gc) || isNaN(bs) || isNaN(bc)) {
      errors.push(t('settings.validation.nan'));
      return errors;
    }

    // Must be whole integers (no decimals)
    if (!Number.isInteger(gs) || !Number.isInteger(gc) || !Number.isInteger(bs) || !Number.isInteger(bc)) {
      errors.push(t('settings.validation.integersOnly'));
      return errors;
    }

    // Must be within 0-100 range
    if ([gs, gc, bs, bc].some(v => v < 0 || v > 100)) {
      errors.push(t('settings.validation.outOfRange'));
    }

    // Cross-field: Critical must be strictly greater than Safe
    if (gs >= gc) {
      errors.push(t('settings.validation.generalOrder'));
    }
    if (bs >= bc) {
      errors.push(t('settings.validation.blackMoldOrder'));
    }
    if (bc > 90) {
      errors.push(t('settings.validation.maxCeiling', { organism: t('settings.thresholds.notice.organism') }));
    }

    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    setValidationErrors(errors);
    if (errors.length > 0) {
      toast.error(t('settings.validation.fixBeforeSave'));
      return;
    }

    setIsSaving(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('Not authenticated');
      await setDoc(doc(db, 'Settings', uid), {
        generalSafeLimit: Number(generalSafeLimit),
        generalCriticalLimit: Number(generalCriticalLimit),
        blackMoldSafeLimit: Number(blackMoldSafeLimit),
        blackMoldCriticalLimit: Number(blackMoldCriticalLimit),
        // Legacy field kept for Cloud Function backward compatibility
        criticalHumidityLimit: Number(generalCriticalLimit),
        alertEmail,
        alertsEnabled,
        emailAlertLevels,
        themePreference: theme || 'system'
      }, { merge: true });
      toast.success(t('settings.save.success'));
    } catch (error) {
      console.error(error);
      toast.error(t('settings.save.error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Shared input class for consistency
  const inputClass = "w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1";

  return (
    <div className="w-full max-w-4xl 2xl:max-w-5xl mx-auto transition-all">
      <div className="px-3 py-3 md:p-6 lg:p-8 2xl:p-10">
      {/* Page Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100">{t('settings.title')}</h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* ═══ Threshold Configuration ═══ */}
      <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-4 md:p-5 mb-3 md:mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t('settings.thresholds.title')}</h2>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20">
            {validationErrors.map((err, i) => (
              <p key={i} className="text-xs text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                {err}
              </p>
            ))}
          </div>
        )}

        {/* ── Section 1: General Mold Thresholds ── */}
        <div className="mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            {t('settings.thresholds.general.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                {t('settings.thresholds.general.safeLimit')}
              </label>
              <input
                type="number"
                value={generalSafeLimit}
                onChange={(e) => { setGeneralSafeLimit(sanitizeIntegerInput(e.target.value)); setValidationErrors([]); }}
                className={`${inputClass} focus:border-emerald-500/50 focus:ring-emerald-500/20`}
                min="0"
                max="100"
                step="1"
              />
              <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1.5">
                {t('settings.thresholds.general.safeLimitDesc')}
              </p>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                {t('settings.thresholds.general.criticalLimit')}
              </label>
              <input
                type="number"
                value={generalCriticalLimit}
                onChange={(e) => { setGeneralCriticalLimit(sanitizeIntegerInput(e.target.value)); setValidationErrors([]); }}
                className={`${inputClass} focus:border-red-500/50 focus:ring-red-500/20`}
                min="0"
                max="100"
                step="1"
              />
              <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1.5">
                {t('settings.thresholds.general.criticalLimitDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200/60 dark:border-white/5 my-4" />

        {/* ── Section 2: Toxic Black Mold Thresholds ── */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            {t('settings.thresholds.blackMold.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                {t('settings.thresholds.blackMold.safeLimit')}
              </label>
              <input
                type="number"
                value={blackMoldSafeLimit}
                onChange={(e) => { setBlackMoldSafeLimit(sanitizeIntegerInput(e.target.value)); setValidationErrors([]); }}
                className={`${inputClass} focus:border-emerald-500/50 focus:ring-emerald-500/20`}
                min="0"
                max="100"
                step="1"
              />
              <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1.5">
                {t('settings.thresholds.blackMold.safeLimitDesc')}
              </p>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                {t('settings.thresholds.blackMold.criticalLimit')}
              </label>
              <input
                type="number"
                value={blackMoldCriticalLimit}
                onChange={(e) => { setBlackMoldCriticalLimit(sanitizeIntegerInput(e.target.value)); setValidationErrors([]); }}
                className={`${inputClass} focus:border-red-500/50 focus:ring-red-500/20`}
                min="0"
                max="90"
                step="1"
              />
              <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1.5">
                {t('settings.thresholds.blackMold.criticalLimitDesc')}
              </p>
            </div>
          </div>

          {/* Biological Override Notice */}
          <div className="mt-3 p-3 rounded-md bg-amber-500/5 border border-amber-500/15 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              <span className="font-semibold text-amber-400">{t('settings.thresholds.notice.title')}</span> {t('settings.thresholds.notice.text', { organism: t('settings.thresholds.notice.organism') })}
            </p>
          </div>
        </div>
      </div>

      {/* Alert Preferences */}
      <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-4 md:p-5 mb-3 md:mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t('settings.alerts.title')}</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-2">
              {t('settings.alerts.email')}
            </label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-500 dark:text-zinc-400 absolute ml-3" />
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder={t('settings.alerts.emailPlaceholder')}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md pl-10 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{t('settings.alerts.enable')}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {t('settings.alerts.enableDesc')}
              </p>
            </div>
            <button
              onClick={() => setAlertsEnabled(!alertsEnabled)}
              className={`
                relative w-11 h-6 rounded-full transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-emerald-500/30
                ${alertsEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}
              `}
            >
              <span
                className={`
                  absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
                  transition-transform duration-200
                  ${alertsEnabled ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Notification Preferences ═══ */}
      <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-4 md:p-5 mb-3 md:mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t('settings.notifications.title')}</h2>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            {t('settings.notifications.label')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { value: 'Low', label: t('settings.notifications.low'), color: 'emerald' },
              { value: 'Medium', label: t('settings.notifications.medium'), color: 'amber' },
              { value: 'High', label: t('settings.notifications.high'), color: 'red' },
            ].map((option) => {
              const isActive = emailAlertLevels.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setEmailAlertLevels((prev) =>
                      prev.includes(option.value)
                        ? prev.filter((l) => l !== option.value)
                        : [...prev, option.value]
                    );
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:border-zinc-600 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-2">
            {t('settings.notifications.hint')}
          </p>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 shadow-lg dark:shadow-xl rounded-lg p-4 md:p-5 mb-4 md:mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t('settings.appearance.title')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
              theme === 'light' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <Sun className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">{t('settings.appearance.light')}</span>
          </button>
          
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
              theme === 'dark' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <Moon className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">{t('settings.appearance.dark')}</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
              theme === 'system' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <Monitor className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">{t('settings.appearance.system')}</span>
          </button>
        </div>

        {/* Click Ripple Toggle */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200/60 dark:border-white/5">
          <div>
            <p className="text-sm text-zinc-900 dark:text-zinc-100">{t('settings.appearance.ripple.title')}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{t('settings.appearance.ripple.desc')}</p>
          </div>
          <button
            onClick={() => {
              const next = localStorage.getItem('moldguard-ripple-disabled') !== 'true';
              localStorage.setItem('moldguard-ripple-disabled', String(next));
              setRippleDisabled(next);
            }}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
              !rippleDisabled ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
              !rippleDisabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="
            bg-emerald-500 hover:bg-emerald-600 text-zinc-950
            px-5 py-2 rounded-md text-sm font-medium
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-emerald-500/30
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isSaving ? t('settings.save.saving') : t('settings.save.button')}
        </button>
      </div>
      </div>
    </div>
  );
}
