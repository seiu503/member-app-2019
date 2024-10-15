import { setupServer } from "msw/node";
import handlers from "../../mocks/handlers";
import { http, HttpResponse } from "msw";
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

describe("apiSubmissionActions SUCCESS", () => {

  describe("api actions SUCCESS", () => {
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
      server.close();
      server.listen();

      it("ADD_SUBMISSION: Dispatches success action after successful POST", async () => {
        server.resetHandlers();

        server.use(
          http.post("http://localhost:8080/api/submission", (req, res, ctx) => {
            return HttpResponse.json({ 
                payload: { id: "testid" },
                type: "ADD_SUBMISSION_SUCCESS",
                meta: undefined
              });
          })
        );

        const expectedResult = {
          payload: { id: "testid" },
          type: "ADD_SUBMISSION_SUCCESS",
          meta: undefined
        };

        const result = await store.dispatch(
          actions.addSubmission(submissionBody)
        );
        expect(result).toEqual(expectedResult);
        server.resetHandlers();
      });

      it("UPDATE_SUBMISSION: Dispatches success action after successful PUT", async () => {
        server.resetHandlers();

        server.use(
          http.put("http://localhost:8080/api/submission/12345678", (req, res, ctx) => {
            return HttpResponse.json({ 
                payload: { id: "testid" },
                type: "UPDATE_SUBMISSION_SUCCESS",
                meta: undefined
              });
          })
        );

        const expectedResult = {
          payload: { id: "testid" },
          type: "UPDATE_SUBMISSION_SUCCESS",
          meta: undefined
        };

        const result = await store.dispatch(actions.updateSubmission("12345678"));
        expect(result).toEqual(expectedResult);
        server.resetHandlers();
      });

      it("VERIFY: Dispatches success action after successful POST", async () => {
        server.resetHandlers();
        const expectedResult = {
          payload: { score: 0.9 },
          type: "VERIFY_SUCCESS",
          meta: undefined
        };

        const result = await store.dispatch(actions.verify(token, "10.0.0.1"));
        expect(result).toEqual(expectedResult);
        server.resetHandlers();
      });

      it("CREATE_CAPE: Dispatches success action after successful POST", async () => {
        server.resetHandlers();
        const expectedResult = {
          payload: { id: "testid" },
          type: "CREATE_CAPE_SUCCESS",
          meta: undefined
        };

        const result = await store.dispatch(actions.createCAPE(capeBody));
        expect(result).toEqual(expectedResult);
        server.resetHandlers();
      });

      it("UPDATE_CAPE: Dispatches success action after successful PUT", async () => {
        server.resetHandlers();
        const expectedResult = {
          payload: { id: "testid" },
          type: "UPDATE_CAPE_SUCCESS",
          meta: undefined
        };

        const result = await store.dispatch(actions.updateCAPE("12345678"));
        expect(result).toEqual(expectedResult);
        server.resetHandlers();
      });
    });

});