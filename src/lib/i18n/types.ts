// Internationalization types for LocalTrade Bridge

export type SupportedLanguage = 
  | 'en'    // English
  | 'hi'    // Hindi
  | 'te';   // Telugu

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

export interface TranslationKey {
  [key: string]: string | TranslationKey;
}

export interface Translations {
  [language: string]: TranslationKey;
}

export interface AITranslationRequest {
  text: string;
  fromLanguage: SupportedLanguage;
  toLanguage: SupportedLanguage;
  context?: 'product' | 'negotiation' | 'ui' | 'general';
}

export interface AITranslationResponse {
  translatedText: string;
  confidence: number;
  detectedLanguage?: SupportedLanguage;
}