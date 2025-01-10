export const SET_SPINNER = "SET_SPINNER";
export const SPINNER_OFF = "SPINNER_OFF";
export const SET_TAB = "SET_TAB";
export const SET_SPF = "SET_SPF";
export const SET_USER_SELECTED_LANGUAGE = "SET_USER_SELECTED_LANGUAGE";
export const SET_SNACKBAR = "SET_SNACKBAR";
export const SET_EMBED = "SET_EMBED";
export const SET_HEADLINE = "SET_HEADLINE";
export const SET_BODY = "SET_BODY";
export const SET_IMAGE = "SET_IMAGE";
export const SET_OPEN = "SET_OPEN";
export const SET_CAPE_OPEN = "SET_CAPE_OPEN";
export const SET_LEGAL_LANGUAGE = "SET_LEGAL_LANGUAGE";
export const SET_DISPLAY_CAPE_PAYMENT_FIELDS = "SET_DISPLAY_CAPE_PAYMENT_FIELDS";

export function setSpinner() {
  return {
    type: SET_SPINNER
  };
}

export function spinnerOff() {
  return {
    type: SPINNER_OFF
  };
}

export function setTab() {
  return {
    type: SET_TAB
  };
}

export function setSPF() {
  return {
    type: SET_SPF
  };
}

export function setEmbed() {
  return {
    type: SET_EMBED
  };
}

export function setUserSelectedLanguage() {
  return {
    type: SET_USER_SELECTED_LANGUAGE
  };
}

export function setSnackbar() {
  return {
    type: SET_SNACKBAR
  };
}

export function setHeadline() {
  return {
    type: SET_HEADLINE
  };
}

export function setBody() {
  return {
    type: SET_BODY
  };
}

export function setOpen() {
  return {
    type: SET_OPEN
  };
}

export function setCapeOpen() {
  return {
    type: SET_CAPE_OPEN
  };
}

export function setLegalLanguage() {
  return {
    type: SET_LEGAL_LANGUAGE
  };
}

export function setDisplayCapePaymentFields() {
  return {
    type: SET_DISPLAY_CAPE_PAYMENT_FIELDS
  };
}