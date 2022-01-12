/* istanbul ignore file */
import { RSAA } from "redux-api-middleware";
import FormData from "form-data";
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const HANDLE_INPUT = "HANDLE_INPUT";
export const HANDLE_DELETE_OPEN = "HANDLE_DELETE_OPEN";
export const HANDLE_DELETE_CLOSE = "HANDLE_DELETE_CLOSE";
export const CLEAR_FORM = "CLEAR_FORM";
export const SELECT_CONTENT = "SELECT_CONTENT";
export const UNSELECT_CONTENT = "UNSELECT_CONTENT";
export const GET_CONTENT_BY_ID_REQUEST = "GET_CONTENT_BY_ID_REQUEST";
export const GET_CONTENT_BY_ID_SUCCESS = "GET_CONTENT_BY_ID_SUCCESS";
export const GET_CONTENT_BY_ID_FAILURE = "GET_CONTENT_BY_ID_FAILURE";
export const ADD_CONTENT_REQUEST = "ADD_CONTENT_REQUEST";
export const ADD_CONTENT_SUCCESS = "ADD_CONTENT_SUCCESS";
export const ADD_CONTENT_FAILURE = "ADD_CONTENT_FAILURE";
export const GET_ALL_CONTENT_REQUEST = "GET_ALL_CONTENT_REQUEST";
export const GET_ALL_CONTENT_SUCCESS = "GET_ALL_CONTENT_SUCCESS";
export const GET_ALL_CONTENT_FAILURE = "GET_ALL_CONTENT_FAILURE";
export const DELETE_CONTENT_REQUEST = "DELETE_CONTENT_REQUEST";
export const DELETE_CONTENT_SUCCESS = "DELETE_CONTENT_SUCCESS";
export const DELETE_CONTENT_FAILURE = "DELETE_CONTENT_FAILURE";
export const DELETE_IMAGE_REQUEST = "DELETE_IMAGE_REQUEST";
export const DELETE_IMAGE_SUCCESS = "DELETE_IMAGE_SUCCESS";
export const DELETE_IMAGE_FAILURE = "DELETE_IMAGE_FAILURE";
export const UPDATE_CONTENT_REQUEST = "UPDATE_CONTENT_REQUEST";
export const UPDATE_CONTENT_SUCCESS = "UPDATE_CONTENT_SUCCESS";
export const UPDATE_CONTENT_FAILURE = "UPDATE_CONTENT_FAILURE";
export const UPLOAD_IMAGE_REQUEST = "UPLOAD_IMAGE_REQUEST";
export const UPLOAD_IMAGE_SUCCESS = "UPLOAD_IMAGE_SUCCESS";
export const UPLOAD_IMAGE_FAILURE = "UPLOAD_IMAGE_FAILURE";

export function handleInput({ target: { name, value } }) {
  return {
    type: HANDLE_INPUT,
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

export function selectContent(id, content_type) {
  return {
    type: SELECT_CONTENT,
    payload: { id, content_type }
  };
}

export function unselectContent(id, content_type) {
  return {
    type: UNSELECT_CONTENT,
    payload: { id, content_type }
  };
}

/*
 * Function: getContentById -- get a single Content item by id
 * @param {string} id
 * This action dispatches additional actions as it executes:
 *   GET_CONTENT_BY_ID_REQUEST:
 *     Initiates a spinner on the home page.
 *   GET_CONTENT_BY_ID_SUCCESS:
 *     If Content successfully retrieved, hides spinner
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
 * Function: getAllContent -- get all Content items in database
 * @param {string} id
 * This action dispatches additional actions as it executes:
 *   GET_ALL_CONTENT_REQUEST:
 *     Initiates a spinner on the home page.
 *   GET_ALL_CONTENT_SUCCESS:
 *     If Content successfully retrieved, hides spinner
 *   GET_ALL_CONTENT_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function getAllContent(token) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/content`,
      method: "GET",
      types: [
        GET_ALL_CONTENT_REQUEST,
        GET_ALL_CONTENT_SUCCESS,
        {
          type: GET_ALL_CONTENT_FAILURE,
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

/*
 * Function: addContent -- add new Content to db
 * @param {object} body (Content object)
 *  --  @param {string} contentType,
 *  --  @param {string} content
 * This action dispatches additional actions as it executes:
 *   ADD_CONTENT_REQUEST:
 *     Initiates a spinner on the home page.
 *   ADD_CONTENT_SUCCESS:
 *     If Content successfully added, hides spinner
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
 * Function: uploadImage -- uploads image file to Amazon S3 bucket and adds new content record with image URL to db
 * @param {file} image (image file)
 * @param {id} (optional content id if replacing existing image)
 * This action dispatches additional actions as it executes:
 *   UPLOAD_IMAGE_REQUEST:
 *     Initiates a spinner on the home page.
 *   UPLOAD_IMAGE_SUCCESS:
 *     If image successfully uploaded, hides spinner
 *   UPLOAD_IMAGE_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */

export function uploadImage(image, id) {
  // console.log("uploadImage", image);

  const data = new FormData();
  data.append("image", image, image.name);

  if (id) {
    data.append("id", id);
  }
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/image/single`,
      method: "POST",
      types: [
        UPLOAD_IMAGE_REQUEST,
        UPLOAD_IMAGE_SUCCESS,
        {
          type: UPLOAD_IMAGE_FAILURE,
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
      body: data
    }
  };
}

/*
 * Function: updateContent -- update existing Content
 * @param {string} id Content id
 * @param {object} body (Content object)
 *  --  @param {object} updates
 * This action dispatches additional actions as it executes:
 *   UDPATE_CONTENT_REQUEST:
 *     Initiates a spinner on the home page.
 *   UDPATE_CONTENT_SUCCESS:
 *     If Content successfully updated, hides spinner
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
 * Function: deleteContent -- delete Content from database
 * @param {string} id
 * This action dispatches additional actions as it executes:
 *   DELETE_CONTENT_REQUEST:
 *     Initiates a spinner on the home page.
 *   DELETE_CONTENT_SUCCESS:
 *     If Content successfully deleted, hides spinner
 *   DELETE_CONTENT_FAILURE:
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

/*
 * Function: deleteImage -- delete file from S3 bucket
 * @param {string} key (S3 object key)
 * This action dispatches additional actions as it executes:
 *   DELETE_IMAGE_REQUEST:
 *     Initiates a spinner on the home page.
 *   DELETE_IMAGE_SUCCESS:
 *     If Content successfully deleted, hides spinner
 *   DELETE_IMAGE_FAILURE:
 *     If database error, hides spinner, displays error toastr
 */
export function deleteImage(token, key) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/image/${key}`,
      method: "DELETE",
      types: [
        DELETE_IMAGE_REQUEST,
        DELETE_IMAGE_SUCCESS,
        {
          type: DELETE_IMAGE_FAILURE,
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
      headers: { Authorization: `Bearer ${token}` }
    }
  };
}
