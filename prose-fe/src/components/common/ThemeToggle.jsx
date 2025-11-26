import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';

export function ThemeToggle() {
    const { toggleTheme, isDark } = useTheme();
    const { t } = useI18n();

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center gap-2 bg-teal-600/50 px-3 py-4 rounded-lg border border-white/20 hover:bg-teal-500/70 transition-colors"
            aria-label={isDark ? t('switchToLightMode') : t('switchToDarkMode')}
        >
            {isDark ? (
                <>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-white text-sm font-medium">{t('lightMode')}</span>
                </>
            ) : (
                <>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span className="text-white text-sm font-medium">{t('darkMode')}</span>
                </>
            )}
        </button>
    );
}

