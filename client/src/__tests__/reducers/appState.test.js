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
  it("sets loading to true on add submission request", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "ADD_SUBMISSION_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      loading: true
    });
  });
  it("sets loading to true on UPDATE_SUBMISSION_REQUEST", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "UPDATE_SUBMISSION_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      loading: true
    });
  });
  it("sets loading to true on GET_SF_CONTACT_REQUEST", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "GET_SF_CONTACT_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      loading: true
    });
  });
  it("sets loading to false on ADD_SUBMISSION_SUCCESS", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "ADD_SUBMISSION_SUCCESS"
      })
    ).toEqual({
      ...INITIAL_STATE,
      loading: false
    });
  });
  it("sets loading to false on ADD_SUBMISSION_FAILURE", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "ADD_SUBMISSION_FAILURE"
      })
    ).toEqual({
      ...INITIAL_STATE,
      loading: false
    });
  });
  it("sets loading to false on UPDATE_SUBMISSION_SUCCESS", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "UPDATE_SUBMISSION_SUCCESS"
      })
    ).toEqual({
      ...INITIAL_STATE,
      loading: false
    });
  });
  it("sets loading to false on UPDATE_SUBMISSION_FAILURE", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "UPDATE_SUBMISSION_FAILURE"
      })
    ).toEqual({
      ...INITIAL_STATE,
      loading: false
    });
  });
  it("sets loading to true on update submission request", () => {
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
