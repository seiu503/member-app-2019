import { RSAA } from "redux-api-middleware";
import BASE_URL from "./apiConfig.js";
// import FormData from "form-data";

export const HANDLE_INPUT = "HANDLE_INPUT";
export const CLEAR_FORM = "CLEAR_FORM";
export const HANDLE_DELETE_OPEN = "HANDLE_DELETE_OPEN";
export const HANDLE_DELETE_CLOSE = "HANDLE_DELETE_CLOSE";
export const GET_USER_BY_EMAIL_REQUEST = "GET_USER_BY_EMAIL_REQUEST";
export const GET_USER_BY_EMAIL_SUCCESS = "GET_USER_BY_EMAIL_SUCCESS";
export const GET_USER_BY_EMAIL_FAILURE = "GET_USER_BY_EMAIL_FAILURE";
export const ADD_USER_REQUEST = "ADD_USER_REQUEST";
export const ADD_USER_SUCCESS = "ADD_USER_SUCCESS";
export const ADD_USER_FAILURE = "ADD_USER_FAILURE";
export const DELETE_USER_REQUEST = "DELETE_USER_REQUEST";
export const DELETE_USER_SUCCESS = "DELETE_USER_SUCCESS";
export const DELETE_USER_FAILURE = "DELETE_USER_FAILURE";
export const UPDATE_USER_REQUEST = "UPDATE_USER_REQUEST";
export const UPDATE_USER_SUCCESS = "UPDATE_USER_SUCCESS";
export const UPDATE_USER_FAILURE = "UPDATE_USER_FAILURE";

export function handleInput({ target: { name, value } }) {
  return {
    type: HANDLE_INPUT,
    payload: { name, value }
  };
}
export function clearForm() {
  return {
    type: CLEAR_FORM
  };
}

export function handleDeleteOpen(user) {
  return {
    type: HANDLE_DELETE_OPEN,
    payload: { user }
  };
}

export function handleDeleteClose() {
  return {
    type: HANDLE_DELETE_CLOSE
  };
}

/*
 * Function: getUserByEmail -- get a single User item by email
 * @param {string} email
 * This action dispatches additional actions as it executes:
 *   GET_USER_BY_EMAIL_REQUEST:
 *     Initiates a spinner on the home page.
 *   GET_USER_BY_EMAIL_SUCCESS:
 *     If User successfully retrieved, hides spinner
 *   GET_USER_BY_EMAIL_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function getUserByEmail(email, requestingUserType) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/user/email/${email}/${requestingUserType}`,
      method: "GET",
      types: [
        GET_USER_BY_EMAIL_REQUEST,
        GET_USER_BY_EMAIL_SUCCESS,
        {
          type: GET_USER_BY_EMAIL_FAILURE,
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
      ]
    }
  };
}

/*
 * Function: addUser -- add new User to db
 * @param {object} body (User object)
 *  --  @param {string} userType,
 *  --  @param {string} user
 * This action dispatches additional actions as it executes:
 *   ADD_USER_REQUEST:
 *     Initiates a spinner on the home page.
 *   ADD_USER_SUCCESS:
 *     If User successfully added, hides spinner
 *   ADD_USER_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function addUser(token, body) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/user/`,
      method: "POST",
      types: [
        ADD_USER_REQUEST,
        ADD_USER_SUCCESS,
        {
          type: ADD_USER_FAILURE,
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
      },
      body: JSON.stringify(body)
    }
  };
}

/*
 * Function: updateUser -- update existing User
 * @param {string} id User id
 * @param {object} body (User object)
 *  --  @param {object} updates
 * This action dispatches additional actions as it executes:
 *   UDPATE_USER_REQUEST:
 *     Initiates a spinner on the home page.
 *   UDPATE_USER_SUCCESS:
 *     If User successfully updated, hides spinner
 *   UDPATE_USER_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function updateUser(token, id, body) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/user/${id}`,
      method: "PUT",
      types: [
        UPDATE_USER_REQUEST,
        UPDATE_USER_SUCCESS,
        {
          type: UPDATE_USER_FAILURE,
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
      },
      body: JSON.stringify(body)
    }
  };
}

/*
 * Function: deleteUser -- delete User from database
 * @param {string} id
 * This action dispatches additional actions as it executes:
 *   DELETE_USER_REQUEST:
 *     Initiates a spinner on the home page.
 *   DELETE_USER_SUCCESS:
 *     If User successfully deleted, hides spinner
 *   DELETE_USER_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function deleteUser(token, id, requestingUserType) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/user/${id}/${requestingUserType}`,
      method: "DELETE",
      types: [
        DELETE_USER_REQUEST,
        DELETE_USER_SUCCESS,
        {
          type: DELETE_USER_FAILURE,
          payload: (action, state, res) => {
            return res.json().then(data => {
              console.log(data);
              let message = "Sorry, something went wrong :(";
              if (data && data.message) {
                message = data.message;
              }
              return { message };
            });
          }
        }
      ],
      headers: { Authorization: `Bearer ${token}` }
    }
  };
}
