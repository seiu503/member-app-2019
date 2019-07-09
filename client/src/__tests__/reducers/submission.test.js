import reducer, { INITIAL_STATE } from "../../store/reducers/submission";
import {
  generateSampleSubmissionFrontEnd,
  generateSampleValidate,
  generateSampleSubmission
} from "../../../../app/utils/fieldConfigs.js";

const samplePayload = generateSampleSubmissionFrontEnd();
const sampleSubmission = generateSampleValidate();
console.log(samplePayload);
console.log(sampleSubmission);

const emptySubmissionPage1 = {
  firstName: "",
  lastName: "",
  dd: "",
  mm: "",
  yyyy: "",
  preferredLanguage: "english",
  homeStreet: "",
  homeCity: "",
  homePostalCode: "",
  homeState: "",
  homeEmail: "",
  mobilePhone: "",
  employerName: "",
  textAuthOptOut: false,
  termsAgree: false,
  signature: "",
  signedApplication: false
};

describe("submission reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual(INITIAL_STATE);
  });

  it("should handle CLEAR_FORM", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "CLEAR_FORM"
      })
    ).toEqual({
      ...INITIAL_STATE,
      formPage1: {
        ...emptySubmissionPage1
      }
    });
  });
  it("should handle all api REQUEST actions", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "ADD_SUBMISSION_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      loading: true,
      error: null
    });
  });
  it("should handle all api SUCCESS actions", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "ADD_SUBMISSION_SUCCESS",
        payload: samplePayload // expected mobilePhone
      })
    ).toEqual({
      ...INITIAL_STATE,
      loading: false,
      error: null,
      formPage1: {
        ...sampleSubmission // got cellPhone
      }
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
      loading: false,
      error: "Some error"
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "ADD_SUBMISSION_FAILURE",
        payload: { message: null }
      })
    ).toEqual({
      ...INITIAL_STATE,
      loading: false,
      error: "Sorry, something went wrong :(\nPlease try again."
    });
  });
});
