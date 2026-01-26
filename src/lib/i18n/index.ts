// Internationalization system for LocalTrade Bridge

import { SupportedLanguage, LanguageConfig, TranslationKey } from './types';

// Language configurations - only include languages we have translations for
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    rtl: false
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    rtl: false
  }
];

// Available language codes
const AVAILABLE_LANGUAGES: SupportedLanguage[] = ['en', 'hi', 'te'];

// Default language
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

// Language storage key
export const LANGUAGE_STORAGE_KEY = 'localtrade-language';

// Get browser language preference
export function getBrowserLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
  
  return AVAILABLE_LANGUAGES.includes(browserLang) ? browserLang : DEFAULT_LANGUAGE;
}

// Get stored language preference
export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage;
    
    return stored && AVAILABLE_LANGUAGES.includes(stored) ? stored : getBrowserLanguage();
  } catch {
    return getBrowserLanguage();
  }
}

// Store language preference
export function setStoredLanguage(language: SupportedLanguage): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.warn('Failed to store language preference:', error);
  }
}

// Import translation files statically
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import teTranslations from './locales/te.json';

// Static translations map
const TRANSLATIONS_MAP: Record<SupportedLanguage, TranslationKey> = {
  'en': enTranslations,
  'hi': hiTranslations,
  'te': teTranslations
};

// Load translation file
export async function loadTranslations(language: SupportedLanguage): Promise<TranslationKey> {
  try {
    // Only load translations for available languages
    if (!AVAILABLE_LANGUAGES.includes(language)) {
      language = DEFAULT_LANGUAGE;
    }
    
    // Use static imports instead of dynamic imports
    const translations = TRANSLATIONS_MAP[language];
    if (translations) {
      return translations;
    }
    
    // Fallback to English if translation not found
    return TRANSLATIONS_MAP[DEFAULT_LANGUAGE];
  } catch (loadError) {
    console.warn(`Failed to load translations for ${language}, falling back to English`);
    return TRANSLATIONS_MAP[DEFAULT_LANGUAGE];
  }
}

// Get nested translation value
export function getNestedValue(obj: TranslationKey, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return key if translation not found
    }
  }
  
  return typeof current === 'string' ? current : path;
}

// Interpolate variables in translation strings
export function interpolate(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
}

// Format currency for different languages
export function formatCurrency(amount: number, language: SupportedLanguage): string {
  const formatter = new Intl.NumberFormat(getLocaleCode(language), {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
}

// Format numbers for different languages
export function formatNumber(number: number, language: SupportedLanguage): string {
  const formatter = new Intl.NumberFormat(getLocaleCode(language));
  return formatter.format(number);
}

// Format dates for different languages
export function formatDate(date: Date | string, language: SupportedLanguage): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const formatter = new Intl.DateTimeFormat(getLocaleCode(language), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return formatter.format(dateObj);
}

// Get locale code for Intl APIs
function getLocaleCode(language: SupportedLanguage): string {
  const localeMap: Record<SupportedLanguage, string> = {
    'en': 'en-IN',
    'hi': 'hi-IN',
    'te': 'te-IN'
  };
  
  return localeMap[language] || 'en-IN';
}

// Get language configuration
export function getLanguageConfig(language: SupportedLanguage): LanguageConfig {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === language) || SUPPORTED_LANGUAGES[0];
}

// Detect text language (simple heuristic)
export function detectLanguage(text: string): SupportedLanguage {
  // Simple detection based on character sets
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari (Hindi)
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
  
  return 'en'; // Default to English
}