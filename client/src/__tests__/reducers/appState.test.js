import reducer, { INITIAL_STATE } from "../../store/reducers/appState";

describe("appState reducer", () => {
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

  it("should handle VALIDATE_TOKEN_SUCCESS", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "VALIDATE_TOKEN_SUCCESS",
        payload: { token: "1234" }
      })
    ).toEqual({
      loggedIn: true,
      authToken: "1234",
      loading: false,
      redirect: "",
      userType: undefined
    });
  });
  it("should handle GET_PROFILE_SUCCESS", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "GET_PROFILE_SUCCESS",
        payload: { token: "1234" }
      })
    ).toEqual({
      loggedIn: true,
      authToken: "",
      loading: false,
      redirect: "",
      userType: undefined
    });
  });
  it("should handle VALIDATE_TOKEN_FAILURE", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "VALIDATE_TOKEN_FAILURE"
      })
    ).toEqual({
      loggedIn: false,
      authToken: "",
      loading: false,
      redirect: "",
      userType: ""
    });
  });
  it("should handle SET_REDIRECT_URL", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_REDIRECT_URL",
        payload: "http://www.example.com"
      })
    ).toEqual({
      loggedIn: false,
      authToken: "",
      loading: false,
      redirect: "http://www.example.com",
      userType: ""
    });
  });

  it("should handle SET_LOGGEDIN", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_LOGGEDIN"
      })
    ).toEqual({
      loggedIn: true,
      authToken: "",
      loading: false,
      redirect: "",
      userType: undefined
    });
  });
});
