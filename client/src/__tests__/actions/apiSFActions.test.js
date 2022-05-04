/* istanbul ignore file */

import nock from "nock";
import { apiMiddleware } from "redux-api-middleware";
import configureMockStore from "redux-mock-store";
import * as actions from "../../store/actions/apiSFActions";
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
const id = "0036100001bqfvxAAA";
const cId = "0036100001bqfvxAAA";
const aId = "0036100001bqfvxAAA";

describe("apiSFActions", () => {
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

    it("GET_SF_CONTACT: Dispatches failure action after failed GET (generic error msg)", async () => {
      const body = JSON.stringify({});
      const init = {
        status: 404,
        statusText: null
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.getSFContactById(id));
      const expectedResult = {
        payload: {
          message: "Sorry, something went wrong :("
        },
        type: "GET_SF_CONTACT_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("GET_SF_CONTACT_DID: Dispatches success action after successful GET", async () => {
      nock(`${BASE_URL}`)
        .get(`/api/sfdid/${cId}/${aId}`)
        .reply(200);

      const expectedResult = {
        payload: undefined,
        type: "GET_SF_CONTACT_DID_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(
        actions.getSFContactByDoubleId(cId, aId)
      );
      expect(result).toEqual(expectedResult);
    });

    it("GET_SF_CONTACT_DID: Dispatches failure action after failed GET", async () => {
      const body = JSON.stringify({
        message: "There was an error fetching the contact"
      });
      const init = {
        status: 404,
        statusText: "There was an error fetching the contact"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(
        actions.getSFContactByDoubleId(cId, aId)
      );
      const expectedResult = {
        payload: { message: "There was an error fetching the contact" },
        type: "GET_SF_CONTACT_DID_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("GET_SF_CONTACT_DID: Dispatches failure action after failed GET (generic error msg)", async () => {
      const body = JSON.stringify({});
      const init = {
        status: 404,
        statusText: "There was an error fetching the contact"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(
        actions.getSFContactByDoubleId(cId, aId)
      );
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "GET_SF_CONTACT_DID_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_SF_CONTACT: Dispatches success action after successful POST", async () => {
      nock(`${BASE_URL}`)
        .post(`/api/sf/`)
        .reply(200);

      const expectedResult = {
        payload: undefined,
        type: "CREATE_SF_CONTACT_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(
        actions.createSFContact(submissionBody)
      );
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_SF_CONTACT: Dispatches failure action after failed POST", async () => {
      const body = JSON.stringify({
        message: "There was an error creating the contact"
      });
      const init = {
        status: 500,
        statusText: "There was an error creating the contact"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(
        actions.createSFContact(submissionBody)
      );
      const expectedResult = {
        payload: { message: "There was an error creating the contact" },
        type: "CREATE_SF_CONTACT_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_SF_CONTACT: Dispatches failure action after failed POST (generic error msg)", async () => {
      const body = JSON.stringify({});
      const init = {
        status: 500,
        statusText: "There was an error creating the contact"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(
        actions.createSFContact(submissionBody)
      );
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "CREATE_SF_CONTACT_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_SF_CONTACT: Dispatches success action after successful PUT", async () => {
      nock(`${BASE_URL}`)
        .put(`/api/sf/${id}`)
        .reply(200);

      const expectedResult = {
        payload: undefined,
        type: "UPDATE_SF_CONTACT_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(
        actions.updateSFContact(id, submissionBody)
      );
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_SF_CONTACT: Dispatches failure action after failed PUT", async () => {
      const body = JSON.stringify({
        message: "There was an error updating the contact"
      });
      const init = {
        status: 500,
        statusText: "There was an error updating the contact"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(
        actions.updateSFContact(id, submissionBody)
      );
      const expectedResult = {
        payload: { message: "There was an error updating the contact" },
        type: "UPDATE_SF_CONTACT_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_SF_CONTACT: Dispatches failure action after failed PUT (generic error msg)", async () => {
      const body = JSON.stringify({});
      const init = {
        status: 500,
        statusText: "There was an error updating the contact"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(
        actions.updateSFContact(submissionBody)
      );
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "UPDATE_SF_CONTACT_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_SF_OMA: Dispatches success action after successful POST", async () => {
      nock(`${BASE_URL}`)
        .post(`/api/sfOMA/`)
        .reply(200);

      const expectedResult = {
        payload: undefined,
        type: "CREATE_SF_OMA_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.createSFOMA(submissionBody));
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_SF_OMA: Dispatches failure action after failed POST", async () => {
      const body = JSON.stringify({
        message: "There was an error creating the contact"
      });
      const init = {
        status: 500,
        statusText: "There was an error creating the contact"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.createSFOMA(submissionBody));
      const expectedResult = {
        payload: { message: "There was an error creating the contact" },
        type: "CREATE_SF_OMA_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_SF_OMA: Dispatches failure action after failed POST (generic error msg)", async () => {
      const body = JSON.stringify({});
      const init = {
        status: 500,
        statusText: "There was an error creating the contact"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.createSFOMA(submissionBody));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "CREATE_SF_OMA_FAILURE",
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
        payload: "",
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

    it("GET_SF_EMPLOYERS: Dispatches failure action after failed GET (generic error msg)", async () => {
      const body = JSON.stringify({});
      const init = {
        status: 500,
        statusText: "There was an error creating the contact"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.getSFEmployers());
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
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

    it("LOOKUP_SF_CONTACT: Dispatches failure action after failed PUT (generic error msg)", async () => {
      const body = JSON.stringify({});
      const init = {
        status: 404,
        statusText: "There was an error saving the submission"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(
        actions.lookupSFContact(submissionBody)
      );
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "LOOKUP_SF_CONTACT_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_SF_CAPE: Dispatches success action after successful POST", async () => {
      nock(`${BASE_URL}`)
        .post(`/api/sfCAPE/`)
        .reply(200);

      const expectedResult = {
        payload: undefined,
        type: "CREATE_SF_CAPE_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.createSFCAPE(capeBody));
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_SF_CAPE: Dispatches failure action after failed POST", async () => {
      const body = JSON.stringify({
        message: "There was an error creating the CAPE record"
      });
      const init = {
        status: 500,
        statusText: "There was an error creating the CAPE record"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.createSFCAPE(capeBody));
      const expectedResult = {
        payload: { message: "There was an error creating the CAPE record" },
        type: "CREATE_SF_CAPE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_SF_CAPE: Dispatches failure action after failed POST (generic error msg)", async () => {
      const body = JSON.stringify({});
      const init = {
        status: 404,
        statusText: "There was an error creating the CAPE record"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.createSFCAPE(capeBody));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "CREATE_SF_CAPE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_SF_CAPE: Dispatches success action after successful PUT", async () => {
      nock(`${BASE_URL}`)
        .put(`/api/sfCAPE/`)
        .reply(200);

      const expectedResult = {
        payload: undefined,
        type: "UPDATE_SF_CAPE_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.updateSFCAPE(id, capeBody));
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_SF_CAPE: Dispatches failure action after failed PUT", async () => {
      const body = JSON.stringify({
        message: "There was an error updating the CAPE record"
      });
      const init = {
        status: 500,
        statusText: "There was an error updating the CAPE record"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.updateSFCAPE(id, capeBody));
      const expectedResult = {
        payload: { message: "There was an error updating the CAPE record" },
        type: "UPDATE_SF_CAPE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_SF_CAPE: Dispatches failure action after failed PUT (generic error msg)", async () => {
      const body = JSON.stringify({});
      const init = {
        status: 404,
        statusText: "There was an error updating the CAPE record"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.updateSFCAPE(id, capeBody));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "UPDATE_SF_CAPE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
