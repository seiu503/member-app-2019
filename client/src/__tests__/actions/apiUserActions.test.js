/**
 * @jest-environment node
 */
/* istanbul ignore file */
import nock from "nock";
import { apiMiddleware } from "redux-api-middleware";
import configureMockStore from "redux-mock-store";
import * as actions from "../../store/actions/apiUserActions";
import * as userReducer from "../../store/reducers/user";
const BASE_URL = process.env.REACT_APP_BASE_URL;

const createStore = configureMockStore([apiMiddleware]);
const store = createStore(userReducer.initialState);
const token = "1234";
const id = "1651a5d6-c2f7-453f-bdc7-13888041add6";

describe.skip("apiUserActions", () => {
  it("should create an action to handle form input", () => {
    const e = { target: { name: "type", value: "view" } };
    const expectedAction = {
      type: "HANDLE_INPUT",
      payload: { name: "type", value: "view" }
    };
    expect(actions.handleInput(e)).toEqual(expectedAction);
  });

  it("should create an action to open the delete dialog", () => {
    const selectedUser = {
      email: "fake@test.com",
      name: "Test User",
      type: "view"
    };
    const expectedAction = {
      type: "HANDLE_DELETE_OPEN",
      payload: { user: selectedUser }
    };
    expect(actions.handleDeleteOpen(selectedUser)).toEqual(expectedAction);
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

    it("GET_USER_BY_EMAIL: Dispatches success action after successful GET", async () => {
      const response = {
        email: "fake@test.com",
        name: "Test User",
        type: "view",
        id: "1651a5d6-c2f7-453f-bdc7-13888041add6",
        created_at: new Date("July 7 2019"),
        updated_at: new Date("July 7 2019")
      };

      nock(`${BASE_URL}`)
        .get("/api/user/email/fake@test.com/admin")
        .reply(200, response);

      const expectedResult = {
        payload: undefined,
        type: "GET_USER_BY_EMAIL_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(
        actions.getUserByEmail("fake@test.com", "admin")
      );
      expect(result).toEqual(expectedResult);
    });

    it("GET_USER_BY_EMAIL: Dispatches failure action after failed GET", async () => {
      const body = JSON.stringify({ message: "User not found" });
      const init = { status: 404, statusText: "User not found" };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.getUserByEmail("badEmail"));
      const expectedResult = {
        payload: { message: "User not found" },
        type: "GET_USER_BY_EMAIL_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("GET_USER_BY_EMAIL: Dispatches failure action after failed GET (generic error msg)", async () => {
      const body = JSON.stringify({});
      const init = {
        status: 500,
        statusText: "There was an error fetching the CAPE record"
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.getUserByEmail("badEmail"));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "GET_USER_BY_EMAIL_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("ADD_USER: Dispatches success action after successful POST", async () => {
      const token = "1234";
      const body = JSON.stringify({
        email: "fake@test.com",
        name: "Test User",
        type: "view"
      });

      const response = {
        id: "1651a5d6-c2f7-453f-bdc7-13888041add6",
        email: "fake@test.com",
        name: "Test User",
        type: "view",
        requestingUserType: "admin"
      };

      nock(`${BASE_URL}`)
        .post("/api/user", body)
        .reply(200, response);

      const expectedResult = {
        payload: undefined,
        type: "ADD_USER_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.addUser(token, body));
      expect(result).toEqual(expectedResult);
    });

    it("ADD_USER: Dispatches failure action after failed POST", async () => {
      const token = "1234";
      const body = JSON.stringify({
        message: "Sorry, something went wrong :("
      });
      const init = {
        status: 500,
        statusText: "Sorry, something went wrong :("
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.addUser(token, body));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "ADD_USER_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("ADD_USER: Dispatches failure action after failed POST (generic error msg)", async () => {
      const body = JSON.stringify({});
      const init = {
        status: 500,
        statusText: "Sorry, something went wrong :("
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.addUser(token, body));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "ADD_USER_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_USER: Dispatches success action after successful PUT", async () => {
      const token = "1234";
      const id = "1651a5d6-c2f7-453f-bdc7-13888041add6";
      const body = JSON.stringify({
        email: "new@email.com",
        name: "name",
        type: "view"
      });

      const response = {
        id: "1651a5d6-c2f7-453f-bdc7-13888041add6",
        email: "new@email.com",
        name: "name",
        type: "view",
        requestingUserType: "admin"
      };

      nock(`${BASE_URL}`)
        .put(`/api/user/${id}`, body)
        .reply(200, response);

      const expectedResult = {
        payload: undefined,
        type: "UPDATE_USER_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.updateUser(token, id, body));
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_USER: Dispatches failure action after failed PUT", async () => {
      const body = JSON.stringify({
        message: "Sorry, something went wrong :("
      });
      const init = {
        status: 500,
        statusText: "Sorry, something went wrong :("
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.updateUser(token, id, body));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "UPDATE_USER_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("UPDATE_USER: Dispatches failure action after failed PUT (generic error msg)", async () => {
      const body = JSON.stringify({});
      const init = {
        status: 500,
        statusText: "Sorry, something went wrong :("
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.updateUser(token, id, body));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "UPDATE_USER_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("DELETE_USER: Dispatches success action after successful DELETE", async () => {
      const response = {
        message: "User deleted successfully"
      };

      nock(`${BASE_URL}`)
        .delete(`/api/user/${id}/admin`)
        .reply(200, response);

      const expectedResult = {
        payload: undefined,
        type: "DELETE_USER_SUCCESS",
        meta: undefined
      };

      const result = await store.dispatch(actions.deleteUser(token, id));
      expect(result).toEqual(expectedResult);
    });

    it("DELETE_USER: Dispatches failure action after failed DELETE", async () => {
      const body = JSON.stringify({
        message: "Sorry, something went wrong :("
      });
      const init = {
        status: 500,
        statusText: "Sorry, something went wrong :("
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.deleteUser(token, id));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "DELETE_USER_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });

    it("DELETE_USER: Dispatches failure action after failed DELETE (generic error msg)", async () => {
      const body = JSON.stringify({});
      const init = {
        status: 500,
        statusText: "Sorry, something went wrong :("
      };

      fetch.mockResponseOnce(body, init);

      const result = await store.dispatch(actions.deleteUser(token, id));
      const expectedResult = {
        payload: { message: "Sorry, something went wrong :(" },
        type: "DELETE_USER_FAILURE",
        error: true,
        meta: undefined
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
