import * as actions from "../../store/actions/index";

describe("index", () => {
  it("should create an action to start the spinner", () => {
    const expectedAction = {
      type: "SET_SPINNER"
    };
    expect(actions.setSpinner()).toEqual(expectedAction);
  });
});
