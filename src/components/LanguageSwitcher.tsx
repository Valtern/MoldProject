import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const toggleLanguage = () => {
    const next = currentLang === 'en' ? 'id' : 'en';
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`
        flex items-center gap-1.5
        transition-all duration-200
        text-xs font-semibold text-slate-600 dark:text-zinc-400
        hover:text-emerald-600 dark:hover:text-emerald-400
        focus:outline-none
        ${className}
      `}
      title={currentLang === 'en' ? t('language.switch') + ' (ID)' : t('language.switch') + ' (EN)'}
      aria-label={currentLang === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
    >
      <Globe className="w-3.5 h-3.5 text-emerald-500" />
      <span>{currentLang.toUpperCase()}</span>
    </button>
  );
}
