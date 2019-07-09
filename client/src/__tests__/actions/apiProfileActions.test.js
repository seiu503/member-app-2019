/**
 * @jest-environment node
 */

import nock from "nock";
import { apiMiddleware } from "redux-api-middleware";
import configureMockStore from "redux-mock-store";
import * as actions from "../../store/actions/apiProfileActions";
import * as profileReducer from "../../store/reducers/profile";
import BASE_URL from "../../store/actions/apiConfig.js";

const createStore = configureMockStore([apiMiddleware]);
const store = createStore(profileReducer.initialState);

describe("apiProfileActions", () => {
  describe("api actions", () => {
    afterEach(() => {
      nock.cleanAll();
      nock.enableNetConnect();
      // expect at least one expect in async code:
      expect.hasAssertions();
    });

    it("VALIDATE_TOKEN: Dispatches success action after successful GET", async () => {
      const token = "1234";
      const response = {
        _id: "1651a5d6-c2f7-453f-bdc7-13888041add6",
        name: "Emma Goldman",
        avatar_url: "http://www.example.com/avatar.png"
      };

      nock(`${BASE_URL}`)
        .get(`/api/user/${response._id}`)
        .reply(200, response);

      const expectedResult = {
        payload: undefined,
        type: "VALIDATE_TOKEN_SUCCESS",
        meta: {
          token: "1234"
        }
      };

      const result = await store.dispatch(
        actions.validateToken(token, response._id)
      );
      expect(result).toEqual(expectedResult);
    });

    it("VALIDATE_TOKEN: Dispatches failure action after failed GET", async () => {
      const body = JSON.stringify({ message: "User not found" });
      const init = { status: 404, statusText: "User not found" };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(
        actions.validateToken("1234", "1651a5d6-c2f7-453f-bdc7-13888041add6")
      );
      const expectedResult = {
        payload: { message: "User not found" },
        type: "VALIDATE_TOKEN_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("GET_PROFILE: Dispatches success action after successful GET", async () => {
      const token = "1234";
      const response = {
        _id: "1651a5d6-c2f7-453f-bdc7-13888041add6",
        name: "Emma Goldman",
        avatar_url: "http://www.example.com/avatar.png"
      };

      nock(`${BASE_URL}`)
        .get(`/api/user/${response._id}`)
        .reply(200, response);

      const expectedResult = {
        payload: undefined,
        type: "GET_PROFILE_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(
        actions.getProfile(token, response._id)
      );
      expect(result).toEqual(expectedResult);
    });

    it("GET_PROFILE: Dispatches failure action after failed GET", async () => {
      const body = JSON.stringify({ message: "User not found" });
      const init = { status: 404, statusText: "User not found" };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(
        actions.getProfile("1234", "1651a5d6-c2f7-453f-bdc7-13888041add6")
      );
      const expectedResult = {
        payload: { message: "User not found" },
        type: "GET_PROFILE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("MODIFY_PROFILE: Dispatches success action after successful PUT", async () => {
      const token = "1234";
      const response = {
        _id: "1651a5d6-c2f7-453f-bdc7-13888041add6",
        name: "Emma Goldman",
        avatar_url: "http://www.example.com/avatar.png"
      };
      const body = {
        name: "Assata Shakur"
      };

      nock(`${BASE_URL}`)
        .put(`/api/user/${response._id}`, body)
        .reply(200, response);

      const expectedResult = {
        payload: undefined,
        type: "MODIFY_PROFILE_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(
        actions.modifyProfile(token, response._id, body)
      );
      expect(result).toEqual(expectedResult);
    });

    it("MODIFY_PROFILE: Dispatches failure action after failed GET", async () => {
      const body = JSON.stringify({ message: "User not found" });
      const init = { status: 404, statusText: "User not found" };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(
        actions.modifyProfile("1234", "1651a5d6-c2f7-453f-bdc7-13888041add6"),
        { name: "Assata Shakur" }
      );
      const expectedResult = {
        payload: { message: "User not found" },
        type: "MODIFY_PROFILE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
