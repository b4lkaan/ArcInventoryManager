import React, { createContext, useState, useContext, useEffect } from 'react';

const STORAGE_KEY = 'arc_raiders_language';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    // Load saved preference on mount
    useEffect(() => {
        const savedLang = localStorage.getItem(STORAGE_KEY);
        if (savedLang) {
            setLanguage(savedLang);
        }
    }, []);

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
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
