/**
 * @jest-environment node
 */

import nock from "nock";
import FormData from "form-data";
import { apiMiddleware } from "redux-api-middleware";
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

    it("GET_CONTENT_BY_ID: Dispatches success action after successful GET", async () => {
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

    it("GET_CONTENT_BY_ID: Dispatches failure action after failed GET", async () => {
      const body = JSON.stringify({ message: "Content not found" });
      const init = { status: 404, statusText: "Content not found" };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(
        actions.getContentById("1651a5d6-c2f7-453f-bdc7-13888041add6")
      );
      const expectedResult = {
        payload: { message: "Content not found" },
        type: "GET_CONTENT_BY_ID_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("ADD_CONTENT: Dispatches success action after successful POST", async () => {
      const token = "1234";
      const body = JSON.stringify({
        content_type: "headline",
        content: "Test headline"
      });

      const response = {
        id: "1651a5d6-c2f7-453f-bdc7-13888041add6",
        content_type: "headline",
        content: "Test headline"
      };

      nock(`${BASE_URL}`)
        .post("/api/content", body)
        .reply(200, response);

      const expectedResult = {
        payload: undefined,
        type: "ADD_CONTENT_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.addContent(token, body));
      expect(result).toEqual(expectedResult);
    });

    it("ADD_CONTENT: Dispatches failure action after failed POST", async () => {
      const token = "1234";
      const body = JSON.stringify({
        content_type: undefined
      });
      const init = {
        status: 500,
        statusText: "Sorry, something went wrong :("
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.addContent(token, body));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "ADD_CONTENT_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("GET_ALL_CONTENT: Dispatches success action after successful GET", async () => {
      const token = "1234";

      const response = [
        {
          id: "1651a5d6-c2f7-453f-bdc7-13888041add6",
          content_type: "headline",
          content: "Test headline"
        }
      ];

      nock(`${BASE_URL}`)
        .get("/api/content")
        .reply(200, response);

      const expectedResult = {
        payload: undefined,
        type: "GET_ALL_CONTENT_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.getAllContent(token));
      expect(result).toEqual(expectedResult);
    });

    it("GET_ALL_CONTENT: Dispatches failure action after failed GET", async () => {
      const body = JSON.stringify({
        message: "Sorry, something went wrong :("
      });
      const init = {
        status: 500,
        statusText: "Sorry, something went wrong :("
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.getAllContent());
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "GET_ALL_CONTENT_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("UPLOAD_IMAGE: Dispatches success action after successful POST", async () => {
      const token = "1234";
      const image = { name: "test.png" };
      const data = new FormData();
      data.append("image", image);

      const response = {
        id: "1651a5d6-c2f7-453f-bdc7-13888041add6",
        content_type: "image",
        content: "http://www.example.com/png"
      };

      nock(`${BASE_URL}`)
        .post("/api/content", data)
        .reply(200, response);

      const expectedResult = {
        payload: undefined,
        type: "UPLOAD_IMAGE_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.uploadImage(token, image));
      expect(result).toEqual(expectedResult);
    });

    it("UPLOAD_IMAGE: Dispatches failure action after failed POST", async () => {
      const token = "1234";
      const image = JSON.stringify({ name: "test.png" });
      const data = new FormData();
      data.append("image", image);
      const init = {
        status: 500,
        statusText: "Sorry, something went wrong :("
      };

      fetch.mockResponseOnce(data, init);

      const result = await store.dispatch(actions.uploadImage(token, data));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "UPLOAD_IMAGE_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
