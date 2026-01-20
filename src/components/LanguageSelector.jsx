import { useLanguage } from '../context/LanguageContext';
import { supportedLanguages } from '../utils/localization';
import './LanguageSelector.css';

export default function LanguageSelector() {
    const { language, changeLanguage } = useLanguage();

    return (
        <div className="language-selector">
            <span className="language-icon">🌐</span>
            <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="language-dropdown"
                aria-label="Select language"
            >
                {supportedLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
