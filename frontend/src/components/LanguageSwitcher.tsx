import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    i18n.language === 'en'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
                EN
            </button>
            <button
                onClick={() => changeLanguage('vi')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    i18n.language === 'vi'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
                VI
            </button>
        </div>
    );
}
