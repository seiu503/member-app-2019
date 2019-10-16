import { RSAA } from "redux-api-middleware";
import BASE_URL from "./apiConfig.js";

/* =============================== CONTACTS ================================ */

/* +++++++++++++++++++++++++++++ CONTACTS: GET +++++++++++++++++++++++++++++ */

export const GET_SF_CONTACT_REQUEST = "GET_SF_CONTACT_REQUEST";
export const GET_SF_CONTACT_SUCCESS = "GET_SF_CONTACT_SUCCESS";
export const GET_SF_CONTACT_FAILURE = "GET_SF_CONTACT_FAILURE";

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

export const GET_SF_CONTACT_DID_REQUEST = "GET_SF_CONTACT_DID_REQUEST";
export const GET_SF_CONTACT_DID_SUCCESS = "GET_SF_CONTACT_DID_SUCCESS";
export const GET_SF_CONTACT_DID_FAILURE = "GET_SF_CONTACT_DID_FAILURE";

/*
 * Function: getSFContactByDoubleId -- get a SF Contact by contactId & accountId
 * @param {string} cId = Salesforce Contact Id
 * @param {string} aId = Salesforce Account Id
 * This action dispatches additional actions as it executes:
 *   GET_SF_CONTACT_DID_REQUEST:
 *     Initiates a spinner on the home page.
 *   GET_SF_CONTACT_DID_SUCCESS:
 *     If Content successfully retrieved, hides spinner
 *   GET_SF_CONTACT_DID_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function getSFContactByDoubleId(cId, aId) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/sfdid/${cId}/${aId}`,
      method: "GET",
      types: [
        GET_SF_CONTACT_DID_REQUEST,
        GET_SF_CONTACT_DID_SUCCESS,
        {
          type: GET_SF_CONTACT_DID_FAILURE,
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

/* +++++++++++++++++++++++++++++ CONTACTS: POST ++++++++++++++++++++++++++++ */

