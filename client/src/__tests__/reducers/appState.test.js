import reducer, { INITIAL_STATE } from "../../store/reducers/appState";

describe("appState reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual(INITIAL_STATE);
  });
  it("should create an action to set the spinner", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_SPINNER"
      })
    ).toEqual({
      ...INITIAL_STATE,
      loading: true
    });
  });
});
