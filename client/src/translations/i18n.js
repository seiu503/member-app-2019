import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// convert existing JSON files created for react-localize-redux to a format usable by the i18nnext package
import globalTranslations from "./globalTranslations";
const resources = {
  en: {
    translation: {}
  },
  es: {
    translation: {}
  },
  ru: {
    translation: {}
  },
  vi: {
    translation: {}
  },
  zh: {
    translation: {}
  }
};
Object.keys(globalTranslations).forEach(key => {
  resources.en.translation[key] = globalTranslations[key][0];
  resources.es.translation[key] = globalTranslations[key][1];
  resources.ru.translation[key] = globalTranslations[key][2];
  resources.vi.translation[key] = globalTranslations[key][3];
  resources.zh.translation[key] = globalTranslations[key][4];
});

console.log(resources);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    debug: true,
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    }
  });

export default i18n;
