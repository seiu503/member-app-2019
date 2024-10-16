import { setupServer } from "msw/node";
import handlers from "../../mocks/handlers";
import { http, HttpResponse } from "msw";
import { apiMiddleware } from "redux-api-middleware";
import configureMockStore from "redux-mock-store";
import * as actions from "../../store/actions/apiSFActions";
import * as submissiomReducer from "../../store/reducers/submission";
import {
  generateSampleSubmission,
  generateCAPEValidateFrontEnd
} from "../../../../app/utils/fieldConfigs.js";
import { employersPayload } from "../../utils/testUtils";
const BASE_URL = process.env.REACT_APP_BASE_URL;
const createStore = configureMockStore([apiMiddleware]);
const store = createStore(submissiomReducer.initialState);
const submissionBody = generateSampleSubmission();
const capeBody = generateCAPEValidateFrontEnd();
const id = "12345678";
const cId = "1";
const aId = "2";

const server = setupServer(...handlers);

describe("apiSFActions", () => {
  describe("api actions", () => {
    // Enable API mocking before tests.
    beforeAll(() => server.listen());
    // Disable API mocking after the tests are done.
    afterAll(() => server.close());
    afterEach(() => {
      // Reset any runtime request handlers we may add during the tests.
      server.resetHandlers();
      // expect at least one expect in async code:
      expect.hasAssertions();
    });

    it("GET_SF_CONTACT: Dispatches success action after successful GET", async () => {
      const expectedResult = {
        payload: { id: "testid" },
        type: "GET_SF_CONTACT_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.getSFContactById("12345678"));
      expect(result).toEqual(expectedResult);
    });

    it("GET_SF_CONTACT: Dispatches failure action after failed GET", async () => {
      server.use(
        http.get("http://localhost/undefined/api/sf/12345678", () => {
          return new HttpResponse(JSON.stringify({"message": "There was an error fetching the contact" }), {
            status: 404
          })
        })
      );

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
      server.use(
        http.get("http://localhost/undefined/api/sf/12345678", () => {
          return new HttpResponse(JSON.stringify({"message": "Sorry, something went wrong :(" }), {
            status: 500
          })
        })
      );

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
      const expectedResult = {
        payload: {
          id: "testid",
          FirstName: "test",
          LastName: "test",
          Account: { id: "test" },
          Ethnicity__c: "Declined"
        },
        type: "GET_SF_CONTACT_DID_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(
        actions.getSFContactByDoubleId(cId, aId)
      );
      expect(result).toEqual(expectedResult);
    });

    it("GET_SF_CONTACT_DID: Dispatches failure action after failed GET", async () => {
      server.use(
        http.get("http://localhost/undefined/api/sfdid/1/2", () => {
          return new HttpResponse(JSON.stringify({"message": "There was an error fetching the contact" }), {
            status: 404
          });
        })
      );

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
      server.use(
        http.get("http://localhost/undefined/api/sfdid/1/2", () => {
          return new HttpResponse(JSON.stringify({"message": "Sorry, something went wrong :(" }), {
            status: 500
          })
        })
      );

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
      const expectedResult = {
        payload: { id: "testid" },
        type: "CREATE_SF_CONTACT_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(
        actions.createSFContact(submissionBody)
      );
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_SF_CONTACT: Dispatches failure action after failed POST", async () => {
      server.use(
        http.post("http://localhost/undefined/api/sf", () => {
          return new HttpResponse(JSON.stringify({"message": "There was an error creating the contact" }), {
            status: 404
          });
        })
      );

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
      server.use(
        http.post("http://localhost/undefined/api/sf", () => {
          return new HttpResponse(JSON.stringify({"message": "Sorry, something went wrong :(" }), {
            status: 500
          });
        })
      );

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
      const expectedResult = {
        payload: { id: "testid" },
        type: "UPDATE_SF_CONTACT_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(
        actions.updateSFContact(id, submissionBody)
      );
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_SF_CONTACT: Dispatches failure action after failed PUT", async () => {
      server.use(
        http.put("http://localhost/undefined/api/sf/12345678", () => {
          return new HttpResponse(JSON.stringify({"message": "There was an error updating the contact" }), {
            status: 404
          });
        })
      );

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
      server.use(
        http.put("http://localhost/undefined/api/sf/12345678", () => {
          return new HttpResponse(JSON.stringify({"message": "Sorry, something went wrong :(" }), {
            status: 500
          });
        })
      );

      const result = await store.dispatch(
        actions.updateSFContact(id, submissionBody)
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
      const expectedResult = {
        payload: { id: "testid" },
        type: "CREATE_SF_OMA_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.createSFOMA(submissionBody));
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_SF_OMA: Dispatches failure action after failed POST", async () => {
      server.use(
        http.post("http://localhost/undefined/api/sfOMA", (req, res, ctx) => {
          return new HttpResponse(JSON.stringify({"message": "There was an error creating the record" }), {
            status: 404
          });
        })
      );

      const result = await store.dispatch(actions.createSFOMA(submissionBody));
      const expectedResult = {
        payload: { message: "There was an error creating the record" },
        type: "CREATE_SF_OMA_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_SF_OMA: Dispatches failure action after failed POST (generic error msg)", async () => {
      server.use(
        http.post("http://localhost/undefined/api/sfOMA", () => {
          return new HttpResponse(JSON.stringify({"message": "Sorry, something went wrong :(" }), {
            status: 500
          });
        })
      );

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
      const expectedResult = {
        payload: [...employersPayload],
        type: "GET_SF_EMPLOYERS_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.getSFEmployers());
      expect(result).toEqual(expectedResult);
    });

    it("GET_SF_EMPLOYERS: Dispatches failure action after failed GET", async () => {
      server.use(
        http.get("http://localhost/undefined/api/sfaccts", (req, res, ctx) => {
          return new HttpResponse(JSON.stringify({"message": "There was an error fetching the employers" }), {
            status: 404
          });
        })
      );

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
      server.use(
        http.get("http://localhost/undefined/api/sfaccts", () => {
          return new HttpResponse(JSON.stringify({"message": "Sorry, something went wrong :(" }), {
            status: 500
          });
        })
      );

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
      const expectedResult = {
        payload: { id: "testid" },
        type: "LOOKUP_SF_CONTACT_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(
        actions.lookupSFContact(submissionBody)
      );
      expect(result).toEqual(expectedResult);
    });

    it("LOOKUP_SF_CONTACT: Dispatches failure action after failed PUT", async () => {
      server.use(
        http.put("http://localhost/undefined/api/sflookup", (req, res, ctx) => {
          return new HttpResponse(JSON.stringify({"message": "There was an error fetching the contact" }), {
            status: 404
          });
        })
      );

      const result = await store.dispatch(
        actions.lookupSFContact(submissionBody)
      );
      const expectedResult = {
        payload: { message: "There was an error fetching the contact" },
        type: "LOOKUP_SF_CONTACT_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("LOOKUP_SF_CONTACT: Dispatches failure action after failed PUT (generic error msg)", async () => {
      server.use(
        http.put("http://localhost/undefined/api/sflookup", () => {
          return new HttpResponse(JSON.stringify({"message": "Sorry, something went wrong :(" }), {
            status: 500
          });
        })
      );

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
      const expectedResult = {
        payload: { salesforce_id: "123" },
        type: "CREATE_SF_CAPE_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.createSFCAPE(capeBody));
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_SF_CAPE: Dispatches failure action after failed POST", async () => {
      server.use(
        http.post("http://localhost/undefined/api/sfCAPE", () => {
          return new HttpResponse(JSON.stringify({"message": "There was an error creating the CAPE record" }), {
            status: 404
          });
        })
      );

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
      server.use(
        http.post("http://localhost/undefined/api/sfCAPE", () => {
          return new HttpResponse(JSON.stringify({"message": "Sorry, something went wrong :(" }), {
            status: 500
          });
        })
      );

      const result = await store.dispatch(actions.createSFCAPE(capeBody));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "CREATE_SF_CAPE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
