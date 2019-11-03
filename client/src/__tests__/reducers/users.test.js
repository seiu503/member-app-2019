import reducer, { INITIAL_STATE } from "../../store/reducers/user";

const sampleUser = {
  email: "fake@test.com",
  name: "Test User",
  type: "view",
  created_at: new Date("July 7 2019"),
  updated_at: new Date("July 7 2019")
};

const emptyUser = {
  email: "",
  id: "",
  name: "",
  type: "",
  created_at: "",
  updated_at: ""
};

describe("user reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual(INITIAL_STATE);
  });

  it("should handle LOGOUT", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "LOGOUT"
      })
    ).toEqual(INITIAL_STATE);
  });

  it("should handle HANDLE_INPUT", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "HANDLE_INPUT",
        payload: { name: "type", value: "view" }
      })
    ).toEqual({
      ...INITIAL_STATE,
      form: {
        email: "",
        name: "",
        type: "view",
        existingUserEmail: ""
      }
    });
  });
  it("should handle HANDLE_DELETE_OPEN", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "HANDLE_DELETE_OPEN"
      })
    ).toEqual({
      ...INITIAL_STATE,
      deleteDialogOpen: true
    });
  });
  it("should handle HANDLE_DELETE_CLOSE", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "HANDLE_DELETE_CLOSE"
      })
    ).toEqual({
      ...INITIAL_STATE,
      deleteDialogOpen: false,
      currentUser: emptyUser,
      error: null
    });
  });
  it("should handle DELETE_USER_SUCCESS", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "DELETE_USER_SUCCESS"
      })
    ).toEqual({
      ...INITIAL_STATE,
      deleteDialogOpen: false,
      currentUser: emptyUser,
      error: null
    });
  });
  it("should handle CLEAR_FORM", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "CLEAR_FORM"
      })
    ).toEqual({
      ...INITIAL_STATE,
      form: {
        email: "",
        name: "",
        type: "",
        existingUserEmail: ""
      },
      deleteDialogOpen: false
    });
  });
  it("should handle all api REQUEST actions", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "GET_USER_BY_EMAIL_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: null
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "ADD_USER_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: null
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "UPDATE_USER_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: null
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "DELETE_USER_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: null
    });
  });
  it("should handle SUCCESS actions for GET, POST, and PUT user", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "GET_USER_BY_EMAIL_SUCCESS",
        payload: sampleUser
      })
    ).toEqual({
      ...INITIAL_STATE,
      form: {
        email: sampleUser.email,
        name: sampleUser.name,
        type: sampleUser.type,
        existingUserEmail: ""
      },
      currentUser: { ...sampleUser },
      deleteDialogOpen: false,
      error: null
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "ADD_USER_SUCCESS",
        payload: sampleUser
      })
    ).toEqual({
      ...INITIAL_STATE,
      form: {
        email: sampleUser.email,
        name: sampleUser.name,
        type: sampleUser.type,
        existingUserEmail: ""
      },
      deleteDialogOpen: false,
      error: null
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "UPDATE_USER_SUCCESS",
        payload: sampleUser
      })
    ).toEqual({
      ...INITIAL_STATE,
      form: {
        email: sampleUser.email,
        name: sampleUser.name,
        type: sampleUser.type,
        existingUserEmail: ""
      },
      deleteDialogOpen: false,
      error: null
    });
  });
  it("should handle all api FAILURE actions", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "GET_USER_BY_EMAIL_FAILURE",
        payload: { message: "Some error" }
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: "Some error"
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "ADD_USER_FAILURE",
        payload: { message: null }
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: "Sorry, something went wrong :(\nPlease try again."
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "UPDATE_USER_FAILURE",
        payload: { message: null }
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: "Sorry, something went wrong :(\nPlease try again."
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "DELETE_USER_FAILURE",
        payload: { message: null }
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: "Sorry, something went wrong :(\nPlease try again."
    });
  });
});
