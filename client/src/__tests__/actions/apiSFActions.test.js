/**
 * @jest-environment node
 */

import nock from "nock";
import { apiMiddleware } from "redux-api-middleware";
import configureMockStore from "redux-mock-store";
import * as actions from "../../store/actions/apiSFActions";
import * as submissiomReducer from "../../store/reducers/submission";
import BASE_URL from "../../store/actions/apiConfig.js";
import { generateSampleSubmission } from "../../../../app/utils/fieldConfigs.js";

const createStore = configureMockStore([apiMiddleware]);
const store = createStore(submissiomReducer.initialState);
const submissionBody = generateSampleSubmission();
const id = "0036100001bqfvxAAA";

describe.only("apiSFActions", () => {
  describe("api actions", () => {
    afterEach(() => {
      nock.cleanAll();
      nock.enableNetConnect();
      // expect at least one expect in async code:
      expect.hasAssertions();
    });

    it("GET_SF_CONTACT: Dispatches success action after successful GET", async () => {
      nock(`${BASE_URL}`)
        .get(`/api/sf/${id}`)
        .reply(200);

      const expectedResult = {
        payload: undefined,
        type: "GET_SF_CONTACT_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.getSFContactById(id));
      expect(result).toEqual(expectedResult);
    });

    it("GET_SF_CONTACT: Dispatches failure action after failed GET", async () => {
      const body = JSON.stringify({
        message: "There was an error fetching the contact"
      });
      const init = {
        status: 404,
        statusText: "There was an error fetching the contact"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.getSFContactById(id));
      const expectedResult = {
        payload: { message: "There was an error fetching the contact" },
        type: "GET_SF_CONTACT_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("GET_SF_EMPLOYERS: Dispatches success action after successful GET", async () => {
      nock(`${BASE_URL}`)
        .get(`/api/sfaccts`)
        .reply(200);

      const expectedResult = {
        payload: undefined,
        type: "GET_SF_EMPLOYERS_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.getSFEmployers());
      expect(result).toEqual(expectedResult);
    });

    it("GET_SF_EMPLOYERS: Dispatches failure action after failed GET", async () => {
      const body = JSON.stringify({
        message: "There was an error fetching the employers"
      });
      const init = {
        status: 404,
        statusText: "There was an error fetching the employers"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.getSFEmployers());
      const expectedResult = {
        payload: { message: "There was an error fetching the employers" },
        type: "GET_SF_EMPLOYERS_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("LOOKUP_SF_CONTACT: Dispatches success action after successful PUT", async () => {
      nock(`${BASE_URL}`)
        .put("/api/sfcontact", submissionBody)
        .reply(200);

      const expectedResult = {
        payload: undefined,
        type: "LOOKUP_SF_CONTACT_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(
        actions.lookupSFContact(submissionBody)
      );
      expect(result).toEqual(expectedResult);
    });

    it("LOOKUP_SF_CONTACT: Dispatches failure action after failed PUT", async () => {
      const body = JSON.stringify({
        message: "There was an error saving the submission"
      });
      const init = {
        status: 404,
        statusText: "There was an error saving the submission"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(
        actions.lookupSFContact(submissionBody)
      );
      const expectedResult = {
        payload: { message: "There was an error saving the submission" },
        type: "LOOKUP_SF_CONTACT_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
