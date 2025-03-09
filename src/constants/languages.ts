import { LanguageCode } from '@/types';

/**
 * Maps language codes to their full names
 */
export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
  bn: 'Bengali',
  other: 'Other'
};

/**
 * Maps language codes to their flag emojis
 */
export const LANGUAGE_FLAGS: Record<LanguageCode, string> = {
  en: '🇺🇸',
  es: '🇲🇽',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  pt: '🇵🇹',
  ru: '🇷🇺',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ko: '🇰🇷',
  ar: '🇸🇦',
  hi: '🇮🇳',
  bn: '🇧��',
  other: '🌐'
}; 
