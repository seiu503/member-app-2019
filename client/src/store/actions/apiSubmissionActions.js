import { RSAA } from "redux-api-middleware";
import BASE_URL from "./apiConfig.js";

export const HANDLE_INPUT = "HANDLE_INPUT";
export const HANDLE_SELECT = "HANDLE_SELECT";
export const HANDLE_CHECKBOX = "HANDLE_CHECKBOX";
export const CLEAR_FORM = "CLEAR_FORM";
export const ADD_SUBMISSION_REQUEST = "ADD_SUBMISSION_REQUEST";
export const ADD_SUBMISSION_SUCCESS = "ADD_SUBMISSION_SUCCESS";
export const ADD_SUBMISSION_FAILURE = "ADD_SUBMISSION_FAILURE";

export function handleInput({ target: { name, value } }) {
  return {
    type: HANDLE_INPUT,
    payload: { name, value }
  };
}

export function handleSelect(event) {
  const name = event.target.name;
  const value = event.target.value;
  return {
    type: HANDLE_SELECT,
    payload: { name, value }
  };
}

export function handleCheckbox(event) {
  const name = event.target.name;
  const value = event.target.checked;
  return {
    type: HANDLE_CHECKBOX,
    payload: { name, value }
  };
}

export function addSubmission(body) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/submission/`,
      method: "POST",
      types: [
        ADD_SUBMISSION_REQUEST,
        ADD_SUBMISSION_SUCCESS,
        {
          type: ADD_SUBMISSION_FAILURE,
          payload: (action, state, res) => {
            return res.json().then(data => {
              let message = "Sorry, something went wrong :(";
              if (data) {
                if (data.message) {
                  message = data.message;
                }
                return { message };
              } else {
                return { message };
              }
            });
          }
        }
      ],
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  };
}

export function clearForm() {
  return {
    type: CLEAR_FORM
  };
}
