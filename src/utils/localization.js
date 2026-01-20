/**
 * Supported languages based on API data structure
 * Ordered with common languages first
 */
export const supportedLanguages = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'it', label: 'Italiano' },
    { code: 'pt', label: 'Português' },
    { code: 'pt-BR', label: 'Português (BR)' },
    { code: 'ru', label: 'Русский' },
    { code: 'ja', label: '日本語' },
    { code: 'kr', label: '한국어' },
    { code: 'zh-CN', label: '简体中文' },
    { code: 'zh-TW', label: '繁體中文' },
    { code: 'pl', label: 'Polski' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'uk', label: 'Українська' },
    { code: 'da', label: 'Dansk' },
    { code: 'no', label: 'Norsk' },
    { code: 'hr', label: 'Hrvatski' },
    { code: 'sr', label: 'Srpski' },
    { code: 'he', label: 'עברית' },
];

/**
 * Safely extract localized text from data.
 * @param {string|object} data - Either a plain string or an object with language keys
 * @param {string} language - The language code to extract (e.g., 'en', 'de')
 * @returns {string} The localized string, with fallback to English or first available
 */
export const getLocalizedValue = (data, language) => {
    // Handle null/undefined
    if (!data) return '';

    // If data is just a string (not localized), return it as-is
    if (typeof data === 'string') return data;

    // If data is an object, extract the requested language
    // Fallback chain: requested language -> English -> first available value
    return data[language] || data['en'] || Object.values(data)[0] || '';
};
