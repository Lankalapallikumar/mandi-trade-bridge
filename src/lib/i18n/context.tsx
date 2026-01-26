'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage, TranslationKey } from './types';
import { 
  DEFAULT_LANGUAGE, 
  getStoredLanguage, 
  setStoredLanguage, 
  loadTranslations,
  getNestedValue,
  interpolate,
  formatCurrency as formatCurrencyUtil,
  formatNumber as formatNumberUtil,
  formatDate as formatDateUtil,
  SUPPORTED_LANGUAGES
} from './index';

interface I18nContextType {
  language: SupportedLanguage;
  translations: TranslationKey;
  isLoading: boolean;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  formatCurrency: (amount: number) => string;
  formatNumber: (number: number) => string;
  formatDate: (date: Date | string) => string;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLanguage?: SupportedLanguage;
}

export function I18nProvider({ children, initialLanguage }: I18nProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(
    initialLanguage || DEFAULT_LANGUAGE
  );
  const [translations, setTranslations] = useState<TranslationKey>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations when language changes
  useEffect(() => {
    const loadLanguageTranslations = async () => {
      setIsLoading(true);
      try {
        const newTranslations = await loadTranslations(language);
        setTranslations(newTranslations);
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguageTranslations();
  }, [language]);

  // Initialize language from storage on client side
  useEffect(() => {
    if (!initialLanguage) {
      const storedLanguage = getStoredLanguage();
      setLanguageState(storedLanguage);
    }
  }, [initialLanguage]);

  // Set language and persist to storage
  const setLanguage = (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
    setStoredLanguage(newLanguage);
  };

  // Translation function
  const t = (key: string, variables?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations, key);
    
    if (variables) {
      return interpolate(translation, variables);
    }
    
    return translation;
  };

  // Localized formatting functions
  const formatCurrency = (amount: number): string => {
    return formatCurrencyUtil(amount, language);
  };

  const formatNumber = (number: number): string => {
    return formatNumberUtil(number, language);
  };

  const formatDate = (date: Date | string): string => {
    return formatDateUtil(date, language);
  };

  const contextValue: I18nContextType = {
    language,
    translations,
    isLoading,
    setLanguage,
    t,
    formatCurrency,
    formatNumber,
    formatDate,
    supportedLanguages: SUPPORTED_LANGUAGES
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use i18n context
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  
  return context;
}

// Hook for translation only (lighter alternative)
export function useTranslation() {
  const { t, language, isLoading } = useI18n();
  return { t, language, isLoading };
}