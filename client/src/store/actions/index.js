export const SET_SPINNER = "SET_SPINNER";
export const SPINNER_OFF = "SPINNER_OFF";

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