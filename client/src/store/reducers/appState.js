import update from "immutability-helper";

import { LOGOUT, SET_LOGGEDIN, SET_REDIRECT_URL } from "../actions";
import {
  VALIDATE_TOKEN_REQUEST,
  VALIDATE_TOKEN_SUCCESS,
  VALIDATE_TOKEN_FAILURE,
  GET_PROFILE_REQUEST,
  GET_PROFILE_SUCCESS,
  GET_PROFILE_FAILURE
} from "../actions/apiProfileActions";
import {
  GET_CONTENT_BY_ID_REQUEST,
  GET_CONTENT_BY_ID_SUCCESS,
  GET_CONTENT_BY_ID_FAILURE,
  ADD_CONTENT_REQUEST,
  ADD_CONTENT_SUCCESS,
  ADD_CONTENT_FAILURE,
  UPDATE_CONTENT_REQUEST,
  UPDATE_CONTENT_SUCCESS,
  UPDATE_CONTENT_FAILURE,
  UPLOAD_IMAGE_REQUEST,
  UPLOAD_IMAGE_SUCCESS,
  UPLOAD_IMAGE_FAILURE,
  DELETE_IMAGE_REQUEST,
  DELETE_IMAGE_SUCCESS,
  DELETE_IMAGE_FAILURE,
  DELETE_CONTENT_REQUEST,
  DELETE_CONTENT_SUCCESS,
  DELETE_CONTENT_FAILURE,
  GET_ALL_CONTENT_REQUEST,
  GET_ALL_CONTENT_SUCCESS,
  GET_ALL_CONTENT_FAILURE
} from "../actions/apiContentActions";
import {
  ADD_SUBMISSION_REQUEST,
  ADD_SUBMISSION_SUCCESS,
  ADD_SUBMISSION_FAILURE,
  UPDATE_SUBMISSION_REQUEST,
  UPDATE_SUBMISSION_SUCCESS,
  UPDATE_SUBMISSION_FAILURE
} from "../actions/apiSubmissionActions";
import {
  GET_SF_CONTACT_REQUEST,
  GET_SF_CONTACT_SUCCESS,
  GET_SF_CONTACT_FAILURE,
  GET_SF_EMPLOYERS_REQUEST,
  GET_SF_EMPLOYERS_SUCCESS,
  GET_SF_EMPLOYERS_FAILURE
} from "../actions/apiSFActions";

export const INITIAL_STATE = {
  loggedIn: false,
  authToken: "",
  loading: false,
  redirect: ""
};

function appState(state = INITIAL_STATE, action) {
  // let error;
  switch (action.type) {
    case LOGOUT:
      return INITIAL_STATE;

    case VALIDATE_TOKEN_SUCCESS:
      return update(state, {
        loggedIn: { $set: true },
        authToken: { $set: action.payload.token },
        loading: { $set: false }
      });

    case GET_PROFILE_SUCCESS:
      return update(state, {
        loading: { $set: false }
      });

    case VALIDATE_TOKEN_FAILURE:
      return update(state, {
        loggedIn: { $set: false },
        loading: { $set: false }
      });

    case SET_REDIRECT_URL:
      return update(state, { redirect: { $set: action.payload } });

    case SET_LOGGEDIN:
      return update(state, { loggedIn: { $set: true } });

    case GET_CONTENT_BY_ID_REQUEST:
    case ADD_CONTENT_REQUEST:
    case UPDATE_CONTENT_REQUEST:
    case UPLOAD_IMAGE_REQUEST:
    case DELETE_IMAGE_REQUEST:
    case DELETE_CONTENT_REQUEST:
    case GET_ALL_CONTENT_REQUEST:
    case VALIDATE_TOKEN_REQUEST:
    case GET_PROFILE_REQUEST:
    case ADD_SUBMISSION_REQUEST:
    case UPDATE_SUBMISSION_REQUEST:
    case GET_SF_CONTACT_REQUEST:
    case GET_SF_EMPLOYERS_REQUEST:
      return update(state, {
        loading: { $set: true }
      });

    case GET_CONTENT_BY_ID_SUCCESS:
    case GET_CONTENT_BY_ID_FAILURE:
    case ADD_CONTENT_SUCCESS:
    case ADD_CONTENT_FAILURE:
    case UPDATE_CONTENT_SUCCESS:
    case UPDATE_CONTENT_FAILURE:
    case UPLOAD_IMAGE_SUCCESS:
    case UPLOAD_IMAGE_FAILURE:
    case DELETE_IMAGE_SUCCESS:
    case DELETE_IMAGE_FAILURE:
    case DELETE_CONTENT_SUCCESS:
    case DELETE_CONTENT_FAILURE:
    case GET_ALL_CONTENT_SUCCESS:
    case GET_ALL_CONTENT_FAILURE:
    case GET_PROFILE_FAILURE:
    case ADD_SUBMISSION_SUCCESS:
    case ADD_SUBMISSION_FAILURE:
    case UPDATE_SUBMISSION_SUCCESS:
    case UPDATE_SUBMISSION_FAILURE:
    case GET_SF_CONTACT_SUCCESS:
    case GET_SF_CONTACT_FAILURE:
    case GET_SF_EMPLOYERS_SUCCESS:
    case GET_SF_EMPLOYERS_FAILURE:
      return update(state, {
        loading: { $set: false }
      });

    default:
      return state;
  }
}

export default appState;
