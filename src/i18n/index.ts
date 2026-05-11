import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import enRegister from "./locales/en/register.json";

import frCommon from "./locales/fr/common.json";
import frRegister from "./locales/fr/register.json";

const locale = navigator.language.split("-")[0];

console.log("LOCALE",locale);

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        register: enRegister
      },
      fr: {
        common: frCommon,
        register: frRegister
      }
    },
    lng: locale,
    fallbackLng: "en",
    ns: ["common", "register"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;