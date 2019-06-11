// import { RSAA } from "redux-api-middleware";
// import BASE_URL from "./apiConfig.js";

export const HANDLE_INPUT = "HANDLE_INPUT";
export const HANDLE_SELECT = "HANDLE_SELECT";
export const HANDLE_CHECKBOX = "HANDLE_CHECKBOX";
export const CLEAR_FORM = "CLEAR_FORM";

export function handleInput({ target: { name, value } }) {
  return {
    type: HANDLE_INPUT,
    payload: { name, value }
  };
}

export function handleSelect(name, value) {
  return {
    type: HANDLE_SELECT,
    payload: { name, value }
  };
}

export function handleCheckbox(name, value) {
  return {
    type: HANDLE_CHECKBOX,
    payload: { name, value }
  };
}

export function clearForm() {
  return {
    type: CLEAR_FORM
  };
}
