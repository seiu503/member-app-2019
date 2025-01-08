export const SET_SPINNER = "SET_SPINNER";
export const SPINNER_OFF = "SPINNER_OFF";
export const SET_TAB = "SET_TAB";
export const SET_SPF = "SET_SPF";
export const SET_USER_SELECTED_LANGUAGE = "SET_USER_SELECTED_LANGUAGE",
export const SET_SNACKBAR = "SET_SNACKBAR",

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