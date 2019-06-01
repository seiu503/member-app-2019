import { RSAA } from "redux-api-middleware";
import BASE_URL from "./apiConfig.js";

export const GET_FORM_META_BY_ID_REQUEST = "GET_FORM_META_BY_ID_REQUEST";
export const GET_FORM_META_BY_ID_SUCCESS = "GET_FORM_META_BY_ID_SUCCESS";
export const GET_FORM_META_BY_ID_FAILURE = "GET_FORM_META_BY_ID_FAILURE";
export const ADD_FORM_META_REQUEST = "ADD_FORM_META_REQUEST";
export const ADD_FORM_META_SUCCESS = "ADD_FORM_META_SUCCESS";
export const ADD_FORM_META_FAILURE = "ADD_FORM_META_FAILURE";
export const DELETE_FORM_META_REQUEST = "DELETE_FORM_META_REQUEST";
export const DELETE_FORM_META_SUCCESS = "DELETE_FORM_META_SUCCESS";
export const DELETE_FORM_META_FAILURE = "DELETE_FORM_META_FAILURE";
export const UPDATE_FORM_META_REQUEST = "UPDATE_FORM_META_REQUEST";
export const UPDATE_FORM_META_SUCCESS = "UPDATE_FORM_META_SUCCESS";
export const UPDATE_FORM_META_FAILURE = "UPDATE_FORM_META_FAILURE";
export const HANDLE_INPUT = "HANDLE_INPUT";
export const HANDLE_SWITCH = "HANDLE_SWITCH";
export const HANDLE_DELETE_OPEN = "HANDLE_DELETE_OPEN";
export const HANDLE_DELETE_CLOSE = "HANDLE_DELETE_CLOSE";
export const CLEAR_FORM = "CLEAR_FORM";
export const SET_EDIT_FORM_META = "SET_EDIT_FORM_META";

export function handleInput({ target: { name, value } }) {
  return {
    type: HANDLE_INPUT,
    payload: { name, value }
  };
}

export function handleSwitch(name, value) {
  return {
    type: HANDLE_SWITCH,
    payload: { name, value }
  };
}

export function handleDeleteOpen(selectedFormMeta) {
  return {
    type: HANDLE_DELETE_OPEN,
    payload: { selectedFormMeta }
  };
}

export function handleDeleteClose() {
  return {
    type: HANDLE_DELETE_CLOSE
  };
}

export function clearForm() {
  return {
    type: CLEAR_FORM
  };
}

export function setEditFormMeta(formMeta) {
  return {
    type: SET_EDIT_FORM_META,
    payload: formMeta
  };
}

/*
 * Function: getFormMetaById -- get a single formMeta by id
 * @param {string} id
 * This action dispatches additional actions as it executes:
 *   GET_FORM_META_BY_ID_REQUEST:
 *     Initiates a spinner on the home page.
 *   GET_FORM_META_BY_ID_SUCCESS:
 *     If formMeta successfully retrieved, hides spinner
 *   GET_FORM_META_BY_ID_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function getFormMetaById(id) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/form-meta/${id}`,
      method: "GET",
      types: [
        GET_FORM_META_BY_ID_REQUEST,
        GET_FORM_META_BY_ID_SUCCESS,
        {
          type: GET_FORM_META_BY_ID_FAILURE,
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
      ]
    }
  };
}

/*
 * Function: addFormMeta -- add new formMeta to db
 * @param {object} body (formMeta object)
 *  --  @param {string} formMetaType,
 *  --  @param {string} content
 * This action dispatches additional actions as it executes:
 *   ADD_FORM_META_REQUEST:
 *     Initiates a spinner on the home page.
 *   ADD_FORM_META_SUCCESS:
 *     If formMeta successfully retrieved, hides spinner
 *   ADD_FORM_META_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function addFormMeta(token, body) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/form-meta/`,
      method: "POST",
      types: [
        ADD_FORM_META_REQUEST,
        ADD_FORM_META_SUCCESS,
        {
          type: ADD_FORM_META_FAILURE,
          payload: (action, state, res) => {
            return res.json().then(data => {
              let message = "Sorry, something went wrong :(";
              if (data) {
                if (data.message) {
                  message = data.message;
                }
                console.log(message);
                return { message };
              } else {
                return { message };
              }
            });
          }
        }
      ],
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  };
}

/*
 * Function: updateFormMeta -- update existing formMeta
 * @param {string} id formMeta id
 * @param {object} body (formMeta object)
 *  --  @param {object} updates
 * This action dispatches additional actions as it executes:
 *   UDPATE_FORM_META_REQUEST:
 *     Initiates a spinner on the home page.
 *   UDPATE_FORM_META_SUCCESS:
 *     If formMeta successfully updated, hides spinner
 *   UDPATE_FORM_META_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function updateFormMeta(token, id, body) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/form-meta/${id}`,
      method: "PUT",
      types: [
        UPDATE_FORM_META_REQUEST,
        UPDATE_FORM_META_SUCCESS,
        {
          type: UPDATE_FORM_META_FAILURE,
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
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  };
}

/*
 * Function: removeFormMeta -- remove formMeta from database
 * @param {string} id
 * This action dispatches additional actions as it executes:
 *   REMOVE_FORM_META_REQUEST:
 *     Initiates a spinner on the home page.
 *   REMOVE_FORM_META_SUCCESS:
 *     If formMeta successfully removed, hides spinner
 *   REMOVE_FORM_META_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function deleteFormMeta(token, id) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/form-meta/${id}`,
      method: "DELETE",
      types: [
        DELETE_FORM_META_REQUEST,
        DELETE_FORM_META_SUCCESS,
        {
          type: DELETE_FORM_META_FAILURE,
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
      headers: { Authorization: `Bearer ${token}` }
    }
  };
}
