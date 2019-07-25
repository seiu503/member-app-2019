import { RSAA } from "redux-api-middleware";
import BASE_URL from "./apiConfig.js";

export const GET_SF_CONTACT_REQUEST = "GET_SF_CONTACT_REQUEST";
export const GET_SF_CONTACT_SUCCESS = "GET_SF_CONTACT_SUCCESS";
export const GET_SF_CONTACT_FAILURE = "GET_SF_CONTACT_FAILURE";
export const GET_SF_EMPLOYERS_REQUEST = "GET_SF_EMPLOYERS_REQUEST";
export const GET_SF_EMPLOYERS_SUCCESS = "GET_SF_EMPLOYERS_SUCCESS";
export const GET_SF_EMPLOYERS_FAILURE = "GET_SF_EMPLOYERS_FAILURE";
export const LOOKUP_SF_CONTACT_REQUEST = "LOOKUP_SF_CONTACT_REQUEST";
export const LOOKUP_SF_CONTACT_SUCCESS = "LOOKUP_SF_CONTACT_SUCCESS";
export const LOOKUP_SF_CONTACT_FAILURE = "LOOKUP_SF_CONTACT_FAILURE";

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
 * Function: getSFEmployers -- get all active SF Employers
 * This action dispatches additional actions as it executes:
 *   GET_SF_CONTACT_REQUEST:
 *     Initiates a spinner on the home page.
 *   GET_SF_CONTACT_SUCCESS:
 *     If Content successfully retrieved, hides spinner
 *   GET_SF_CONTACT_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function getSFEmployers() {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/sfaccts`,
      method: "GET",
      types: [
        GET_SF_EMPLOYERS_REQUEST,
        GET_SF_EMPLOYERS_SUCCESS,
        {
          type: GET_SF_EMPLOYERS_FAILURE,
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
 * Function: lookupSFContact -- lookup a SF contact (by id OR name/email)
 * @param {string} id
 * This action dispatches additional actions as it executes:
 *   LOOKUP_SF_CONTACT_REQUEST:
 *     Initiates a spinner on the home page.
 *   LOOKUP_SF_CONTACT_SUCCESS:
 *     If Content successfully retrieved, hides spinner
 *   LOOKUP_SF_CONTACT_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function lookupSFContact(body) {
  console.log(JSON.stringify(body));
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/sfcontact`,
      method: "GET",
      types: [
        LOOKUP_SF_CONTACT_REQUEST,
        LOOKUP_SF_CONTACT_SUCCESS,
        {
          type: LOOKUP_SF_CONTACT_FAILURE,
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
