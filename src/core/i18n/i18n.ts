import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { de } from './locales/de';
import { en } from './locales/en';
import { es } from './locales/es';

export const LANGUAGES = ['en', 'es', 'de'] as const;
export type Language = (typeof LANGUAGES)[number];
export type LanguagePreference = Language | 'system';

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
};

export const i18n = createInstance();

const FALLBACK_REGION: Record<Language, string> = { en: 'en-US', es: 'es-ES', de: 'de-DE' };

const isLanguage = (value: string | null | undefined): value is Language =>
  LANGUAGES.includes(value as Language);

export function resolveLanguage(preference: LanguagePreference): Language {
  if (preference !== 'system') return preference;
  const device = getLocales()[0]?.languageCode;
  return isLanguage(device) ? device : 'en';
}

export function localeFor(language: Language): string {
  const device = getLocales()[0];
  return device?.languageCode === language ? device.languageTag : FALLBACK_REGION[language];
}

export function initI18n(preference: LanguagePreference) {
  if (i18n.isInitialized) return i18n;
  void i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, es: { translation: es }, de: { translation: de } },
    lng: resolveLanguage(preference),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return i18n;
}

export function changeLanguage(preference: LanguagePreference) {
  return i18n.changeLanguage(resolveLanguage(preference));
}
