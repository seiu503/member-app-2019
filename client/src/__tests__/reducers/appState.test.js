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
      userType: undefined
    });
  });
});
