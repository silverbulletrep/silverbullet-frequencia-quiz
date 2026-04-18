import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationDE from './locales/de/translation.json';
import translationPT from './locales/pt/translation.json';

const resources = {
  de: {
    translation: translationDE
  },
  pt: {
    translation: translationPT
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    debug: import.meta.env.DEV,
    load: 'languageOnly',
    supportedLngs: ['de', 'pt'],
    interpolation: {
      escapeValue: false // React já protege contra XSS
    }
  });

export default i18n;
