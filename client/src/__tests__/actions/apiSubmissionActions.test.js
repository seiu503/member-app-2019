/**
 * @jest-environment node
 */

import nock from "nock";
import { apiMiddleware } from "redux-api-middleware";
import configureMockStore from "redux-mock-store";
import * as actions from "../../store/actions/apiSubmissionActions";
import * as submissiomReducer from "../../store/reducers/submission";
import {
  generateSampleSubmission,
  generateCAPEValidateFrontEnd
} from "../../../../app/utils/fieldConfigs.js";
const BASE_URL = process.env.REACT_APP_BASE_URL;
const createStore = configureMockStore([apiMiddleware]);
const store = createStore(submissiomReducer.initialState);
const submissionBody = generateSampleSubmission();
const capeBody = generateCAPEValidateFrontEnd();
const token = "1234";

describe("apiSubmissionActions", () => {
  describe("api actions", () => {
    afterEach(() => {
      nock.cleanAll();
      nock.enableNetConnect();
      // expect at least one expect in async code:
      expect.hasAssertions();
    });

    it("HANDLE_INPUT: handles form input", () => {
      const e = { target: { name: "name", value: "value" } };
      const expectedAction = {
        type: "HANDLE_INPUT",
        payload: { name: "name", value: "value" }
      };
      expect(actions.handleInput(e)).toEqual(expectedAction);
    });

    it("SET_CAPE_OPTIONS: sets CAPE options", () => {
      const e = { monthlyOptions: [1, 2, 3], oneTimeOptions: [4, 5, 6] };
      const expectedAction = {
        type: "SET_CAPE_OPTIONS",
        payload: { monthlyOptions: [1, 2, 3], oneTimeOptions: [4, 5, 6] }
      };
      expect(actions.setCAPEOptions(e)).toEqual(expectedAction);
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

    it("UPDATE_SUBMISSION: Dispatches success action after successful PUT", async () => {
      nock(`${BASE_URL}`)
        .put("/api/submission/12345678", submissionBody)
        .reply(200, submissionBody);

      const expectedResult = {
        payload: undefined,
        type: "UPDATE_SUBMISSION_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(
        actions.updateSubmission(submissionBody)
      );
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_SUBMISSION: Dispatches failure action after failed PUT", async () => {
      const body = JSON.stringify({
        message: "There was an error saving the submission"
      });
      const init = {
        status: 404,
        statusText: "There was an error saving the submission"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(
        actions.updateSubmission(submissionBody)
      );
      const expectedResult = {
        payload: { message: "There was an error saving the submission" },
        type: "UPDATE_SUBMISSION_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("GET_ALL_SUBMISSIONS: Dispatches success action after successful GET", async () => {
      nock(`${BASE_URL}`)
        .get("/api/submission")
        .reply(200, [submissionBody]);

      const expectedResult = {
        payload: undefined,
        type: "GET_ALL_SUBMISSIONS_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.getAllSubmissions(token));
      expect(result).toEqual(expectedResult);
    });

    it("GET_ALL_SUBMISSIONS: Dispatches failure action after failed GET", async () => {
      const body = JSON.stringify({
        message: "There was an error fetching the submissions"
      });
      const init = {
        status: 404,
        statusText: "There was an error fetching the submissions"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.getAllSubmissions(token));
      const expectedResult = {
        payload: { message: "There was an error fetching the submissions" },
        type: "GET_ALL_SUBMISSIONS_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("VERIFY: Dispatches success action after successful POST", async () => {
      nock(`${BASE_URL}`)
        .post("/api/verify")
        .reply(200, { success: true, score: 0.9 });

      const expectedResult = {
        payload: undefined,
        type: "VERIFY_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.verify(token, "10.0.0.1"));
      expect(result).toEqual(expectedResult);
    });

    it("VERIFY: Dispatches failure action after failed POST", async () => {
      const body = JSON.stringify({
        message: "Recaptcha validation failed"
      });
      const init = {
        status: 404,
        statusText: "Recaptcha validation failed"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.verify(token));
      const expectedResult = {
        payload: { message: "Recaptcha validation failed" },
        type: "VERIFY_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("saves a salesForceId", async () => {
      let id = "123456";
      const result = await store.dispatch(actions.saveSalesforceId(id));
      const expectedResult = {
        payload: { salesforceId: "123456" },
        type: "SAVE_SALESFORCEID",
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_CAPE: Dispatches success action after successful POST", async () => {
      nock(`${BASE_URL}`)
        .post("/api/cape/", capeBody)
        .reply(200, capeBody);

      const expectedResult = {
        payload: undefined,
        type: "CREATE_CAPE_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.createCAPE(capeBody));
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_CAPE: Dispatches failure action after failed POST", async () => {
      const body = JSON.stringify({
        message: "There was an error saving the CAPE record"
      });
      const init = {
        status: 404,
        statusText: "There was an error saving the CAPE record"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.createCAPE(capeBody));
      const expectedResult = {
        payload: { message: "There was an error saving the CAPE record" },
        type: "CREATE_CAPE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_CAPE: Dispatches success action after successful PUT", async () => {
      nock(`${BASE_URL}`)
        .put("/api/cape/12345678", capeBody)
        .reply(200, capeBody);

      const expectedResult = {
        payload: undefined,
        type: "UPDATE_CAPE_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.updateCAPE(capeBody));
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_CAPE: Dispatches failure action after failed PUT", async () => {
      const body = JSON.stringify({
        message: "There was an error saving the CAPE record"
      });
      const init = {
        status: 404,
        statusText: "There was an error saving the CAPE record"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.updateCAPE(capeBody));
      const expectedResult = {
        payload: { message: "There was an error saving the CAPE record" },
        type: "UPDATE_CAPE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("GET_CAPE_BY_SFID: Dispatches success action after successful GET", async () => {
      nock(`${BASE_URL}`)
        .get("/api/capeBySF")
        .reply(200, [capeBody]);

      const expectedResult = {
        payload: undefined,
        type: "GET_CAPE_BY_SFID_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.getCAPEBySFId());
      expect(result).toEqual(expectedResult);
    });

    it("GET_CAPE_BY_SFID: Dispatches failure action after failed GET", async () => {
      const body = JSON.stringify({
        message: "There was an error fetching the CAPE record"
      });
      const init = {
        status: 404,
        statusText: "There was an error fetching the CAPE record"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.getCAPEBySFId());
      const expectedResult = {
        payload: { message: "There was an error fetching the CAPE record" },
        type: "GET_CAPE_BY_SFID_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
