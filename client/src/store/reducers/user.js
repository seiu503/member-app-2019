import update from "immutability-helper";

import { LOGOUT } from "../actions";
import {
  GET_USER_BY_EMAIL_REQUEST,
  GET_USER_BY_EMAIL_SUCCESS,
  GET_USER_BY_EMAIL_FAILURE,
  ADD_USER_REQUEST,
  ADD_USER_SUCCESS,
  ADD_USER_FAILURE,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAILURE,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILURE,
  HANDLE_INPUT,
  CLEAR_FORM,
  HANDLE_DELETE_OPEN,
  HANDLE_DELETE_CLOSE
} from "../actions/apiUserActions";

export const INITIAL_STATE = {
  deleteDialogOpen: false,
  currentUser: {
    email: "",
    name: "",
    user_type: null,
    created_at: "",
    updated_at: ""
  },
  form: {
    email: "",
    name: "",
    user_type: "",
    existingUserEmail: ""
  },
  error: null
};

function User(state = INITIAL_STATE, action) {
  let error;

  switch (action.type) {
    case LOGOUT:
      return INITIAL_STATE;

    case HANDLE_INPUT:
      return update(state, {
        form: {
          [action.payload.name]: { $set: action.payload.value }
        }
      });

    case HANDLE_DELETE_OPEN:
      return update(state, {
        deleteDialogOpen: { $set: true }
      });

    case HANDLE_DELETE_CLOSE:
    case DELETE_USER_SUCCESS:
      return update(state, {
        deleteDialogOpen: { $set: false },
        currentUser: {
          id: { $set: "" },
          email: { $set: "" },
          name: { $set: "" },
          user_type: { $set: "" },
          created_at: { $set: "" },
          updated_at: { $set: "" }
        },
        error: { $set: null }
      });

    case CLEAR_FORM:
      return update(state, {
        form: {
          email: { $set: "" },
          name: { $set: "" },
          user_type: { $set: "" }
        }
      });

    case GET_USER_BY_EMAIL_REQUEST:
    case ADD_USER_REQUEST:
    case UPDATE_USER_REQUEST:
    case DELETE_USER_REQUEST:
      return update(state, {
        error: { $set: null }
      });

    case ADD_USER_SUCCESS:
    case UPDATE_USER_SUCCESS:
      return update(state, {
        form: {
          email: { $set: action.payload.email },
          name: { $set: action.payload.name },
          user_type: { $set: action.payload.user_type }
        },
        dialogOpen: { $set: false },
        error: { $set: null }
      });

    case GET_USER_BY_EMAIL_SUCCESS:
      return update(state, {
        form: {
          email: { $set: action.payload.email },
          name: { $set: action.payload.name },
          user_type: { $set: action.payload.user_type }
        },
        currentUser: { $set: action.payload },
        dialogOpen: { $set: false },
        error: { $set: null }
      });

    case GET_USER_BY_EMAIL_FAILURE:
    case ADD_USER_FAILURE:
    case UPDATE_USER_FAILURE:
    case DELETE_USER_FAILURE:
      if (typeof action.payload.message === "string") {
        error = action.payload.message;
      } else {
        error = "Sorry, something went wrong :(\nPlease try again.";
      }
      return update(state, {
        error: { $set: error }
      });

    default:
      return state;
  }
}

export default User;