export const CREATE_SF_CONTACT_REQUEST = "CREATE_SF_CONTACT_REQUEST";
export const CREATE_SF_CONTACT_SUCCESS = "CREATE_SF_CONTACT_SUCCESS";
export const CREATE_SF_CONTACT_FAILURE = "CREATE_SF_CONTACT_FAILURE";

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
  // console.log(body);
  // console.log(JSON.stringify(body));
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/sf`,
      method: "POST",
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

/* +++++++++++++++++++++++++++++ CONTACTS: PUT ++++++++++++++++++++++++++++ */

export const UPDATE_SF_CONTACT_REQUEST = "UPDATE_SF_CONTACT_REQUEST";
export const UPDATE_SF_CONTACT_SUCCESS = "UPDATE_SF_CONTACT_SUCCESS";
export const UPDATE_SF_CONTACT_FAILURE = "UPDATE_SF_CONTACT_FAILURE";

/*
 * Function: updateSFContact -- update a SF Contact
 * @param {object} body
 * This action dispatches additional actions as it executes:
 *   UPDATE_SF_CONTACT_REQUEST:
 *     Initiates a spinner on the home page.
 *   UPDATE_SF_CONTACT_SUCCESS:
 *     If Content successfully retrieved, hides spinner
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

/* +++++++++++++++++++++++++++++ CONTACTS: LOOKUP ++++++++++++++++++++++++++ */

export const LOOKUP_SF_CONTACT_REQUEST = "LOOKUP_SF_CONTACT_REQUEST";
export const LOOKUP_SF_CONTACT_SUCCESS = "LOOKUP_SF_CONTACT_SUCCESS";
export const LOOKUP_SF_CONTACT_FAILURE = "LOOKUP_SF_CONTACT_FAILURE";

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

/* ======================== ONLINE MEMBER APPS (OMA) ======================= */

/* +++++++++++++++++++++++++++++++ OMA: POST +++++++++++++++++++++++++++++++ */

export const CREATE_SF_OMA_REQUEST = "CREATE_SF_OMA_REQUEST";
export const CREATE_SF_OMA_SUCCESS = "CREATE_SF_OMA_SUCCESS";
export const CREATE_SF_OMA_FAILURE = "CREATE_SF_OMA_FAILURE";

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
      method: "POST",
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

/* ======================== DIRECT JOIN RATEST (DJR) ======================= */

/* +++++++++++++++++++++++++++++++ DJR: POST +++++++++++++++++++++++++++++++ */

export const CREATE_SF_DJR_REQUEST = "CREATE_SF_DJR_REQUEST";
export const CREATE_SF_DJR_SUCCESS = "CREATE_SF_DJR_SUCCESS";
export const CREATE_SF_DJR_FAILURE = "CREATE_SF_DJR_FAILURE";

/*
 * Function: createSFDJR -- create a SF Direct Join Rate record
 * @param {object} body
 * This action dispatches additional actions as it executes:
 *   CREATE_SF_DJR_REQUEST:
 *     Initiates a spinner on the home page.
 *   CREATE_SF_DJR_SUCCESS:
 *     If Content successfully retrieved, hides spinner
 *   CREATE_SF_DJR_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function createSFDJR(body) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/sfDJR`,
      method: "POST",
      types: [
        CREATE_SF_DJR_REQUEST,
        CREATE_SF_DJR_SUCCESS,
        {
          type: CREATE_SF_DJR_FAILURE,
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

/* +++++++++++++++++++++++++++++ DJR: PUT ++++++++++++++++++++++++++++ */

export const UPDATE_SF_DJR_REQUEST = "UPDATE_SF_DJR_REQUEST";
export const UPDATE_SF_DJR_SUCCESS = "UPDATE_SF_DJR_SUCCESS";
export const UPDATE_SF_DJR_FAILURE = "UPDATE_SF_DJR_FAILURE";

/*
 * Function: updateSFDJR -- update a SF Direct Join Rate
 * @param {object} body
 * This action dispatches additional actions as it executes:
 *   UPDATE_SF_DJR_REQUEST:
 *     Initiates a spinner on the home page.
 *   UPDATE_SF_DJR_SUCCESS:
 *     If Content successfully retrieved, hides spinner
 *   UPDATE_SF_DJR_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function updateSFDJR(id, body) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/sfDJR/${id}`,
      method: "PUT",
      types: [
        UPDATE_SF_DJR_REQUEST,
        UPDATE_SF_DJR_SUCCESS,
        {
          type: UPDATE_SF_DJR_FAILURE,
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

/* +++++++++++++++++++++++++++++ DJR: GET +++++++++++++++++++++++++++++ */

export const GET_SF_DJR_REQUEST = "GET_SF_DJR_REQUEST";
export const GET_SF_DJR_SUCCESS = "GET_SF_DJR_SUCCESS";
export const GET_SF_DJR_FAILURE = "GET_SF_DJR_FAILURE";

/*
 * Function: getSFDJRById -- get a single SF DJR by id
 * @param {string} id
 * This action dispatches additional actions as it executes:
 *   GET_SF_DJR_REQUEST:
 *     Initiates a spinner on the home page.
 *   GET_SF_DJR_SUCCESS:
 *     If Content successfully retrieved, hides spinner
 *   GET_SF_DJR_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function getSFDJRById(id) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/sfDJR/${id}`,
      method: "GET",
      types: [
        GET_SF_DJR_REQUEST,
        GET_SF_DJR_SUCCESS,
        {
          type: GET_SF_DJR_FAILURE,
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

/* ================================== CAPE ================================= */

/* ++++++++++++++++++++++++++++++++ CAPE: POST +++++++++++++++++++++++++++++ */

export const CREATE_SF_CAPE_REQUEST = "CREATE_SF_CAPE_REQUEST";
export const CREATE_SF_CAPE_SUCCESS = "CREATE_SF_CAPE_SUCCESS";
export const CREATE_SF_CAPE_FAILURE = "CREATE_SF_CAPE_FAILURE";

/*
 * Function: createSFCAPE -- create a SF CAPE record
 * @param {object} body
 * This action dispatches additional actions as it executes:
 *   CREATE_SF_CAPE_REQUEST:
 *     Initiates a spinner on the home page.
 *   CREATE_SF_CAPE_SUCCESS:
 *     If Content successfully retrieved, hides spinner
 *   CREATE_SF_CAPE_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function createSFCAPE(body) {
  // console.log(body);
  // console.log(JSON.stringify(body));
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/sfCAPE`,
      method: "POST",
      types: [
        CREATE_SF_CAPE_REQUEST,
        CREATE_SF_CAPE_SUCCESS,
        {
          type: CREATE_SF_CAPE_FAILURE,
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

/* ++++++++++++++++++++++++++++++++ CAPE: POST +++++++++++++++++++++++++++++ */

export const UPDATE_SF_CAPE_REQUEST = "UPDATE_SF_CAPE_REQUEST";
export const UPDATE_SF_CAPE_SUCCESS = "UPDATE_SF_CAPE_SUCCESS";
export const UPDATE_SF_CAPE_FAILURE = "UPDATE_SF_CAPE_FAILURE";

/*
 * Function: updateSFCAPE -- update a SF CAPE record, either by record Id or by one-time payment Id
 * @param {object} body
 *        (body must include both id and updates --
 *        id not passed separately for this controller)
 * This action dispatches additional actions as it executes:
 *   UPDATE_SF_CAPE_REQUEST:
 *     Initiates a spinner on the home page.
 *   UPDATE_SF_CAPE_SUCCESS:
 *     If Content successfully retrieved, hides spinner
 *   UPDATE_SF_CAPE_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function updateSFCAPE(body) {
  // console.log(body);
  // console.log(JSON.stringify(body));
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/sfCAPE`,
      method: "PUT",
      types: [
        UPDATE_SF_CAPE_REQUEST,
        UPDATE_SF_CAPE_SUCCESS,
        {
          type: UPDATE_SF_CAPE_FAILURE,
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

/* ================================ ACCOUNTS =============================== */

/* +++++++++++++++++++++++++++++ ACCOUNTS: GET +++++++++++++++++++++++++++++ */

export const GET_SF_EMPLOYERS_REQUEST = "GET_SF_EMPLOYERS_REQUEST";
export const GET_SF_EMPLOYERS_SUCCESS = "GET_SF_EMPLOYERS_SUCCESS";
export const GET_SF_EMPLOYERS_FAILURE = "GET_SF_EMPLOYERS_FAILURE";

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

/* ================================ UNIONISE =============================== */

/* +++++++++++++++++++++++++ GET UNIONISE AUTH TOKEN +++++++++++++++++++++++ */

export const GET_UNIONISE_TOKEN_REQUEST = "GET_UNIONISE_TOKEN_REQUEST";
export const GET_UNIONISE_TOKEN_SUCCESS = "GET_UNIONISE_TOKEN_SUCCESS";
export const GET_UNIONISE_TOKEN_FAILURE = "GET_UNIONISE_TOKEN_FAILURE";

/*
 * Function: getUnioniseToken -- get auth token
 * to access secured unioni.se routes
 *
 * This action dispatches additional actions as it executes:
 *   GET_UNIONISE_TOKEN_REQUEST:
 *     Initiates a spinner on the home page.
 *   GET_UNIONISE_TOKEN_SUCCESS:
 *     If token successfully retrieved, hides spinner
 *   GET_UNIONISE_TOKEN_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function getUnioniseToken() {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/unionise/gettoken`,
      method: "POST",
      types: [
        GET_UNIONISE_TOKEN_REQUEST,
        GET_UNIONISE_TOKEN_SUCCESS,
        {
          type: GET_UNIONISE_TOKEN_FAILURE,
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

/* ++++++++++++++++++++++++++++ NEW MEMBER: POST +++++++++++++++++++++++++++ */

export const GET_IFRAME_URL_REQUEST = "GET_IFRAME_URL_REQUEST";
export const GET_IFRAME_URL_SUCCESS = "GET_IFRAME_URL_SUCCESS";
export const GET_IFRAME_URL_FAILURE = "GET_IFRAME_URL_FAILURE";

/*
 * Function: getIframeURL -- create a unioni.se member record,
 *   which returns a card-adding iFrame URL for payment info collection
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

/* +++++++++++++++++++++++++ EXISTING MEMBER: POST +++++++++++++++++++++++++ */

export const GET_IFRAME_EXISTING_REQUEST = "GET_IFRAME_EXISTING_REQUEST";
export const GET_IFRAME_EXISTING_SUCCESS = "GET_IFRAME_EXISTING_SUCCESS";
export const GET_IFRAME_EXISTING_FAILURE = "GET_IFRAME_EXISTING_FAILURE";

/*
 * Function: getIframeExisting -- get a card-adding URL for an existing
 * unioni.se member record, lookup by memberShortId
 *
 * This action dispatches additional actions as it executes:
 *   GET_IFRAME_EXISTING_REQUEST:
 *     Initiates a spinner on the home page.
 *   GET_IFRAME_EXISTING_SUCCESS:
 *     If iFrame URL successfully retrieved, hides spinner
 *   GET_IFRAME_EXISTING_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function getIframeExisting(token, memberShortId) {
  const body = JSON.stringify({ memberShortId: memberShortId });
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/unionise/iframe`,
      // ^^ this is the staging endpoint
      // will need to be switched over to production later on
      method: "POST",
      types: [
        GET_IFRAME_EXISTING_REQUEST,
        GET_IFRAME_EXISTING_SUCCESS,
        {
          type: GET_IFRAME_EXISTING_FAILURE,
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
      body: body,
      headers: headers
    }
  };
}

/* ++++++++++++++++++++ ONE-TIME PAYMENT REQUEST: POST ++++++++++++++++++++ */

export const POST_ONE_TIME_PAYMENT_REQUEST = "POST_ONE_TIME_PAYMENT_REQUEST";
export const POST_ONE_TIME_PAYMENT_SUCCESS = "POST_ONE_TIME_PAYMENT_SUCCESS";
export const POST_ONE_TIME_PAYMENT_FAILURE = "POST_ONE_TIME_PAYMENT_FAILURE";

/*
 * Function: postOneTimePayment -- post a request to unioni.se to process a
 * one-time CAPE contribution
 *
 * This action dispatches additional actions as it executes:
 *   POST_ONE_TIME_PAYMENT_REQUEST:
 *     Initiates a spinner on the home page.
 *   POST_ONE_TIME_PAYMENT_SUCCESS:
 *     If payment id successfully retrieved, hides spinner
 *   POST_ONE_TIME_PAYMENT_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function postOneTimePayment(token, body) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
  console.log(headers);
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/unionise/oneTimePayment`,
      // ^^ this is the staging endpoint
      // will need to be switched over to production later on
      method: "POST",
      types: [
        POST_ONE_TIME_PAYMENT_REQUEST,
        POST_ONE_TIME_PAYMENT_SUCCESS,
        {
          type: POST_ONE_TIME_PAYMENT_FAILURE,
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
      body: JSON.stringify(body),
      headers: headers
    }
  };
}
