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
  it("should handle `handleInput`", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "HANDLE_INPUT",
        payload: { name: "firstName", value: "New Name" }
      })
    ).toEqual({
      ...INITIAL_STATE,
      formPage1: {
        ...INITIAL_STATE.formPage1,
        firstName: "New Name"
      }
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
    test("getAllSubmissions", () => {
      const action = {
        type: "GET_ALL_SUBMISSIONS_SUCCESS",
        payload: [
          {
            id: "1",
            first_name: "first",
            last_name: "last",
            email: "test@test.com"
          }
        ]
      };
      const expectedState = {
        ...INITIAL_STATE,
        allSubmissions: [
          {
            id: "1",
            first_name: "first",
            last_name: "last",
            email: "test@test.com"
          }
        ],
        error: null
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
          employerId: "",
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
          newCardNeeded: false,
          termsAgree: false,
          signature: null,
          textAuthOptOut: false,
          legalLanguage: "",
          paymentType: "Card",
          whichCard: "Use existing",
          medicaidResidents: 0,
          paymentMethodAdded: false,
          afhDuesRate: 0,
          capeAmount: ""
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
    test("getSFEmployers", () => {
      const payload = [
        {
          Name: "test",
          Agency_Number__c: 123,
          Sub_Division__c: "Nursing Homes",
          Id: "12345"
        },
        {
          Name: "test2",
          Agency_Number__c: 123,
          Sub_Division__c: "Nursing Homes",
          Id: "12345"
        }
      ];
      const action = {
        type: "GET_SF_EMPLOYERS_SUCCESS",
        payload: payload
      };
      const expectedState = {
        ...INITIAL_STATE,
        employerObjects: [
          {
            Name: "test",
            Agency_Number__c: 123,
            Sub_Division__c: "Nursing Homes",
            Id: "12345"
          },
          {
            Name: "test2",
            Agency_Number__c: 123,
            Sub_Division__c: "Nursing Homes",
            Id: "12345"
          }
        ],
        employerNames: ["test", "test2"]
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
    test("getSFDJR", () => {
      const payload = {
        Active_Account_Last_4__c: "1234",
        Payment_Error_Hold__c: false,
        Unioni_se_MemberID__c: "5678",
        Employer__c: "emloyerId",
        Id: "theDjrId"
      };
      const action = {
        type: "GET_SF_DJR_SUCCESS",
        payload: payload
      };
      const expectedState = {
        ...INITIAL_STATE,
        payment: {
          activeMethodLast4: "1234",
          paymentErrorHold: false,
          memberShortId: "5678",
          djrEmployerId: "emloyerId",
          cardAddingUrl: "",
          unioniseRefreshToken: "",
          unioniseToken: ""
        },
        djrId: "theDjrId"
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
    test("getUnioniseToken", () => {
      const payload = {
        access_token: "1234",
        refresh_token: "5678"
      };
      const action = {
        type: "GET_UNIONISE_TOKEN_SUCCESS",
        payload: payload
      };
      const expectedState = {
        ...INITIAL_STATE,
        payment: {
          unioniseToken: "1234",
          unioniseRefreshToken: "5678",
          activeMethodLast4: "",
          cardAddingUrl: "",
          djrEmployerId: "",
          memberShortId: "",
          paymentErrorHold: false
        }
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
    test("getIframeURL", () => {
      const action = {
        type: "GET_IFRAME_URL_SUCCESS",
        payload: {
          cardAddingUrl: "url",
          memberId: "string",
          stripeCustomerId: "string",
          memberShortId: "string"
        }
      };
      const expectedState = {
        ...INITIAL_STATE,
        payment: {
          activeMethodLast4: "",
          djrEmployerId: "",
          paymentErrorHold: false,
          unioniseToken: "",
          unioniseRefreshToken: "",
          cardAddingUrl: "url",
          memberShortId: "string"
        }
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
    test("getIframeExisting", () => {
      const action = {
        type: "GET_IFRAME_EXISTING_SUCCESS",
        payload: {
          cardAddingUrl: "newUrl"
        }
      };
      const expectedState = {
        ...INITIAL_STATE,
        payment: {
          ...INITIAL_STATE.payment,
          cardAddingUrl: "newUrl"
        }
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
    test("createSFOMA", () => {
      const action = {
        type: "CREATE_SF_OMA_SUCCESS",
        payload: {
          salesforce_id: "string",
          submission_id: "string",
          sf_OMA_id: "string"
        }
      };
      const expectedState = {
        ...INITIAL_STATE,
        error: null
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
    test("createSFDJR", () => {
      const action = {
        type: "CREATE_SF_DJR_SUCCESS",
        payload: {
          sf_djr_id: "string",
          error: null
        }
      };
      const expectedState = {
        ...INITIAL_STATE,
        djrId: "string",
        error: null
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
    test("lookupSFContact", () => {
      const action = {
        type: "LOOKUP_SF_CONTACT_SUCCESS",
        payload: {
          salesforce_id: "string"
        }
      };
      const expectedState = {
        ...INITIAL_STATE,
        salesforceId: "string",
        error: null,
        redirect: true
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
  });
});
