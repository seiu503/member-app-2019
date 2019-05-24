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
  DELETE_CONTENT_REQUEST,
  DELETE_CONTENT_SUCCESS,
  DELETE_CONTENT_FAILURE,
  HANDLE_INPUT,
  HANDLE_SWITCH,
  HANDLE_DELETE_OPEN,
  HANDLE_DELETE_CLOSE,
  CLEAR_FORM,
  SET_EDIT_CONTENT
} from "../actions/apiContentActions";

const INITIAL_STATE = {
  loading: false,
  featuredContents: [],
  moreContents: [],
  deleteDialogOpen: false,
  currentContent: {
    headline: "",
    bodyCopy: "",
    imageUrl: "",
    created_at: "",
    updated_at: ""
  },
  form: {
    headline: "",
    bodyCopy: "",
    imageUrl: "",
    dialogOpen: false
  },
  error: null
};

function content(state = INITIAL_STATE, action) {
  let error;

  switch (action.type) {
    case LOGOUT:
      return INITIAL_STATE;

    case HANDLE_INPUT:
    case HANDLE_SWITCH:
      if (action.payload.name === "sort_order") {
        return update(state, {
          form: {
            [action.payload.name]: { $set: parseInt(action.payload.value) }
          }
        });
      } else {
        return update(state, {
          form: {
            [action.payload.name]: { $set: action.payload.value }
          }
        });
      }

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
          headline: { $set: "" },
          bodyCopy: { $set: "" },
          imageUrl: { $set: "" },
          created_at: { $set: "" },
          updated_at: { $set: "" }
        },
        loading: { $set: false },
        error: { $set: null }
      });

    case SET_EDIT_CONTENT:
      return update(state, {
        form: {
          headline: { $set: action.payload.headline },
          bodyCopy: { $set: action.payload.bodyCopy },
          imageUrl: { $set: action.payload.imageUrl },
          dialogOpen: { $set: false }
        }
      });

    case CLEAR_FORM:
      return update(state, {
        form: {
          headline: { $set: "" },
          bodyCopy: { $set: "" },
          imageUrl: { $set: "" },
          created_at: { $set: "" },
          updated_at: { $set: "" },
          dialogOpen: { $set: false }
        }
      });

    case GET_CONTENT_BY_ID_REQUEST:
    case ADD_CONTENT_REQUEST:
    case UPDATE_CONTENT_REQUEST:
    case DELETE_CONTENT_REQUEST:
      return update(state, {
        loading: { $set: true },
        error: { $set: null }
      });

    case GET_CONTENT_BY_ID_SUCCESS:
    case ADD_CONTENT_SUCCESS:
    case UPDATE_CONTENT_SUCCESS:
      return update(state, {
        loading: { $set: false },
        currentContent: { $set: action.payload[0] },
        error: { $set: null }
      });

    case GET_CONTENT_BY_ID_FAILURE:
    case ADD_CONTENT_FAILURE:
    case UPDATE_CONTENT_FAILURE:
    case DELETE_CONTENT_FAILURE:
      if (typeof action.payload.message === "string") {
        error = action.payload.message;
      } else {
        error = "Sorry, something went wrong :(\nPlease try again.";
      }
      return update(state, {
        loading: { $set: false },
        error: { $set: error }
      });

    default:
      return state;
  }
}

export default content;
