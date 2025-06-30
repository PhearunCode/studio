'use client';
import { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { en } from '@/lib/i18n/en';
import { km } from '@/lib/i18n/km';

const translations = { en, km };

type Locale = 'en' | 'km';

// Function to get the initial locale from localStorage
const getInitialLocale = (): Locale => {
  if (typeof window !== 'undefined') {
    const storedLocale = localStorage.getItem('locale');
    if (storedLocale === 'en' || storedLocale === 'km') {
      return storedLocale;
    }
  }
  return 'en'; // Default to English
};


interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale());

  useEffect(() => {
    // When locale changes, update localStorage
    localStorage.setItem('locale', locale);
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const t = useCallback((key: string, defaultText?: string): string => {
    const keys = key.split('.');
    let result: any = translations[locale];
    
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation not found in current locale
        let fallbackResult: any = translations['en'];
        for (const k_fb of keys) {
            fallbackResult = fallbackResult?.[k_fb];
        }
        if (fallbackResult !== undefined) return fallbackResult;

        // Use default text if provided, otherwise return the key
        return defaultText ?? key;
      }
    }
    return result;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
