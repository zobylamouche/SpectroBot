import React, { createContext, useContext, useState, useCallback } from 'react';
import { translations, languageNames } from './translations';

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Get initial language from localStorage or browser preference
  const getInitialLanguage = () => {
    const saved = localStorage.getItem('spectrobot-language');
    if (saved && translations[saved]) {
      return saved;
    }
    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (translations[browserLang]) {
      return browserLang;
    }
    return 'en';
  };
  
  const [language, setLanguageState] = useState(getInitialLanguage);
  
  const setLanguage = useCallback((lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('spectrobot-language', lang);
    }
  }, []);
  
  // Translation function
  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Fallback to English
        value = translations['en'];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object') {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }
    
    return value || key;
  }, [language]);
  
  // Get available languages with names and flags
  const availableLanguages = Object.keys(translations).map(code => ({
    code,
    name: languageNames[code]?.name || code,
    flag: languageNames[code]?.flag || '🌐'
  }));
  
  // Get full language name for API calls
  const getLanguageName = useCallback(() => {
    const names = {
      en: 'English',
      fr: 'French',
      es: 'Spanish',
      de: 'German'
    };
    return names[language] || 'English';
  }, [language]);
  
  const value = {
    language,
    setLanguage,
    t,
    availableLanguages,
    getLanguageName
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
