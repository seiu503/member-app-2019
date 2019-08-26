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
export const CREATE_SF_CONTACT_REQUEST = "CREATE_SF_CONTACT_REQUEST";
export const CREATE_SF_CONTACT_SUCCESS = "CREATE_SF_CONTACT_SUCCESS";
export const CREATE_SF_CONTACT_FAILURE = "CREATE_SF_CONTACT_FAILURE";
export const CREATE_SF_OMA_REQUEST = "CREATE_SF_OMA_REQUEST";
export const CREATE_SF_OMA_SUCCESS = "CREATE_SF_OMA_SUCCESS";
export const CREATE_SF_OMA_FAILURE = "CREATE_SF_OMA_FAILURE";
export const GET_IFRAME_URL_REQUEST = "GET_IFRAME_URL_REQUEST";
export const GET_IFRAME_URL_SUCCESS = "GET_IFRAME_URL_SUCCESS";
export const GET_IFRAME_URL_FAILURE = "GET_IFRAME_URL_FAILURE";

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
      }
    }
  };
}

/*
 * Function: lookupSFContact -- lookup a SF contact (by id OR name/email)
 * @param {body}      Complete submission body
 * This action dispatches additional actions as it executes:
 *   LOOKUP_SF_CONTACT_REQUEST:
 *     Initiates a spinner on the home page.
 *   LOOKUP_SF_CONTACT_SUCCESS:
 *     If Content successfully retrieved, hides spinner
 *   LOOKUP_SF_CONTACT_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function lookupSFContact(body) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/sflookup`,
      method: "PUT",
      types: [
        LOOKUP_SF_CONTACT_REQUEST,
        LOOKUP_SF_CONTACT_SUCCESS,
        {
          type: LOOKUP_SF_CONTACT_FAILURE,
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

/*
 * Function: createSFContact -- create a SF Contact
 * @param {object} body
 * This action dispatches additional actions as it executes:
 *   CREATE_SF_CONTACT_REQUEST:
 *     Initiates a spinner on the home page.
 *   CREATE_SF_CONTACT_SUCCESS:
 *     If Content successfully retrieved, hides spinner
 *   CREATE_SF_CONTACT_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function createSFContact(body) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/sf`,
      method: "PUT",
      types: [
        CREATE_SF_CONTACT_REQUEST,
        CREATE_SF_CONTACT_SUCCESS,
        {
          type: CREATE_SF_CONTACT_FAILURE,
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

/*
 * Function: createSFOMA -- create a SF Online Member App record
 * @param {object} body
 * This action dispatches additional actions as it executes:
 *   CREATE_SF_OMA_REQUEST:
 *     Initiates a spinner on the home page.
 *   CREATE_SF_OMA_SUCCESS:
 *     If Content successfully retrieved, hides spinner
 *   CREATE_SF_OMA_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function createSFOMA(body) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/sfOMA`,
      method: "PUT",
      types: [
        CREATE_SF_OMA_REQUEST,
        CREATE_SF_OMA_SUCCESS,
        {
          type: CREATE_SF_OMA_FAILURE,
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

/*
 * Function: getIframeURL -- get an iFrame URL from unioni.se
 * for payment info collection
 * @param {body}
 * {
    "firstName": "Test",
    "lastName": "User",
    "address": {
        "addressLine1": "some address",
        "city": "Some City",
        "state": "AB",
        "zip": "123123"
    },
    "email": "test@example.com",
    "language": "en-US",
    "cellPhone": "123123",
    "birthDate": "1990-10-20",
    "employerExternalId": "SW001",
    "employeeExternalId": "1234567",
  }
 *
 * This action dispatches additional actions as it executes:
 *   GET_IFRAME_URL_REQUEST:
 *     Initiates a spinner on the home page.
 *   GET_IFRAME_URL_SUCCESS:
 *     If iFrame URL successfully retrieved, hides spinner
 *   GET_IFRAME_URL_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function getIframeURL(body) {
  return {
    [RSAA]: {
      endpoint: "https://lab.unioni.se/web/signup/create-member",
      // ^^ this is the staging endpoint
      // will need to be switched over to production later on
      method: "POST",
      types: [
        GET_IFRAME_URL_REQUEST,
        GET_IFRAME_URL_SUCCESS,
        {
          type: GET_IFRAME_URL_FAILURE,
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
