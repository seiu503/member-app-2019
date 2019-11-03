export const LOGOUT = "LOGOUT";
export const SET_LOGGEDIN = "SET_LOGGEDIN";
export const SET_SPINNER = "SET_SPINNER";
export const SET_REDIRECT_URL = "SET_REDIRECT_URL";

export function logout() {
  return {
    type: LOGOUT
  };
}

export function setLoggedIn(type) {
  return {
    type: SET_LOGGEDIN,
    payload: type
  };
}

export function setSpinner() {
  return {
    type: SET_SPINNER
  };
}

export function setRedirectUrl(url) {
  return {
    type: SET_REDIRECT_URL,
    payload: url
  };
}
