import { setupServer } from "msw/node";
import handlers from "../../mocks/handlers";
import { rest } from "msw";
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
const server = setupServer(...handlers);

describe("apiSubmissionActions", () => {
  it("HANDLE_INPUT: handles form input", () => {
    const e = { target: { name: "name", value: "value" } };
    const expectedAction = {
      type: "HANDLE_INPUT",
      payload: { name: "name", value: "value" }
    };
    expect(actions.handleInput(e)).toEqual(expectedAction);
  });

  it("CLEAR_FORM: clears form and returns initial state", () => {
    const expectedAction = {
      type: "CLEAR_FORM"
    };
    expect(actions.clearForm()).toEqual(expectedAction);
  });

  it("SET_CAPE_OPTIONS: sets CAPE options", () => {
    const e = { monthlyOptions: [1, 2, 3], oneTimeOptions: [4, 5, 6] };
    const expectedAction = {
      type: "SET_CAPE_OPTIONS",
      payload: { monthlyOptions: [1, 2, 3], oneTimeOptions: [4, 5, 6] }
    };
    expect(actions.setCAPEOptions(e)).toEqual(expectedAction);
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

  it("saves a submissionId", async () => {
    let id = "123456";
    const result = await store.dispatch(actions.saveSubmissionId(id));
    const expectedResult = {
      payload: { submissionId: "123456" },
      type: "SAVE_SUBMISSIONID",
      meta: undefined
    };
    expect(result).toEqual(expectedResult);
  });

    describe("api actions FAILURE", () => {
    // Enable API mocking before tests.
    beforeAll(() => server.listen());

    afterEach(() => {
      // Reset any runtime request handlers we may add during the tests.
      server.resetHandlers();
      // expect at least one expect in async code:
      expect.hasAssertions();
    });

    // Disable API mocking after the tests are done.
    afterAll(() => server.close());

    it("ADD_SUBMISSION: Dispatches failure action after failed POST", async () => {
      server.use(
        rest.post("http://localhost/undefined/api/submission", (req, res, ctx) => {
          return res(
            ctx.json({ message: "There was an error saving the submission" }),
            ctx.status(404)
          );
        })
      );

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

    it("ADD_SUBMISSION: Dispatches failure action after failed POST (generic error msg)", async () => {
      server.use(
        rest.post("http://localhost/undefined/api/submission", (req, res, ctx) => {
          return res(
            ctx.json({ message: "Sorry, something went wrong :(" }),
            ctx.status(500)
          );
        })
      );

      const result = await store.dispatch(
        actions.addSubmission(submissionBody)
      );
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "ADD_SUBMISSION_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_SUBMISSION: Dispatches failure action after failed PUT", async () => {
      server.use(
        rest.put(
          "http://localhost/undefined/api/submission/12345678",
          (req, res, ctx) => {
            return res(
              ctx.json({ message: "There was an error saving the submission" }),
              ctx.status(404)
            );
          }
        )
      );

      const result = await store.dispatch(actions.updateSubmission("12345678"));
      const expectedResult = {
        payload: { message: "There was an error saving the submission" },
        type: "UPDATE_SUBMISSION_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_SUBMISSION: Dispatches failure action after failed PUT (generic error msg)", async () => {
      server.use(
        rest.put(
          "http://localhost/undefined/api/submission/12345678",
          (req, res, ctx) => {
            return res(
              ctx.json({ message: "Sorry, something went wrong :(" }),
              ctx.status(500)
            );
          }
        )
      );

      const result = await store.dispatch(actions.updateSubmission("12345678"));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "UPDATE_SUBMISSION_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("VERIFY: Dispatches failure action after failed POST", async () => {
      server.use(
        rest.post("http://localhost/undefined/api/verify", (req, res, ctx) => {
          return res(
            ctx.json({ message: "Recaptcha validation failed" }),
            ctx.status(404)
          );
        })
      );

      const result = await store.dispatch(actions.verify(token));
      const expectedResult = {
        payload: { message: "Recaptcha validation failed" },
        type: "VERIFY_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("VERIFY: Dispatches failure action after failed POST (generic error msg)", async () => {
      server.use(
        rest.post("http://localhost/undefined/api/verify", (req, res, ctx) => {
          return res(
            ctx.json({ message: "Sorry, something went wrong :(" }),
            ctx.status(500)
          );
        })
      );

      const result = await store.dispatch(actions.verify(token));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "VERIFY_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_CAPE: Dispatches failure action after failed POST", async () => {
      server.use(
        rest.post("http://localhost/undefined/api/cape", (req, res, ctx) => {
          return res(
            ctx.json({ message: "There was an error saving the CAPE record" }),
            ctx.status(404)
          );
        })
      );

      const result = await store.dispatch(actions.createCAPE(capeBody));
      const expectedResult = {
        payload: { message: "There was an error saving the CAPE record" },
        type: "CREATE_CAPE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("CREATE_CAPE: Dispatches failure action after failed POST (generic error msg)", async () => {
      server.use(
        rest.post("http://localhost/undefined/api/cape", (req, res, ctx) => {
          return res(
            ctx.json({ message: "Sorry, something went wrong :(" }),
            ctx.status(500)
          );
        })
      );

      const result = await store.dispatch(actions.createCAPE(capeBody));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "CREATE_CAPE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_CAPE: Dispatches failure action after failed PUT", async () => {
      server.use(
        rest.put("http://localhost/undefined/api/cape/12345678", (req, res, ctx) => {
          return res(
            ctx.json({ message: "There was an error saving the CAPE record" }),
            ctx.status(404)
          );
        })
      );

      const result = await store.dispatch(actions.updateCAPE("12345678"));
      const expectedResult = {
        payload: { message: "There was an error saving the CAPE record" },
        type: "UPDATE_CAPE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_CAPE: Dispatches failure action after failed PUT (generic error msg)", async () => {
      server.use(
        rest.put("http://localhost/undefined/api/cape/12345678", (req, res, ctx) => {
          return res(
            ctx.json({ message: "Sorry, something went wrong :(" }),
            ctx.status(500)
          );
        })
      );

      const result = await store.dispatch(actions.updateCAPE("12345678"));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "UPDATE_CAPE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });
    server.close();
  });

  



});
