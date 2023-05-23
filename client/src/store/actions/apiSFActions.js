import { RSAA } from "redux-api-middleware";
const BASE_URL = process.env.REACT_APP_BASE_URL;
console.log(BASE_URL);

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
  // console.log(body);
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
  // console.log(`getSFEmployers`);
  // console.log(`${BASE_URL}/api/sfaccts`);
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/sfaccts`,
      method: "GET",
      types: [
        GET_SF_EMPLOYERS_REQUEST,
        {
          type: GET_SF_EMPLOYERS_SUCCESS,
          payload: (action, state, res) => {
            const contentType = res.headers.get("Content-Type");
            // console.log(contentType);
            if (contentType && ~contentType.indexOf("json")) {
              // console.log("604");
              return res.json().then(data => {
                // console.log(data);
                return data;
              });
            } else {
              // console.log("612");
              return res.text().then(data => {
                console.log(data);
                return data;
              });
            }
          }
        },
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
