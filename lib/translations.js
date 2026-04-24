// lib/translations.js
// Landing page translations for all 12 languages.
// Falls back to English for any missing key.

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'no', label: 'Norsk', flag: '🇳🇴' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'da', label: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', label: 'Suomi', flag: '🇫🇮' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
];

// Start with English as source of truth; Pass C fills the other 11.
const strings = {
  en: {
    heroTitle: 'Your Training',
    heroTagline: 'EVIDENCE-BASED COACHING, WHENEVER YOU NEED IT.',
    heroDesc: 'Training looks different for everyone. Coachly provides structured daily check-ins, progress tracking, and clinically validated questionnaires — so your coach always has the context they need.',
    importDataTitle: 'IMPORT DATA',
    codeLabel: 'CODE (FROM MOBILE APP):',
    codePlaceholder: 'Enter code',
    startBtn: 'START',
    invalidCodeFormat: 'Enter a 6-digit code.',
    appStoreAvailable: 'Available on App Store and Google Play.',
    appStoreDownload: 'Download for free on your smartphone.',
    appStore: 'App Store',
    googlePlay: 'Google Play',
    copyright: 'Copyright 2026 – KBB Medic AS (org: 912 372 022)',
    contact: 'post@kbbmedic.no',
    chooseLanguage: 'Choose language',
  },
};

export function getTranslations(lang) {
  return { ...strings.en, ...(strings[lang] || {}) };
}

export default strings;
