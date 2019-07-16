import update from "immutability-helper";

import { LOGOUT } from "../actions";
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
  GET_ALL_CONTENT_FAILURE,
  HANDLE_INPUT,
  HANDLE_DELETE_OPEN,
  HANDLE_DELETE_CLOSE,
  CLEAR_FORM
} from "../actions/apiContentActions";

export const INITIAL_STATE = {
  filteredList: [],
  allContent: [],
  deleteDialogOpen: false,
  currentContent: {
    content_type: null,
    content: "",
    created_at: "",
    updated_at: ""
  },
  form: {
    content_type: null,
    content: "",
    dialogOpen: false
  },
  error: null
};

function Content(state = INITIAL_STATE, action) {
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
        deleteDialogOpen: { $set: true },
        currentContent: { $set: { ...action.payload.selectedContent } }
      });

    case HANDLE_DELETE_CLOSE:
    case DELETE_CONTENT_SUCCESS:
      return update(state, {
        deleteDialogOpen: { $set: false },
        currentContent: {
          id: { $set: "" },
          content_type: { $set: "" },
          content: { $set: "" },
          created_at: { $set: "" },
          updated_at: { $set: "" }
        },
        error: { $set: null }
      });

    case CLEAR_FORM:
      return update(state, {
        form: {
          content_type: { $set: null },
          content: { $set: "" },
          created_at: { $set: "" },
          updated_at: { $set: "" },
          dialogOpen: { $set: false }
        }
      });

    case GET_CONTENT_BY_ID_REQUEST:
    case ADD_CONTENT_REQUEST:
    case UPDATE_CONTENT_REQUEST:
    case DELETE_CONTENT_REQUEST:
    case UPLOAD_IMAGE_REQUEST:
    case GET_ALL_CONTENT_REQUEST:
    case DELETE_IMAGE_REQUEST:
      return update(state, {
        error: { $set: null }
      });

    case GET_CONTENT_BY_ID_SUCCESS:
    case ADD_CONTENT_SUCCESS:
    case UPDATE_CONTENT_SUCCESS:
    case UPLOAD_IMAGE_SUCCESS:
      return update(state, {
        form: {
          content_type: { $set: action.payload.content_type },
          content: { $set: action.payload.content },
          created_at: { $set: action.payload.created_at },
          updated_at: { $set: action.payload.updated_at },
          dialogOpen: { $set: false }
        },
        error: { $set: null }
      });

    case DELETE_IMAGE_SUCCESS:
      return update(state, {
        error: { $set: null }
      });

    case GET_ALL_CONTENT_SUCCESS:
      return update(state, {
        allContent: { $set: action.payload },
        error: { $set: null }
      });

    case GET_CONTENT_BY_ID_FAILURE:
    case ADD_CONTENT_FAILURE:
    case UPDATE_CONTENT_FAILURE:
    case DELETE_CONTENT_FAILURE:
    case UPLOAD_IMAGE_FAILURE:
    case GET_ALL_CONTENT_FAILURE:
    case DELETE_IMAGE_FAILURE:
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

export default Content;
