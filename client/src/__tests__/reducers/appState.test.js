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

  it("should handle SET_SPINNER", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_SPINNER",
        payload: "show"
      })
    ).toEqual({
      loggedIn: false,
      authToken: "",
      spinnerClass: "spinner__show",
      loading: false,
      redirect: ""
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_SPINNER",
        payload: "hide"
      })
    ).toEqual({
      loggedIn: false,
      authToken: "",
      spinnerClass: "spinner__hide",
      loading: false,
      redirect: ""
    });
  });
  it("should handle VALIDATE_TOKEN_SUCCESS", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "VALIDATE_TOKEN_SUCCESS",
        meta: { token: "1234" }
      })
    ).toEqual({
      loggedIn: true,
      authToken: "1234",
      spinnerClass: "spinner__hide",
      loading: false,
      redirect: ""
    });
  });
  it("should handle GET_PROFILE_SUCCESS", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "GET_PROFILE_SUCCESS",
        payload: { token: "1234" }
      })
    ).toEqual({
      loggedIn: false,
      authToken: "1234",
      spinnerClass: "spinner__hide",
      loading: false,
      redirect: ""
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
      spinnerClass: "spinner__hide",
      loading: false,
      redirect: ""
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
      spinnerClass: "spinner__hide",
      loading: false,
      redirect: "http://www.example.com"
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
      spinnerClass: "spinner__hide",
      loading: false,
      redirect: ""
    });
  });
});
