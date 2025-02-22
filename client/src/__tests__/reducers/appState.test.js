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
  it("should create an action to turn off the spinner", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SPINNER_OFF"
      })
    ).toEqual({
      ...INITIAL_STATE,
      loading: false
    });
  });
  it("should create an action to set the tab", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_TAB",
        payload: 0
      })
    ).toEqual({
      ...INITIAL_STATE,
      tab: 0
    });
  });
  it("should create an action to set the SPF param", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_SPF",
        payload: true
      })
    ).toEqual({
      ...INITIAL_STATE,
      spf: true
    });
  });
  it("should create an action to set the Embed param", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_EMBED",
        payload: true
      })
    ).toEqual({
      ...INITIAL_STATE,
      embed: true
    });
  });
  it("should create an action to set the User selected language param", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_USER_SELECTED_LANGUAGE",
        payload: 'es'
      })
    ).toEqual({
      ...INITIAL_STATE,
      userSelectedLanguage: 'es'
    });
  });
  it("should create an action to set the snackbar params", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_SNACKBAR",
        payload: {open: true, variant: 'danger', message: 'message'}
      })
    ).toEqual({
      ...INITIAL_STATE,
      snackbar: {open: true, variant: 'danger', message: 'message'}
    });
  });
  it("should create an action to set the headline params", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_HEADLINE",
        payload: {id: '1', text: 'text'}
      })
    ).toEqual({
      ...INITIAL_STATE,
      headline: {id: '1', text: 'text'}
    });
  });
  it("should create an action to set the image params", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_IMAGE",
        payload: 'url'
      })
    ).toEqual({
      ...INITIAL_STATE,
      image: 'url'
    });
  });
  it("should create an action to set the body params", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_BODY",
        payload: {id: '1', text: 'text'}
      })
    ).toEqual({
      ...INITIAL_STATE,
      body: {id: '1', text: 'text'}
    });
  });
  it("should create an action to set the Open param", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_OPEN",
        payload: true
      })
    ).toEqual({
      ...INITIAL_STATE,
      open: true
    });
  });
  it("should create an action to set the CAPE Open param", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_CAPE_OPEN",
        payload: true
      })
    ).toEqual({
      ...INITIAL_STATE,
      capeOpen: true
    });
  });
  it("should create an action to set the display CAPE payment fields param", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_DISPLAY_CAPE_PAYMENT_FIELDS",
        payload: true
      })
    ).toEqual({
      ...INITIAL_STATE,
      displayCapePaymentFields: true
    });
  });
  it("should create an action to set the legal language param", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "SET_LEGAL_LANGUAGE",
        payload: 'text'
      })
    ).toEqual({
      ...INITIAL_STATE,
      legalLanguage: 'text'
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
