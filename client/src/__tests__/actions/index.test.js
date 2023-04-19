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

  // it("should create an action to set a redirect URL", () => {
  //   const url = "http://www.example.com";
  //   const expectedAction = {
  //     type: "SET_REDIRECT_URL",
  //     payload: url
  //   };
  //   expect(actions.setRedirectUrl(url)).toEqual(expectedAction);
  // });
});
