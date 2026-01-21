import React, { createContext, useState, useContext } from 'react';

const STORAGE_KEY = 'arc_raiders_language';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Load saved preference on mount via lazy initialization to avoid set-state-in-effect warning
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem(STORAGE_KEY) || 'en';
    });

    // Save preference and update state
    const changeLanguage = (langCode) => {
        setLanguage(langCode);
        localStorage.setItem(STORAGE_KEY, langCode);
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

/**
 * Hook to access language context
 * @returns {{ language: string, changeLanguage: (langCode: string) => void }}
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
