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

export function setTab(value) {
  return {
    type: SET_TAB,
    payload: { value }
  };
}

export function setSPF(value) {
  return {
    type: SET_SPF,
    payload: { value }
  };
}

export function setEmbed(value) {
  return {
    type: SET_EMBED,
    payload: { value }
  };
}

export function setUserSelectedLanguage(value) {
  return {
    type: SET_USER_SELECTED_LANGUAGE,
    payload: { value }
  };
}

export function setSnackbar({ open, variant, message }) {
  return {
    type: SET_SNACKBAR,
    payload: { open, variant, message }
  };
}

export function setHeadline({ text, id }) {
  return {
    type: SET_HEADLINE,
    payload: { text, id }
  };
}

export function setBody({ text, id }) {
  return {
    type: SET_BODY,
    payload: { text, id }
  };
}

export function setOpen(value) {
  return {
    type: SET_OPEN,
    payload: { value }
  };
}

export function setCapeOpen(value) {
  return {
    type: SET_CAPE_OPEN,
    payload: { value }
  };
}

export function setLegalLanguage(value) {
  return {
    type: SET_LEGAL_LANGUAGE,
    payload: { value }
  };
}

export function setDisplayCapePaymentFields(value) {
  return {
    type: SET_DISPLAY_CAPE_PAYMENT_FIELDS,
    payload: { value }
  };
}