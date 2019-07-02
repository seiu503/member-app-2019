/**
 * @jest-environment node
 */

import nock from "nock";
import { apiMiddleware, ApiError } from "redux-api-middleware";
import configureMockStore from "redux-mock-store";
import * as actions from "../../store/actions/apiContentActions";
import * as contentReducer from "../../store/reducers/content";
import BASE_URL from "../../store/actions/apiConfig.js";

const createStore = configureMockStore([apiMiddleware]);
const store = createStore(contentReducer.initialState);

describe("apiContentActions", () => {
  it("should create an action to handle form input", () => {
    const e = { target: { name: "headline", value: "test headline content" } };
    const expectedAction = {
      type: "HANDLE_INPUT",
      payload: { name: "headline", value: "test headline content" }
    };
    expect(actions.handleInput(e)).toEqual(expectedAction);
  });

  it("should create an action to open the delete dialog", () => {
    const selectedContent = {
      content_type: "headline",
      content: "test headline"
    };
    const expectedAction = {
      type: "HANDLE_DELETE_OPEN",
      payload: { selectedContent }
    };
    expect(actions.handleDeleteOpen(selectedContent)).toEqual(expectedAction);
  });

  it("should create an action to close the delete dialog", () => {
    const expectedAction = {
      type: "HANDLE_DELETE_CLOSE"
    };
    expect(actions.handleDeleteClose()).toEqual(expectedAction);
  });

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

    it("GET_CONTENT_BY_ID: Dispatches success action after successful fetch", async () => {
      const response = {
        content_type: "headline",
        content: "Test headline",
        id: "1651a5d6-c2f7-453f-bdc7-13888041add6"
      };

      nock(`${BASE_URL}`)
        .get("/api/content/1651a5d6-c2f7-453f-bdc7-13888041add6")
        .reply(200, response);

      const expectedResult = {
        payload: undefined,
        type: "GET_CONTENT_BY_ID_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(
        actions.getContentById("1651a5d6-c2f7-453f-bdc7-13888041add6")
      );
      expect(result).toEqual(expectedResult);
    });

    it("GET_CONTENT_BY_ID: Dispatches failure actions after failed fetch", async () => {
      const body = JSON.stringify({ message: "Content not found" });
      const init = { status: 404, statusText: "Content not found" };

      fetch.mockResponseOnce(body, init);

      const dispatchSpy = jest.spyOn(store, "dispatch");
      const spyCall = dispatchSpy.mock.calls;
      console.log(spyCall);
      expect(JSON.stringify(spyCall)).toEqual(
        JSON.stringify(
          actions.getContentById("1651a5d6-c2f7-453f-bdc7-13888041add6")
        )
      );

      //   it('handles fetch errors', () => {
      //     return get('doesnotexist')
      //       .catch(error => expect(error).toEqual('some error'));
      //   });

      //   nock(`${BASE_URL}`)
      //     .get('/api/content/1651a5d6-c2f7-453f-bdc7-13999041add6')
      //     .reply( (url, body, cb) => { cb(null, [400, { response }]); });

      //   const expectedResult = {
      //     payload: response,
      //     type: 'GET_CONTENT_BY_ID_FAILURE',
      //     meta: undefined
      //   }

      //   const result = await store
      //     .dispatch(
      //       actions.getContentById("1651a5d6-c2f7-453f-bdc7-13888041add6")
      //     );
      //   console.log(result);
      //   expect(result).toEqual(expectedResult);
    });
  });
});
