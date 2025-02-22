import * as actions from "../../store/actions/index";

describe("index", () => {
  it("should create an action to start the spinner", () => {
    const expectedAction = {
      type: "SET_SPINNER"
    };
    expect(actions.setSpinner()).toEqual(expectedAction);
  });

  it("should create an action to stop the spinner", () => {
    const expectedAction = {
      type: "SPINNER_OFF"
    };
    expect(actions.spinnerOff()).toEqual(expectedAction);
  });

  it("should create an action to set the tab", () => {
    const expectedAction = {
      type: "SET_TAB",
      payload: {value: 'value'}
    };
    expect(actions.setTab('value')).toEqual(expectedAction);
  });

  it("should create an action to set the SPF param", () => {
    const expectedAction = {
      type: "SET_SPF",
      payload: 'value'
    };
    expect(actions.setSPF('value')).toEqual(expectedAction);
  });

  it("should create an action to set the Embed param", () => {
    const expectedAction = {
      type: "SET_EMBED",
      payload: 'value'
    };
    expect(actions.setEmbed('value')).toEqual(expectedAction);
  });

  it("should create an action to set the user-selected language", () => {
    const expectedAction = {
      type: "SET_USER_SELECTED_LANGUAGE",
      payload: 'value'
    };
    expect(actions.setUserSelectedLanguage('value')).toEqual(expectedAction);
  });

  it("should create an action to set the Snackbar params", () => {
    const expectedAction = {
      type: "SET_SNACKBAR",
      payload: { open: 'open', variant: 'variant', message: 'message' }
    };
    expect(actions.setSnackbar({open: 'open', variant: 'variant', message: 'message'})).toEqual(expectedAction);
  });

  it("should create an action to set the Headline params", () => {
    const expectedAction = {
      type: "SET_HEADLINE",
      payload: { text: 'text', id: 'id' }
    };
    expect(actions.setHeadline({text: 'text', id: 'id'})).toEqual(expectedAction);
  });

  it("should create an action to set the Body params", () => {
    const expectedAction = {
      type: "SET_BODY",
      payload: { text: 'text', id: 'id' }
    };
    expect(actions.setBody({text: 'text', id: 'id'})).toEqual(expectedAction);
  });

  it("should create an action to set the Open param", () => {
    const expectedAction = {
      type: "SET_OPEN",
      payload: 'value'
    };
    expect(actions.setOpen('value')).toEqual(expectedAction);
  });

  it("should create an action to set the CAPE Open param", () => {
    const expectedAction = {
      type: "SET_CAPE_OPEN",
      payload: 'value'
    };
    expect(actions.setCapeOpen('value')).toEqual(expectedAction);
  });

  it("should create an action to set the Legal Language param", () => {
    const expectedAction = {
      type: "SET_LEGAL_LANGUAGE",
      payload: 'value'
    };
    expect(actions.setLegalLanguage('value')).toEqual(expectedAction);
  });

  it("should create an action to set the Display CAPE Payment fields param", () => {
    const expectedAction = {
      type: "SET_DISPLAY_CAPE_PAYMENT_FIELDS",
      payload: 'value'
    };
    expect(actions.setDisplayCapePaymentFields('value')).toEqual(expectedAction);
  });
});
