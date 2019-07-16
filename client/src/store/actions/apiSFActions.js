import { RSAA } from "redux-api-middleware";
import BASE_URL from "./apiConfig.js";

export const GET_SF_CONTACT_REQUEST = "GET_SF_CONTACT_REQUEST";
export const GET_SF_CONTACT_SUCCESS = "GET_SF_CONTACT_SUCCESS";
export const GET_SF_CONTACT_FAILURE = "GET_SF_CONTACT_FAILURE";
export const UPDATE_SF_CONTACT_REQUEST = "UPDATE_SF_CONTACT_REQUEST";
export const UPDATE_SF_CONTACT_SUCCESS = "UPDATE_SF_CONTACT_SUCCESS";
export const UPDATE_SF_CONTACT_FAILURE = "UPDATE_SF_CONTACT_FAILURE";

/*
 * Function: getSFContactById -- get a single SF Contact by id
 * @param {string} id
 * This action dispatches additional actions as it executes:
 *   GET_SF_CONTACT_REQUEST:
 *     Initiates a spinner on the home page.
 *   GET_SF_CONTACT_SUCCESS:
 *     If Content successfully retrieved, hides spinner
 *   GET_SF_CONTACT_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function getSFContactById(id) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/sf/${id}`,
      method: "GET",
      types: [
        GET_SF_CONTACT_REQUEST,
        GET_SF_CONTACT_SUCCESS,
        {
          type: GET_SF_CONTACT_FAILURE,
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
      }
    }
  };
}

/*
 * Function: updateSFContact -- update existing SF Contact with data from form submission
 * @param {string} id Contact id
 * @param {object} body (Contact fields from submission object)
 *  --  @param {object} updates
 * This action dispatches additional actions as it executes:
 *   UPDATE_SF_CONTACT_REQUEST:
 *     Initiates a spinner on the home page.
 *   UPDATE_SF_CONTACT_SUCCESS:
 *     If Contactt successfully updated, hides spinner
 *   UPDATE_SF_CONTACT_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function updateSFContact(id, body) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/sf/${id}`,
      method: "PUT",
      types: [
        UPDATE_SF_CONTACT_REQUEST,
        UPDATE_SF_CONTACT_SUCCESS,
        {
          type: UPDATE_SF_CONTACT_FAILURE,
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
