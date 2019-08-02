import reducer, { INITIAL_STATE } from "../../store/reducers/submission";
import {
  contactsTableFields,
  generateSampleSubmissionFrontEnd,
  generateSampleValidate,
  generateSampleSubmission
} from "../../../../app/utils/fieldConfigs.js";

// this is a hack to allow the SubmissionFormPageComponent to import
// this object even though it is stored outside the /src directory
export const contactsTableFieldsExport = { ...contactsTableFields };

const samplePayload = generateSampleSubmissionFrontEnd();
const sampleSubmission = generateSampleValidate();
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
});
