import update from "immutability-helper";
import * as formElements from "../../components/SubmissionFormElements";
import * as utils from "../../utils";

import {
  ADD_SUBMISSION_REQUEST,
  ADD_SUBMISSION_SUCCESS,
  ADD_SUBMISSION_FAILURE,
  UPDATE_SUBMISSION_REQUEST,
  UPDATE_SUBMISSION_SUCCESS,
  UPDATE_SUBMISSION_FAILURE,
  GET_ALL_SUBMISSIONS_REQUEST,
  GET_ALL_SUBMISSIONS_SUCCESS,
  GET_ALL_SUBMISSIONS_FAILURE,
  CREATE_CAPE_REQUEST,
  CREATE_CAPE_SUCCESS,
  CREATE_CAPE_FAILURE,
  UPDATE_CAPE_REQUEST,
  UPDATE_CAPE_SUCCESS,
  UPDATE_CAPE_FAILURE,
  GET_CAPE_BY_SFID_REQUEST,
  GET_CAPE_BY_SFID_SUCCESS,
  GET_CAPE_BY_SFID_FAILURE,
  SAVE_SALESFORCEID,
  SAVE_SUBMISSIONID,
  HANDLE_INPUT,
  CLEAR_FORM,
  SET_CAPE_OPTIONS,
  SET_PAYMENT_DETAILS_CAPE,
  SET_PAYMENT_DETAILS_DUES,
  SET_CURRENT_SUBMISSION
} from "../actions/apiSubmissionActions";

import {
  GET_SF_CONTACT_REQUEST,
  GET_SF_CONTACT_SUCCESS,
  GET_SF_CONTACT_FAILURE,
  GET_SF_CONTACT_DID_REQUEST,
  GET_SF_CONTACT_DID_SUCCESS,
  GET_SF_CONTACT_DID_FAILURE,
  CREATE_SF_CONTACT_REQUEST,
  CREATE_SF_CONTACT_SUCCESS,
  CREATE_SF_CONTACT_FAILURE,
  LOOKUP_SF_CONTACT_REQUEST,
  LOOKUP_SF_CONTACT_SUCCESS,
  LOOKUP_SF_CONTACT_FAILURE,
  UPDATE_SF_CONTACT_SUCCESS,
  UPDATE_SF_CONTACT_REQUEST,
  UPDATE_SF_CONTACT_FAILURE,
  CREATE_SF_OMA_REQUEST,
  CREATE_SF_OMA_SUCCESS,
  CREATE_SF_OMA_FAILURE,
  GET_SF_EMPLOYERS_REQUEST,
  GET_SF_EMPLOYERS_SUCCESS,
  GET_SF_EMPLOYERS_FAILURE,
  CREATE_SF_CAPE_REQUEST,
  CREATE_SF_CAPE_SUCCESS,
  CREATE_SF_CAPE_FAILURE
} from "../actions/apiSFActions";

export const INITIAL_STATE = {
  error: null,
  salesforceId: null,
  submissionId: null,
  formPage1: {
    mm: "",
    homeState: "OR",
    preferredLanguage: "English",
    employerType: "",
    employerId: "",
    prefillEmployerId: "",
    prefillEmployerParentId: "",
    firstName: "",
    lastName: "",
    homeEmail: "",
    legalLanguage: "",
    paymentRequired: false,
    paymentType: "Card",
    paymentMethodAdded: false,
    medicaidResidents: 0,
    immediatePastMemberStatus: "Not a Member",
    afhDuesRate: 0,
    newCardNeeded: true,
    whichCard: "",
    capeAmount: "",
    donationFrequency: "Monthly",
    checkoff: true,
    prefillEmployerChanged: false,
    howManyTabs: 3,
    textAuthOptOut: false
  },
  formPage2: {
    gender: "",
    firstName: "",
    lastName: "",
    homeEmail: ""
  },
  employerNames: [""],
  employerObjects: [{ Name: "", Sub_Division__c: "" }],
  redirect: false,
  allSubmissions: [],
  currentSubmission: {},
  cape: {
    id: "",
    memberShortId: "",
    donationAmount: 0,
    paymentMethod: "",
    donationFrequency: "Monthly",
    activeMethodLast4: "",
    cardBrand: "",
    paymentErrorHold: false,
    monthlyOptions: [10, 13, 15, "Other"],
    oneTimeOptions: [15, 20, 25, "Other"],
    oneTimePaymentId: "",
    oneTimePaymentStatus: ""
  },
  currentCAPE: {},
  allCAPE: []
};

