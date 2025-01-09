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

export function setImage() {
  return {
    type: SET_IMAGE
  };
}