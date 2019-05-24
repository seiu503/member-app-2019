import { RSAA } from "redux-api-middleware";
import BASE_URL from "./apiConfig.js";

export const GET_CONTENT_BY_ID_REQUEST = "GET_CONTENT_BY_ID_REQUEST";
export const GET_CONTENT_BY_ID_SUCCESS = "GET_CONTENT_BY_ID_SUCCESS";
export const GET_CONTENT_BY_ID_FAILURE = "GET_CONTENT_BY_ID_FAILURE";
export const ADD_CONTENT_REQUEST = "ADD_CONTENT_REQUEST";
export const ADD_CONTENT_SUCCESS = "ADD_CONTENT_SUCCESS";
export const ADD_CONTENT_FAILURE = "ADD_CONTENT_FAILURE";
export const DELETE_CONTENT_REQUEST = "DELETE_CONTENT_REQUEST";
export const DELETE_CONTENT_SUCCESS = "DELETE_CONTENT_SUCCESS";
export const DELETE_CONTENT_FAILURE = "DELETE_CONTENT_FAILURE";
export const UPDATE_CONTENT_REQUEST = "UPDATE_CONTENT_REQUEST";
export const UPDATE_CONTENT_SUCCESS = "UPDATE_CONTENT_SUCCESS";
export const UPDATE_CONTENT_FAILURE = "UPDATE_CONTENT_FAILURE";
export const HANDLE_INPUT = "HANDLE_INPUT";
export const HANDLE_SWITCH = "HANDLE_SWITCH";
export const HANDLE_DELETE_OPEN = "HANDLE_DELETE_OPEN";
export const HANDLE_DELETE_CLOSE = "HANDLE_DELETE_CLOSE";
export const CLEAR_FORM = "CLEAR_FORM";
export const SET_EDIT_CONTENT = "SET_EDIT_CONTENT";

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

export function handleDeleteOpen(selectedContent) {
  return {
    type: HANDLE_DELETE_OPEN,
    payload: { selectedContent }
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

export function setEditContent(content) {
  return {
    type: SET_EDIT_CONTENT,
    payload: content
  };
}

/*
 * Function: getContentById -- get a single content by id
 * @param {string} id
 * This action dispatches additional actions as it executes:
 *   GET_CONTENT_BY_ID_REQUEST:
 *     Initiates a spinner on the home page.
 *   GET_CONTENT_BY_ID_SUCCESS:
 *     If content successfully retrieved, hides spinner
 *   GET_CONTENT_BY_ID_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function getContentById(id) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/content/${id}`,
      method: "GET",
      types: [
        GET_CONTENT_BY_ID_REQUEST,
        GET_CONTENT_BY_ID_SUCCESS,
        {
          type: GET_CONTENT_BY_ID_FAILURE,
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
 * Function: addContent -- add new content to db
 * @param {object} body (content object)
 *  --  @param {string} headline,
 *  --  @param {string} bodyCopy,
 *  --  @param {string} imageUrl
 * This action dispatches additional actions as it executes:
 *   ADD_CONTENT_REQUEST:
 *     Initiates a spinner on the home page.
 *   ADD_CONTENT_SUCCESS:
 *     If content successfully retrieved, hides spinner
 *   ADD_CONTENT_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function addContent(token, body) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/content/`,
      method: "POST",
      types: [
        ADD_CONTENT_REQUEST,
        ADD_CONTENT_SUCCESS,
        {
          type: ADD_CONTENT_FAILURE,
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
 * Function: updateContent -- update existing content
 * @param {string} id content id
 * @param {object} body (content object)
 *  --  @param {object} updates
 *  --  -- @param {string} headline,
 *  --  -- @param {string} bodyCopy,
 *  --  -- @param {string} imageUrl
 * This action dispatches additional actions as it executes:
 *   UDPATE_CONTENT_REQUEST:
 *     Initiates a spinner on the home page.
 *   UDPATE_CONTENT_SUCCESS:
 *     If content successfully updated, hides spinner
 *   UDPATE_CONTENT_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function updateContent(token, id, body) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/content/${id}`,
      method: "PUT",
      types: [
        UPDATE_CONTENT_REQUEST,
        UPDATE_CONTENT_SUCCESS,
        {
          type: UPDATE_CONTENT_FAILURE,
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
 * Function: removeContent -- remove content from database
 * @param {string} id
 * This action dispatches additional actions as it executes:
 *   REMOVE_CONTENT_REQUEST:
 *     Initiates a spinner on the home page.
 *   REMOVE_CONTENT_SUCCESS:
 *     If content successfully removed, hides spinner
 *   REMOVE_CONTENT_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function deleteContent(token, id) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/content/${id}`,
      method: "DELETE",
      types: [
        DELETE_CONTENT_REQUEST,
        DELETE_CONTENT_SUCCESS,
        {
          type: DELETE_CONTENT_FAILURE,
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
