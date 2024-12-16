import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/languages/en.json";

export const resources = {
    en: {
        translation: en
    }
} as const;

i18n.use(initReactI18next).init({
    lng: 'en',
    interpolation: {
        escapeValue: false
    },
    resources
});

export default i18n;
