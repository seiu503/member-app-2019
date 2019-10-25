/**
 * @jest-environment node
 */

import nock from "nock";
import { apiMiddleware } from "redux-api-middleware";
import configureMockStore from "redux-mock-store";
import * as actions from "../../store/actions/apiProfileActions";
import * as profileReducer from "../../store/reducers/profile";
const BASE_URL = process.env.REACT_APP_BASE_URL;

const createStore = configureMockStore([apiMiddleware]);
const store = createStore(profileReducer.initialState);
const id = "1234";
const token = "1651a5d6-c2f7-453f-bdc7-13888041add6";

describe("apiProfileActions", () => {
  describe("api actions", () => {
    afterEach(() => {
      nock.cleanAll();
      nock.enableNetConnect();
      // expect at least one expect in async code:
      expect.hasAssertions();
    });

    it("VALIDATE_TOKEN: Dispatches success action after successful GET", async () => {
      const response = {
        id: id,
        name: "Emma Goldman",
        avatar_url: "http://www.example.com/avatar.png"
      };

      nock(`${BASE_URL}`)
        .get(`/api/user/${response.id}`)
        .reply(200, response);

      const expectedResult = {
        meta: undefined,
        type: "VALIDATE_TOKEN_SUCCESS",
        payload: {
          token
        }
      };

      const result = await store.dispatch(
        actions.validateToken(token, response.id)
      );
      expect(result).toEqual(expectedResult);
    });

    it("VALIDATE_TOKEN: Dispatches failure action after failed GET", async () => {
      const body = JSON.stringify({ message: "User not found" });
      const init = { status: 404, statusText: "User not found" };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.validateToken(token, id));
      const expectedResult = {
        payload: { message: "User not found" },
        type: "VALIDATE_TOKEN_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("VALIDATE_TOKEN: Dispatches failure action after failed GET (generic error msg)", async () => {
      const body = JSON.stringify({});
      const init = {
        status: 500,
        statusText: "User not found"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.validateToken(token, id));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "VALIDATE_TOKEN_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("GET_PROFILE: Dispatches success action after successful GET", async () => {
      const response = {
        id,
        name: "Emma Goldman",
        avatar_url: "http://www.example.com/avatar.png"
      };

      nock(`${BASE_URL}`)
        .get(`/api/user/${response.id}`)
        .reply(200, response);

      const expectedResult = {
        payload: undefined,
        type: "GET_PROFILE_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(
        actions.getProfile(token, response.id)
      );
      expect(result).toEqual(expectedResult);
    });

    it("GET_PROFILE: Dispatches failure action after failed GET", async () => {
      const body = JSON.stringify({ message: "User not found" });
      const init = { status: 404, statusText: "User not found" };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.getProfile(token, id));
      const expectedResult = {
        payload: { message: "User not found" },
        type: "GET_PROFILE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("GET_PROFILE: Dispatches failure action after failed GET (generic error msg)", async () => {
      const body = JSON.stringify({});
      const init = {
        status: 500,
        statusText: "User not found"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.getProfile(token, id));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "GET_PROFILE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("MODIFY_PROFILE: Dispatches success action after successful PUT", async () => {
      const response = {
        id,
        name: "Emma Goldman",
        avatar_url: "http://www.example.com/avatar.png"
      };
      const body = {
        name: "Assata Shakur"
      };

      nock(`${BASE_URL}`)
        .put(`/api/user/${response.id}`, body)
        .reply(200, response);

      const expectedResult = {
        payload: undefined,
        type: "MODIFY_PROFILE_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(
        actions.modifyProfile(token, response.id, body)
      );
      expect(result).toEqual(expectedResult);
    });

    it("MODIFY_PROFILE: Dispatches failure action after failed PUT", async () => {
      const body = JSON.stringify({ message: "User not found" });
      const init = { status: 404, statusText: "User not found" };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(
        actions.modifyProfile(token, id, body)
      );
      const expectedResult = {
        payload: { message: "User not found" },
        type: "MODIFY_PROFILE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("MODIFY_PROFILE: Dispatches failure action after failed PUT (generic error msg)", async () => {
      const body = JSON.stringify({});
      const init = {
        status: 500,
        statusText: "User not found"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(
        actions.modifyProfile(token, id, body)
      );
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "MODIFY_PROFILE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
