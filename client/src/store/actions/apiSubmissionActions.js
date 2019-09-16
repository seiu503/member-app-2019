import { RSAA } from "redux-api-middleware";
import BASE_URL from "./apiConfig.js";

export const ADD_SUBMISSION_REQUEST = "ADD_SUBMISSION_REQUEST";
export const ADD_SUBMISSION_SUCCESS = "ADD_SUBMISSION_SUCCESS";
export const ADD_SUBMISSION_FAILURE = "ADD_SUBMISSION_FAILURE";
export const SAVE_SALESFORCEID = "SAVE_SALESFORCEID";
export const UPDATE_SUBMISSION_REQUEST = "UPDATE_SUBMISSION_REQUEST";
export const UPDATE_SUBMISSION_SUCCESS = "UPDATE_SUBMISSION_SUCCESS";
export const UPDATE_SUBMISSION_FAILURE = "UPDATE_SUBMISSION_FAILURE";
export const GET_ALL_SUBMISSIONS_REQUEST = "GET_ALL_SUBMISSIONS_REQUEST";
export const GET_ALL_SUBMISSIONS_SUCCESS = "GET_ALL_SUBMISSIONS_SUCCESS";
export const GET_ALL_SUBMISSIONS_FAILURE = "GET_ALL_SUBMISSIONS_FAILURE";
export const HANDLE_INPUT = "HANDLE_INPUT";
export const VERIFY_REQUEST = "VERIFY_REQUEST";
export const VERIFY_SUCCESS = "VERIFY_SUCCESS";
export const VERIFY_FAILURE = "VERIFY_FAILURE";

export function handleInput({ target: { name, value } }) {
  return {
    type: HANDLE_INPUT,
    payload: { name, value }
  };
}

export function addSubmission(body) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/submission`,
      method: "POST",
      types: [
        ADD_SUBMISSION_REQUEST,
        ADD_SUBMISSION_SUCCESS,
        {
          type: ADD_SUBMISSION_FAILURE,
          payload: (action, state, res) => {
            return res.json().then(data => {
              let message = "Sorry, something went wrong :(";
              if (data && data.message) {
                message = data.message;
              }
              return { message };
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

export function updateSubmission(id, body) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/submission/${id}`,
      method: "PUT",
      types: [
        UPDATE_SUBMISSION_REQUEST,
        UPDATE_SUBMISSION_SUCCESS,
        {
          type: UPDATE_SUBMISSION_FAILURE,
          payload: (action, state, res) => {
            return res.json().then(data => {
              let message = "Sorry, something went wrong :(";
              if (data && data.message) {
                message = data.message;
              }
              return { message };
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

export function getAllSubmissions(token) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/submission`,
      method: "GET",
      types: [
        GET_ALL_SUBMISSIONS_REQUEST,
        GET_ALL_SUBMISSIONS_SUCCESS,
        {
          type: GET_ALL_SUBMISSIONS_FAILURE,
          payload: (action, state, res) => {
            return res.json().then(data => {
              let message = "Sorry, something went wrong :(";
              if (data && data.message) {
                message = data.message;
              }
              return { message };
            });
          }
        }
      ],
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  };
}

export function saveSalesforceId(id) {
  return {
    type: SAVE_SALESFORCEID,
    payload: { salesforceId: id }
  };
}

export function verify(token, ip_address) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/verify`,
      method: "POST",
      types: [
        VERIFY_REQUEST,
        VERIFY_SUCCESS,
        {
          type: VERIFY_FAILURE,
          payload: (action, state, res) => {
            return res.json().then(data => {
              let message = "Sorry, something went wrong :(";
              if (data && data.message) {
                message = data.message;
              }
              return { message };
            });
          }
        }
      ],
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token, ip_address })
    }
  };
}
