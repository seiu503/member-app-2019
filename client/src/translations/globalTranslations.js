import employerPickList from "./employerPickList.json";
import legalLanguage from "./legalLanguage.json";
import linkDeliveryPage from "./linkDeliveryPage.json";
import linkRequestForm from "./linkRequestForm.json";
import page1 from "./page1.json";
import page2 from "./page2.json";
import prefillModal from "./prefillModal.json";
import welcomeInfo from "./welcomeInfo.json";
import cape from "./cape.json";
import misc from "./misc.json";

// Import any new translation files above and add them to this object with spread operator.
// This object is imported in App.js so that all components in app have access to all translations.
// This way translation IDs can be referenced in components as `adultFosterCareType`
// instead of `employerPickList.adultFosterCareType`.
const globalTranslations = {
  ...employerPickList,
  ...legalLanguage,
  ...linkDeliveryPage,
  ...linkRequestForm,
  ...page1,
  ...page2,
  ...prefillModal,
  ...welcomeInfo,
  ...cape,
  ...misc
};

export default globalTranslations;