function Submission(state = INITIAL_STATE, action) {
  let error;

  switch (action.type) {
    case HANDLE_INPUT:
      return update(state, {
        formPage1: {
          [action.payload.name]: { $set: action.payload.value }
        }
      });

    case CLEAR_FORM:
      return INITIAL_STATE;

    case SET_CAPE_OPTIONS:
      return update(state, {
        cape: {
          monthlyOptions: { $set: action.payload.monthlyOptions },
          oneTimeOptions: { $set: action.payload.oneTimeOptions }
        }
      });

    case SET_PAYMENT_DETAILS_CAPE:
      // console.log("SET_PAYMENT_DETAILS_CAPE");
      // console.log(action.payload);
      return update(state, {
        cape: {
          activeMethodLast4: { $set: action.payload.cardLast4 },
          cardBrand: { $set: action.payload.cardBrand }
        },
        formPage1: {
          paymentMethodAdded: { $set: true }
        }
      });

    case SET_PAYMENT_DETAILS_DUES:
      // console.log("SET_PAYMENT_DETAILS_DUES");
      // console.log(action.payload);
      return update(state, {
        payment: {
          activeMethodLast4: { $set: action.payload.cardLast4 },
          cardBrand: { $set: action.payload.cardBrand }
        },
        formPage1: {
          paymentMethodAdded: { $set: true }
        }
      });

    case SET_CURRENT_SUBMISSION:
      return update(state, {
        currentSubmission: { $set: action.payload },
        submissionId: { $set: action.payload.id }
      });

    case ADD_SUBMISSION_REQUEST:
    case UPDATE_SUBMISSION_REQUEST:
    case GET_SF_CONTACT_REQUEST:
    case GET_SF_EMPLOYERS_REQUEST:
    case LOOKUP_SF_CONTACT_REQUEST:
    case CREATE_SF_CONTACT_REQUEST:
    case CREATE_SF_OMA_REQUEST:
    case UPDATE_SF_CONTACT_REQUEST:
    case CREATE_SF_OMA_SUCCESS:
    case GET_ALL_SUBMISSIONS_REQUEST:
    case CREATE_CAPE_REQUEST:
    case CREATE_SF_CAPE_REQUEST:
    case CREATE_SF_CAPE_SUCCESS:
    case GET_CAPE_BY_SFID_REQUEST:
    case UPDATE_CAPE_REQUEST:
    case GET_SF_CONTACT_DID_REQUEST:
      return update(state, {
        error: { $set: null }
      });

    case GET_SF_EMPLOYERS_SUCCESS:
      // console.log(action.payload);
      const employerNames = action.payload
        ? action.payload.map(employer => employer.Name)
        : [""];
      return update(state, {
        employerNames: { $set: employerNames },
        employerObjects: { $set: action.payload }
      });

    case GET_SF_CONTACT_SUCCESS:
    case GET_SF_CONTACT_DID_SUCCESS:
      // console.log(action.payload);
      if (action.payload && action.payload.Account) {
        console.log("GET_SF_CONTACT_DID_SUCCESS");
        const { employerTypeMap } = formElements;
        // subDivision is stored in a different field depending on whether the
        // attached account/employer type is "Parent Employer" or "Agency"
        // and neither exist for Community Members bc it was created sloppily
        // and is missing several fields...
        let subDivision = "";
        if (action.payload.Account.WS_Subdivision_from_Agency__c) {
          subDivision = action.payload.Account.WS_Subdivision_from_Agency__c;
        } else if (action.payload.Account.Sub_Division__c) {
          subDivision = action.payload.Account.Sub_Division__c;
        } else if (
          // SEIU 503 Staff edge case
          action.payload.Account.CVRSOS__ParentName__c === "SEIU LOCAL 503 OPEU"
        ) {
          subDivision = "SEIU LOCAL 503 OPEU";
        } else if (
          // Community members edge case
          !action.payload.Account.WS_Subdivision_from_Agency__c &&
          !action.payload.Account.Sub_Division__c
        ) {
          subDivision = action.payload.Account.Name;
        }

        const employerType = employerTypeMap[subDivision];

        // if employer attached to contact record is 'Employer' record type,
        // use Account Name. if it's 'Worksite' record type, use Parent Name
        // if it's an 'orphaned' employer name
        // (employer a parent that was removed from the query), set it to
        // blank string
        let employerName = "";
        if (action.payload.Account.RecordTypeId === "01261000000ksTuAAI") {
          employerName = action.payload.Account.Name;
        } else if (action.payload.Account.CVRSOS__ParentName__c) {
          employerName = action.payload.Account.CVRSOS__ParentName__c;
        }
        if (action.payload.Account.Name === "SEIU LOCAL 503 OPEU") {
          console.log("staff edge case");
          employerName = "";
        }
        console.log(`employerName: ${employerName}`);
        // split ethinicity string, provide true value for each ethnicity returned
        let ethnicities = [""];
        if (action.payload.Ethnicity__c) {
          ethnicities = action.payload.Ethnicity__c.split(", ");
        }
        const ethnicitiesObj = {};
        ethnicities.map(item => {
          if (item === "Declined") {
            ethnicitiesObj.declined = true;
          } else {
            ethnicitiesObj[item] = true;
          }
          return null;
        });
        const zip = action.payload.MailingPostalCode
          ? action.payload.MailingPostalCode.slice(0, 5)
          : "";
        const parentId = action.payload.Account.Parent
          ? action.payload.Account.Parent.Id
          : null;
        const paymentRequired = utils.isPaymentRequired(employerType);
        return update(state, {
          salesforceId: { $set: action.payload.Id },
          formPage1: {
            mobilePhone: { $set: action.payload.MobilePhone },
            employerName: { $set: employerName },
            employerType: { $set: employerType },
            prefillEmployerId: { $set: action.payload.Account.Id },
            prefillEmployerParentId: { $set: parentId },
            firstName: { $set: action.payload.FirstName },
            lastName: { $set: action.payload.LastName },
            homeStreet: { $set: action.payload.MailingStreet },
            homeCity: { $set: action.payload.MailingCity },
            homeState: { $set: action.payload.MailingState },
            homeZip: { $set: zip },
            homeEmail: { $set: action.payload.Home_Email__c },
            preferredLanguage: { $set: action.payload.Preferred_Language__c },
            termsAgree: { $set: false },
            signature: { $set: null },
            textAuthOptOut: { $set: false },
            immediatePastMemberStatus: {
              $set: action.payload.Binary_Membership__c
            },
            paymentRequired: { $set: paymentRequired }
          },
          formPage2: {
            africanOrAfricanAmerican: {
              $set: ethnicitiesObj.africanOrAfricanAmerican || false
            },
            arabAmericanMiddleEasternOrNorthAfrican: {
              $set:
                ethnicitiesObj.arabAmericanMiddleEasternOrNorthAfrican || false
            },
            asianOrAsianAmerican: {
              $set: ethnicitiesObj.asianOrAsianAmerican || false
            },
            hispanicOrLatinx: {
              $set: ethnicitiesObj.hispanicOrLatinx || false
            },
            nativeAmericanOrIndigenous: {
              $set: ethnicitiesObj.nativeAmericanOrIndigenous || false
            },
            nativeHawaiianOrOtherPacificIslander: {
              $set: ethnicitiesObj.nativeHawaiianOrOtherPacificIslander || false
            },
            white: { $set: ethnicitiesObj.white || false },
            other: { $set: ethnicitiesObj.other || false },
            declined: { $set: ethnicitiesObj.declined || false },
            mailToCity: { $set: action.payload.OtherCity },
            mailToState: { $set: action.payload.OtherState },
            mailToStreet: { $set: action.payload.OtherStreet },
            mailToZip: { $set: action.payload.OtherPostalCode },
            lgbtqId: { $set: action.payload.LGBTQ_ID__c },
            transId: { $set: action.payload.Trans_ID__c },
            disabilityId: { $set: action.payload.Disability_ID__c },
            deafOrHardOfHearing: {
              $set: action.payload.Deaf_or_hearing_impaired__c
            },
            blindOrVisuallyImpaired: {
              $set: action.payload.Blind_or_visually_impaired__c
            },
            gender: { $set: action.payload.Gender__c },
            genderOtherDescription: {
              $set: action.payload.Gender_Other_Description__c
            },
            genderPronoun: { $set: action.payload.Prounoun__c },
            jobTitle: { $set: action.payload.Title },
            worksite: {
              $set: action.payload.Worksite_manual_entry_from_webform__c
            },
            workEmail: { $set: action.payload.Work_Email__c },
            workPhone: { $set: action.payload.Work_Phone__c },
            hireDate: { $set: action.payload.Hire_Date__c },
            firstName: { $set: action.payload.FirstName },
            lastName: { $set: action.payload.LastName },
            homeEmail: { $set: action.payload.Home_Email__c }
          },
          payment: {
            currentCAPEFromSF: { $set: action.payload.Current_CAPE__c }
          },
          error: { $set: null }
        });
      } else {
        return INITIAL_STATE;
      }

    case GET_CAPE_BY_SFID_SUCCESS: {
      return update(state, {
        cape: {
          id: { $set: action.payload.Id || action.payload.id },
          memberShortId: { $set: action.payload.member_short_id },
          donationAmount: { $set: action.payload.cape_amount },
          paymentMethod: { $set: action.payload.payment_method },
          donationFrequency: { $set: action.payload.donation_frequency },
          activeMethodLast4: { $set: action.payload.active_method_last_four },
          cardBrand: { $set: action.payload.card_brand }
        }
      });
    }

    case ADD_SUBMISSION_SUCCESS:
      return update(state, {
        salesforceId: { $set: action.payload.salesforce_id },
        submissionId: { $set: action.payload.submission_id },
        currentSubmission: { $set: action.payload.currentSubmission },
        error: { $set: null }
      });

    case CREATE_CAPE_SUCCESS:
    case UPDATE_CAPE_SUCCESS:
      return update(state, {
        cape: {
          id: { $set: action.payload.cape_id }
        },
        currentCAPE: { $set: action.payload.currentCAPE },
        error: { $set: null }
      });

    case POST_ONE_TIME_PAYMENT_SUCCESS:
      return update(state, {
        cape: {
          oneTimePaymentId: { $set: action.payload.id }
        },
        error: { $set: null }
      });

    case UPDATE_SUBMISSION_SUCCESS:
      return update(state, {
        submissionId: { $set: action.payload.submission_id },
        error: { $set: null }
      });

    case GET_ALL_SUBMISSIONS_SUCCESS:
      return update(state, {
        allSubmissions: { $set: action.payload },
        error: { $set: null }
      });

    case LOOKUP_SF_CONTACT_SUCCESS:
      return update(state, {
        salesforceId: { $set: action.payload.salesforce_id },
        payment: {
          currentCAPEFromSF: { $set: action.payload.Current_CAPE__c }
        },
        error: { $set: null },
        redirect: { $set: true }
      });

    case CREATE_SF_CONTACT_SUCCESS:
    case UPDATE_SF_CONTACT_SUCCESS:
      return update(state, {
        salesforceId: { $set: action.payload.salesforce_id },
        error: { $set: null }
      });

    case ADD_SUBMISSION_FAILURE:
    case GET_SF_CONTACT_FAILURE:
    case UPDATE_SUBMISSION_FAILURE:
    case GET_SF_EMPLOYERS_FAILURE:
    case LOOKUP_SF_CONTACT_FAILURE:
    case CREATE_SF_CONTACT_FAILURE:
    case CREATE_SF_OMA_FAILURE:
    case UPDATE_SF_CONTACT_FAILURE:
    case GET_ALL_SUBMISSIONS_FAILURE:
    case CREATE_SF_CAPE_FAILURE:
    case CREATE_CAPE_FAILURE:
    case GET_CAPE_BY_SFID_FAILURE:
    case UPDATE_CAPE_FAILURE:
    case GET_SF_CONTACT_DID_FAILURE:
      if (typeof action.payload.message === "string") {
        error = action.payload.message;
      } else {
        error = "Sorry, something went wrong :(\nPlease try again.";
      }
      return update(state, {
        error: { $set: error }
      });

    case SAVE_SALESFORCEID:
      return update(state, {
        salesforceId: { $set: action.payload.salesforceId }
      });

    case SAVE_SUBMISSIONID:
      return update(state, {
        submissionId: { $set: action.payload.submissionId }
      });

    default:
      return state;
  }
}

export default Submission;
