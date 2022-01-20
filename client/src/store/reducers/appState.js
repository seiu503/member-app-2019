import update from "immutability-helper";

import {
  LOGOUT,
  SET_LOGGEDIN,
  SET_REDIRECT_URL,
  SET_SPINNER
} from "../actions";
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
  UPDATE_SUBMISSION_FAILURE,
  CREATE_CAPE_REQUEST,
  CREATE_CAPE_SUCCESS,
  CREATE_CAPE_FAILURE,
  UPDATE_CAPE_REQUEST,
  UPDATE_CAPE_SUCCESS,
  UPDATE_CAPE_FAILURE,
  GET_CAPE_BY_SFID_REQUEST,
  GET_CAPE_BY_SFID_SUCCESS,
  GET_CAPE_BY_SFID_FAILURE,
  GET_ALL_SUBMISSIONS_REQUEST,
  GET_ALL_SUBMISSIONS_SUCCESS,
  GET_ALL_SUBMISSIONS_FAILURE,
  VERIFY_REQUEST,
  VERIFY_SUCCESS,
  VERIFY_FAILURE
} from "../actions/apiSubmissionActions";
import {
  GET_SF_CONTACT_REQUEST,
  GET_SF_CONTACT_SUCCESS,
  GET_SF_CONTACT_FAILURE,
  GET_SF_CONTACT_DID_REQUEST,
  GET_SF_CONTACT_DID_SUCCESS,
  GET_SF_CONTACT_DID_FAILURE,
  GET_SF_EMPLOYERS_REQUEST,
  GET_SF_EMPLOYERS_SUCCESS,
  GET_SF_EMPLOYERS_FAILURE,
  LOOKUP_SF_CONTACT_REQUEST,
  LOOKUP_SF_CONTACT_SUCCESS,
  LOOKUP_SF_CONTACT_FAILURE,
  CREATE_SF_CONTACT_SUCCESS,
  CREATE_SF_CONTACT_REQUEST,
  CREATE_SF_CONTACT_FAILURE,
  CREATE_SF_OMA_REQUEST,
  CREATE_SF_OMA_SUCCESS,
  CREATE_SF_OMA_FAILURE,
  UPDATE_SF_CONTACT_SUCCESS,
  UPDATE_SF_CONTACT_REQUEST,
  UPDATE_SF_CONTACT_FAILURE,
  CREATE_SF_CAPE_REQUEST,
  CREATE_SF_CAPE_SUCCESS,
  CREATE_SF_CAPE_FAILURE
} from "../actions/apiSFActions";
import {
  GET_USER_BY_EMAIL_REQUEST,
  GET_USER_BY_EMAIL_SUCCESS,
  GET_USER_BY_EMAIL_FAILURE,
  ADD_USER_REQUEST,
  ADD_USER_SUCCESS,
  ADD_USER_FAILURE,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILURE,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAILURE
} from "../actions/apiUserActions";

// CREATE_CAPE_SUCCESS, UPDATE_SUBMISSION_SUCCESS
// intentionally omitted because they are being called in a
// long Promise.all chain

export const INITIAL_STATE = {
  loggedIn: false,
  authToken: "",
  loading: false,
  redirect: "",
  userType: ""
};

function appState(state = INITIAL_STATE, action) {
  // let error;
  switch (action.type) {
    case LOGOUT:
      return INITIAL_STATE;

    case SET_SPINNER: {
      return update(state, {
        loading: { $set: true }
      });
    }

    case GET_PROFILE_SUCCESS:
      // console.log("GET_PROFILE_SUCCESS");
      // console.log(action.payload);
      return update(state, {
        loggedIn: { $set: true },
        loading: { $set: false },
        userType: { $set: action.payload.type }
      });

    case VALIDATE_TOKEN_SUCCESS:
      // console.log("VALIDATE_TOKEN_SUCCESS");
      // console.log(action.payload);
      return update(state, {
        loggedIn: { $set: true },
        authToken: { $set: action.payload.token },
        loading: { $set: false },
        userType: { $set: action.payload.user_type }
      });

    case VALIDATE_TOKEN_FAILURE:
      return update(state, {
        loggedIn: { $set: false },
        loading: { $set: false }
      });

    case SET_REDIRECT_URL:
      return update(state, { redirect: { $set: action.payload } });

    case SET_LOGGEDIN:
      // console.log("SET_LOGGEDIN");
      // console.log(action.payload);
      return update(state, {
        loggedIn: { $set: true },
        userType: { $set: action.payload }
      });

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
    case LOOKUP_SF_CONTACT_REQUEST:
    case CREATE_SF_CONTACT_REQUEST:
    case CREATE_SF_OMA_REQUEST:
    case UPDATE_SF_CONTACT_REQUEST:
    case VERIFY_REQUEST:
    case GET_ALL_SUBMISSIONS_REQUEST:
    case CREATE_CAPE_REQUEST:
    case CREATE_SF_CAPE_REQUEST:
    case GET_USER_BY_EMAIL_REQUEST:
    case ADD_USER_REQUEST:
    case UPDATE_USER_REQUEST:
    case DELETE_USER_REQUEST:
    case GET_CAPE_BY_SFID_REQUEST:
    case UPDATE_CAPE_REQUEST:
    case GET_SF_CONTACT_DID_REQUEST:
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
    case LOOKUP_SF_CONTACT_SUCCESS:
    case LOOKUP_SF_CONTACT_FAILURE:
    case CREATE_SF_CONTACT_SUCCESS:
    case CREATE_SF_CONTACT_FAILURE:
    case CREATE_SF_OMA_SUCCESS:
    case CREATE_SF_OMA_FAILURE:
    case UPDATE_SF_CONTACT_SUCCESS:
    case UPDATE_SF_CONTACT_FAILURE:
    case VERIFY_SUCCESS:
    case VERIFY_FAILURE:
    case GET_ALL_SUBMISSIONS_SUCCESS:
    case GET_ALL_SUBMISSIONS_FAILURE:
    case CREATE_CAPE_FAILURE:
    case CREATE_CAPE_SUCCESS:
    case CREATE_SF_CAPE_SUCCESS:
    case CREATE_SF_CAPE_FAILURE:
    case GET_USER_BY_EMAIL_SUCCESS:
    case GET_USER_BY_EMAIL_FAILURE:
    case ADD_USER_SUCCESS:
    case UPDATE_USER_SUCCESS:
    case DELETE_USER_SUCCESS:
    case ADD_USER_FAILURE:
    case UPDATE_USER_FAILURE:
    case DELETE_USER_FAILURE:
    case GET_CAPE_BY_SFID_SUCCESS:
    case GET_CAPE_BY_SFID_FAILURE:
    case UPDATE_CAPE_SUCCESS:
    case UPDATE_CAPE_FAILURE:
    case GET_SF_CONTACT_DID_SUCCESS:
    case GET_SF_CONTACT_DID_FAILURE:
      return update(state, {
        loading: { $set: false }
      });

    default:
      return state;
  }
}

export default appState;
