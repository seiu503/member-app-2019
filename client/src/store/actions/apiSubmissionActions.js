import { RSAA } from "redux-api-middleware";
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const ADD_SUBMISSION_REQUEST = "ADD_SUBMISSION_REQUEST";
export const ADD_SUBMISSION_SUCCESS = "ADD_SUBMISSION_SUCCESS";
export const ADD_SUBMISSION_FAILURE = "ADD_SUBMISSION_FAILURE";
export const DELETE_SUBMISSION_REQUEST = "DELETE_SUBMISSION_REQUEST";
export const DELETE_SUBMISSION_SUCCESS = "DELETE_SUBMISSION_SUCCESS";
export const DELETE_SUBMISSION_FAILURE = "DELETE_SUBMISSION_FAILURE";
export const CREATE_CAPE_REQUEST = "CREATE_CAPE_REQUEST";
export const CREATE_CAPE_SUCCESS = "CREATE_CAPE_SUCCESS";
export const CREATE_CAPE_FAILURE = "CREATE_CAPE_FAILURE";
export const UPDATE_CAPE_REQUEST = "UPDATE_CAPE_REQUEST";
export const UPDATE_CAPE_SUCCESS = "UPDATE_CAPE_SUCCESS";
export const UPDATE_CAPE_FAILURE = "UPDATE_CAPE_FAILURE";
export const SAVE_SALESFORCEID = "SAVE_SALESFORCEID";
export const SAVE_SUBMISSIONID = "SAVE_SUBMISSIONID";
export const UPDATE_SUBMISSION_REQUEST = "UPDATE_SUBMISSION_REQUEST";
export const UPDATE_SUBMISSION_SUCCESS = "UPDATE_SUBMISSION_SUCCESS";
export const UPDATE_SUBMISSION_FAILURE = "UPDATE_SUBMISSION_FAILURE";
export const HANDLE_INPUT = "HANDLE_INPUT";
export const HANDLE_INPUT_SPF = "HANDLE_INPUT_SPF";
export const CLEAR_FORM = "CLEAR_FORM";
export const SET_CAPE_OPTIONS = "SET_CAPE_OPTIONS";
export const VERIFY_REQUEST = "VERIFY_REQUEST";
export const VERIFY_SUCCESS = "VERIFY_SUCCESS";
export const VERIFY_FAILURE = "VERIFY_FAILURE";
export const LOAD_RECAPTCHA_REQUEST = "LOAD_RECAPTCHA_REQUEST";
export const LOAD_RECAPTCHA_SUCCESS = "LOAD_RECAPTCHA_SUCCESS";
export const LOAD_RECAPTCHA_FAILURE = "LOAD_RECAPTCHA_FAILURE";

export function handleInput({ target: { name, value } }) {
  return {
    type: HANDLE_INPUT,
    payload: { name, value }
  };
}

export function handleInputSPF({ target: { name, value } }) {
  return {
    type: HANDLE_INPUT_SPF,
    payload: { name, value }
  };
}


export function clearForm() {
  return {
    type: CLEAR_FORM
  };
}

export function setCAPEOptions({ monthlyOptions, oneTimeOptions }) {
  return {
    type: SET_CAPE_OPTIONS,
    payload: { monthlyOptions, oneTimeOptions }
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

export function saveSalesforceId(id) {
  return {
    type: SAVE_SALESFORCEID,
    payload: { salesforceId: id }
  };
}

export function saveSubmissionId(id) {
  return {
    type: SAVE_SUBMISSIONID,
    payload: { submissionId: id }
  };
}

export function verify(token) {
  console.log("this.props.apiSubmission.verify");
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
              console.log("apiSubmissionActions.js > 196");
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
      body: JSON.stringify({ token })
    }
  };
}

export function createCAPE(body) {
  console.log("createCAPE");
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/cape`,
      method: "POST",
      types: [
        CREATE_CAPE_REQUEST,
        CREATE_CAPE_SUCCESS,
        {
          type: CREATE_CAPE_FAILURE,
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

export function updateCAPE(id, body) {
  console.log("updateCAPE");
  console.log(id);
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/cape/${id}`,
      method: "PUT",
      types: [
        UPDATE_CAPE_REQUEST,
        UPDATE_CAPE_SUCCESS,
        {
          type: UPDATE_CAPE_FAILURE,
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
