import update from "immutability-helper";
import moment from "moment";
import * as formElements from "../../components/SubmissionFormElements";

import {
  ADD_SUBMISSION_REQUEST,
  ADD_SUBMISSION_SUCCESS,
  ADD_SUBMISSION_FAILURE,
  UPDATE_SUBMISSION_REQUEST,
  UPDATE_SUBMISSION_SUCCESS,
  UPDATE_SUBMISSION_FAILURE,
  SAVE_SALESFORCEID
} from "../actions/apiSubmissionActions";

import {
  GET_SF_CONTACT_REQUEST,
  GET_SF_CONTACT_SUCCESS,
  GET_SF_CONTACT_FAILURE,
  GET_SF_EMPLOYERS_REQUEST,
  GET_SF_EMPLOYERS_SUCCESS,
  GET_SF_EMPLOYERS_FAILURE,
  LOOKUP_SF_CONTACT_REQUEST,
  LOOKUP_SF_CONTACT_SUCCESS,
  LOOKUP_SF_CONTACT_FAILURE
} from "../actions/apiSFActions";

export const INITIAL_STATE = {
  error: null,
  salesforceId: null,
  formPage1: {
    mm: "",
    homeState: "OR",
    preferredLanguage: "English",
    employerType: ""
  },
  employerNames: [""],
  employerObjects: [{ Name: "", Sub_Division__c: "" }],
  formPage2: {}
};

function Submission(state = INITIAL_STATE, action) {
  let error;

  switch (action.type) {
    case ADD_SUBMISSION_REQUEST:
    case UPDATE_SUBMISSION_REQUEST:
    case GET_SF_CONTACT_REQUEST:
    case GET_SF_EMPLOYERS_REQUEST:
    case LOOKUP_SF_CONTACT_REQUEST:
      return update(state, {
        error: { $set: null }
      });

    case GET_SF_EMPLOYERS_SUCCESS:
      const employerNames = action.payload
        ? action.payload.map(employer => employer.Name)
        : [""];
      return update(state, {
        employerNames: { $set: employerNames },
        employerObjects: { $set: action.payload }
      });

    case GET_SF_CONTACT_SUCCESS:
      const { employerTypeMap } = formElements;
      // subDivision is stored in a different field depending on whether the
      // attached account/employer type is "Parent Employer" or "Agency"
      const subDivision = action.payload.Account.WS_Subdivision_from_Agency__c
        ? action.payload.Account.WS_Subdivision_from_Agency__c
        : action.payload.Account.Sub_Division__c;
      const employerType = employerTypeMap[subDivision];
      // if employer attached to contact record is 'Employer' record type,
      // use Account Name. if it's 'Worksite' record type, use Parent Name
      const employerName =
        action.payload.Account.RecordTypeId === "01261000000ksTuAAI"
          ? action.payload.Account.Name
          : action.payload.Account.CVRSOS__ParentName__c;
      // split ethinicity string, provide true value for each ethnicity returned
      const ethnicities = action.payload.Ethnicity__c
        ? action.payload.Ethnicity__c.split(", ")
        : [""];
      const ethnicitiesObj = {};
      for (const item of ethnicities) {
        if (item === "Declined") {
          ethnicitiesObj.declined = true;
        } else {
          ethnicitiesObj[item] = true;
        }
      }
      return update(state, {
        formPage1: {
          mm: { $set: moment(action.payload.Birthdate).format("MM") },
          dd: { $set: moment(action.payload.Birthdate).format("DD") },
          yyyy: { $set: moment(action.payload.Birthdate).format("YYYY") },
          mobilePhone: { $set: action.payload.MobilePhone },
          employerName: { $set: employerName },
          employerType: { $set: employerType },
          firstName: { $set: action.payload.FirstName },
          lastName: { $set: action.payload.LastName },
          homeStreet: { $set: action.payload.MailingStreet },
          homeCity: { $set: action.payload.MailingCity },
          homeState: { $set: action.payload.MailingState },
          homeZip: { $set: action.payload.MailingPostalCode },
          homeEmail: { $set: action.payload.Home_Email__c },
          preferredLanguage: { $set: action.payload.Preferred_Language__c },
          termsAgree: { $set: false },
          signature: { $set: null },
          textAuthOptOut: { $set: false }
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
          hispanicOrLatinx: { $set: ethnicitiesObj.hispanicOrLatinx || false },
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
          hireDate: { $set: action.payload.Hire_Date__c }
        },
        error: { $set: null }
      });

    case ADD_SUBMISSION_SUCCESS:
    case LOOKUP_SF_CONTACT_SUCCESS:
      console.log(action.payload);
      return update(state, {
        salesforceId: { $set: action.payload.salesforce_id },
        submissionId: { $set: action.payload.submission_id },
        error: { $set: null }
      });

    case UPDATE_SUBMISSION_SUCCESS:
      return update(state, {
        formPage2SubmitSucess: { $set: true }
      });

    case ADD_SUBMISSION_FAILURE:
    case GET_SF_CONTACT_FAILURE:
    case UPDATE_SUBMISSION_FAILURE:
    case GET_SF_EMPLOYERS_FAILURE:
    case LOOKUP_SF_CONTACT_FAILURE:
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

    default:
      return state;
  }
}

export default Submission;
