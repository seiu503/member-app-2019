/**
 * @jest-environment node
 */

import nock from "nock";
import { apiMiddleware } from "redux-api-middleware";
import configureMockStore from "redux-mock-store";
import * as actions from "../../store/actions/apiSubmissionActions";
import * as submissiomReducer from "../../store/reducers/submission";
import BASE_URL from "../../store/actions/apiConfig.js";
import { generateSampleSubmission } from "../../../../app/utils/fieldConfigs.js";

const createStore = configureMockStore([apiMiddleware]);
const store = createStore(submissiomReducer.initialState);
const submissionBody = generateSampleSubmission();

describe("apiSubmissionActions", () => {
  it("should create an action to clear the form", () => {
    const expectedAction = {
      type: "CLEAR_FORM"
    };
    expect(actions.clearForm()).toEqual(expectedAction);
  });

  describe("api actions", () => {
    afterEach(() => {
      nock.cleanAll();
      nock.enableNetConnect();
      // expect at least one expect in async code:
      expect.hasAssertions();
    });

    it("ADD_SUBMISSION: Dispatches success action after successful POST", async () => {
      nock(`${BASE_URL}`)
        .post("/api/submission/", submissionBody)
        .reply(200, submissionBody);

      const expectedResult = {
        payload: undefined,
        type: "ADD_SUBMISSION_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(
        actions.addSubmission(submissionBody)
      );
      expect(result).toEqual(expectedResult);
    });

    it("ADD_SUBMISSION: Dispatches failure action after failed POST", async () => {
      const body = JSON.stringify({
        message: "There was an error saving the submission"
      });
      const init = {
        status: 404,
        statusText: "There was an error saving the submission"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(
        actions.addSubmission(submissionBody)
      );
      const expectedResult = {
        payload: { message: "There was an error saving the submission" },
        type: "ADD_SUBMISSION_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
