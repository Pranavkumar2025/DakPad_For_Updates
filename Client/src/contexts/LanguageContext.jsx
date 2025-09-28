import React, { createContext, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set the document direction based on language
    document.dir = i18n.language === "hi" ? "ltr" : "ltr"; // Both languages are LTR

    // Add language class to body for CSS customization
    document.body.className = document.body.className.replace(/lang-\w+/g, "");
    document.body.classList.add(`lang-${i18n.language}`);
  }, [i18n.language]);

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const getDisplayName = (languageCode) => {
    const names = {
      en: "English",
      hi: "हिंदी",
    };
    return names[languageCode] || languageCode;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage: i18n.language,
        changeLanguage,
        getCurrentLanguage,
        getDisplayName,
        isHindi: i18n.language === "hi",
        isEnglish: i18n.language === "en",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
