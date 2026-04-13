import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from './locales/en/common.json';
import neCommon from './locales/ne/common.json';
import enAuth from './locales/en/auth.json';
import neAuth from './locales/ne/auth.json';
import enLivestock from './locales/en/livestock.json';
import neLivestock from './locales/ne/livestock.json';
import enProfile from './locales/en/profile.json';
import neProfile from './locales/ne/profile.json';
import enVaccination from './locales/en/vaccination.json';
import neVaccination from './locales/ne/vaccination.json';
import enMedical from './locales/en/medical.json';
import neMedical from './locales/ne/medical.json';
import enInsurance from './locales/en/insurance.json';
import neInsurance from './locales/ne/insurance.json';
import enAppointments from './locales/en/appointments.json';
import neAppointments from './locales/ne/appointments.json';
import enProfileTransfer from './locales/en/profileTransfer.json';
import neProfileTransfer from './locales/ne/profileTransfer.json';
import enPayment from './locales/en/payment.json';
import nePayment from './locales/ne/payment.json';
import enDashboard from './locales/en/dashboard.json';
import neDashboard from './locales/ne/dashboard.json';
import enVetDashboard from './locales/en/vetDashboard.json';
import neVetDashboard from './locales/ne/vetDashboard.json';
import enMessages from './locales/en/messages.json';
import neMessages from './locales/ne/messages.json';
import enAdmin from './locales/en/admin.json';
import neAdmin from './locales/ne/admin.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        livestock: enLivestock,
        profile: enProfile,
        vaccination: enVaccination,
        medical: enMedical,
        insurance: enInsurance,
        appointments: enAppointments,
        profileTransfer: enProfileTransfer,
        payment: enPayment,
        dashboard: enDashboard,
        vetDashboard: enVetDashboard,
        messages: enMessages,
        admin: enAdmin
      },
      ne: {
        common: neCommon,
        auth: neAuth,
        livestock: neLivestock,
        profile: neProfile,
        vaccination: neVaccination,
        medical: neMedical,
        insurance: neInsurance,
        appointments: neAppointments,
        profileTransfer: neProfileTransfer,
        payment: nePayment,
        dashboard: neDashboard,
        vetDashboard: neVetDashboard,
        messages: neMessages,
        admin: neAdmin
      }
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    saveMissing: true,
    missingKeyHandler: (lng, ns, key) => {
      console.warn(`Missing translation: ${lng}/${ns}/${key}`);
    }
  });

export default i18n;
