import * as actions from "../../store/actions/index";

describe("index", () => {
  it("should create an action to log in a user", () => {
    const expectedAction = {
      type: "SET_LOGGEDIN"
    };
    expect(actions.setLoggedIn()).toEqual(expectedAction);
  });

  it("should create an action to log out a user", () => {
    const expectedAction = {
      type: "LOGOUT"
    };
    expect(actions.logout()).toEqual(expectedAction);
  });

  it("should create an action to start the spinner", () => {
    const expectedAction = {
      type: "SET_SPINNER"
    };
    expect(actions.setSpinner()).toEqual(expectedAction);
  });
});
