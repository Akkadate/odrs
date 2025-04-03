import React, { createContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'th'; // Default to Thai
  });

  // Set the language in i18n when the component mounts or language changes
  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  }, [language, i18n]);

  // Toggle between Thai and English
  const toggleLanguage = () => {
    setLanguage(prevLanguage => (prevLanguage === 'th' ? 'en' : 'th'));
  };

  // Change to specific language
  const changeLanguage = (lang) => {
    if (lang === 'th' || lang === 'en') {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;