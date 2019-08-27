import moment from "moment";
import reducer, { INITIAL_STATE } from "../../store/reducers/submission";
import {
  contactsTableFields,
  generateSFContactFieldList
} from "../../../../app/utils/fieldConfigs.js";

// this is a hack to allow the SubmissionFormPageComponent to import
// this object even though it is stored outside the /src directory
export const contactsTableFieldsExport = { ...contactsTableFields };
describe("submission reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual(INITIAL_STATE);
  });
  it("should handle all api REQUEST actions", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "ADD_SUBMISSION_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: null
    });
  });
  it("should handle all api FAILURE actions", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "ADD_SUBMISSION_FAILURE",
        payload: { message: "Some error" }
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: "Some error"
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "ADD_SUBMISSION_FAILURE",
        payload: { message: null }
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: "Sorry, something went wrong :(\nPlease try again."
    });
  });

  describe("successful actions return correct state", () => {
    test("addSubmission", () => {
      const action = {
        type: "ADD_SUBMISSION_SUCCESS",
        payload: {
          salesforce_id: "1",
          submission_id: "2"
        }
      };
      const expectedState = {
        ...INITIAL_STATE,
        salesforceId: "1",
        submissionId: "2"
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
    test("updateSubmission", () => {
      const action = {
        type: "UPDATE_SUBMISSION_SUCCESS",
        payload: {
          submission_id: "2"
        }
      };
      const expectedState = {
        ...INITIAL_STATE,
        submissionId: "2"
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
    test("getSFContact", () => {
      const payload = {
        Id: "123",
        Display_Name_for_forms__c: "string",
        Account: {
          CVRSOS__ParentName__c: "string",
          Name: "string",
          Id: "string",
          WS_Subdivision_from_Agency__c: "string",
          RecordTypeId: "string"
        },
        OtherCity: "string",
        OtherState: "or",
        OtherStreet: "string",
        OtherPostalCode: "12345",
        FirstName: "string",
        LastName: "string",
        Birthdate: moment("01-01-1999", "MM-DD-YYYY"),
        Preferred_Language__c: "string",
        MailingStreet: "string",
        MailingPostalCode: "12345",
        MailingState: "or",
        MailingCity: "string",
        Home_Email__c: "string@string.com",
        MobilePhone: "123-456-7890",
        Text_Authorization_Opt_Out__c: false,
        termsagree__c: true,
        Signature__c: "string",
        Online_Campaign_Source__c: "string",
        Signed_Card__c: "string",
        Ethnicity__c: "declined",
        LGBTQ_ID__c: false,
        Trans_ID__c: false,
        Disability_ID__c: false,
        Deaf_or_hearing_impaired__c: false,
        Blind_or_visually_impaired__c: false,
        Gender__c: "female",
        Gender_Other_Description__c: "",
        Prounoun__c: "other",
        Title: "",
        Hire_Date__c: "2019-11-11",
        Worksite_manual_entry_from_webform__c: "string",
        Work_Email__c: "string@string.com",
        Work_Phone__c: "123-456-7890",
        Binary_Membership__c: "Not a Member"
      };
      const action = {
        type: "GET_SF_CONTACT_SUCCESS",
        payload: payload
      };
      const expectedState = {
        ...INITIAL_STATE,
        formPage1: {
          mm: "01",
          dd: "01",
          yyyy: "1999",
          mobilePhone: "123-456-7890",
          employerName: "string",
          employerType: undefined,
          firstName: "string",
          lastName: "string",
          homeStreet: "string",
          homeCity: "string",
          homeState: "or",
          homeZip: "12345",
          immediatePastMemberStatus: "Not a Member",
          homeEmail: "string@string.com",
          preferredLanguage: "string",
          paymentRequired: false,
          termsAgree: false,
          signature: null,
          textAuthOptOut: false,
          legalLanguage: "",
          paymentType: "",
          medicaidResidents: 0,
          paymentMethodAdded: false
        },
        formPage2: {
          africanOrAfricanAmerican: false,
          arabAmericanMiddleEasternOrNorthAfrican: false,
          asianOrAsianAmerican: false,
          hispanicOrLatinx: false,
          nativeAmericanOrIndigenous: false,
          nativeHawaiianOrOtherPacificIslander: false,
          white: false,
          other: false,
          declined: true,
          mailToCity: "string",
          mailToState: "or",
          mailToStreet: "string",
          mailToZip: "12345",
          lgbtqId: false,
          transId: false,
          disabilityId: false,
          deafOrHardOfHearing: false,
          blindOrVisuallyImpaired: false,
          gender: "female",
          genderOtherDescription: "",
          genderPronoun: "other",
          jobTitle: "",
          worksite: "string",
          workEmail: "string@string.com",
          workPhone: "123-456-7890",
          hireDate: "2019-11-11"
        },
        salesforceId: "123",
        submissionId: null
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
    test("saveSalesForceId", () => {
      const action = {
        type: "SAVE_SALESFORCEID",
        payload: {
          salesforceId: "1"
        }
      };
      const expectedState = {
        ...INITIAL_STATE,
        salesforceId: "1"
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
  });
});
