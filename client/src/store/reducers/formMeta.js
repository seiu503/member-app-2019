import update from "immutability-helper";

import { LOGOUT } from "../actions";
import {
  GET_FORM_META_BY_ID_REQUEST,
  GET_FORM_META_BY_ID_SUCCESS,
  GET_FORM_META_BY_ID_FAILURE,
  ADD_FORM_META_REQUEST,
  ADD_FORM_META_SUCCESS,
  ADD_FORM_META_FAILURE,
  UPDATE_FORM_META_REQUEST,
  UPDATE_FORM_META_SUCCESS,
  UPDATE_FORM_META_FAILURE,
  UPLOAD_IMAGE_REQUEST,
  UPLOAD_IMAGE_SUCCESS,
  UPLOAD_IMAGE_FAILURE,
  DELETE_FORM_META_REQUEST,
  DELETE_FORM_META_SUCCESS,
  DELETE_FORM_META_FAILURE,
  HANDLE_INPUT,
  HANDLE_SWITCH,
  HANDLE_DELETE_OPEN,
  HANDLE_DELETE_CLOSE,
  CLEAR_FORM,
  SET_EDIT_FORM_META
} from "../actions/apiFormMetaActions";

const INITIAL_STATE = {
  loading: false,
  featuredFormMetas: [],
  moreFormMetas: [],
  deleteDialogOpen: false,
  currentFormMeta: {
    formMetaType: null,
    content: "",
    created_at: "",
    updated_at: ""
  },
  form: {
    formMetaType: null,
    content: "",
    dialogOpen: false
  },
  error: null
};

function formMeta(state = INITIAL_STATE, action) {
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
        currentFormMeta: { $set: { ...action.payload.selectedFormMeta } }
      });

    case HANDLE_DELETE_CLOSE:
    case DELETE_FORM_META_SUCCESS:
      return update(state, {
        deleteDialogOpen: { $set: false },
        currentFormMeta: {
          id: { $set: "" },
          formMetaType: { $set: "" },
          content: { $set: "" },
          created_at: { $set: "" },
          updated_at: { $set: "" }
        },
        loading: { $set: false },
        error: { $set: null }
      });

    case SET_EDIT_FORM_META:
      return update(state, {
        form: {
          formMetaType: { $set: action.payload.formMetaType },
          content: { $set: action.payload.content },
          dialogOpen: { $set: false }
        }
      });

    case CLEAR_FORM:
      console.log("clearing form in redux store");
      return update(state, {
        form: {
          formMetaType: { $set: null },
          content: { $set: "" },
          created_at: { $set: "" },
          updated_at: { $set: "" },
          dialogOpen: { $set: false }
        }
      });

    case GET_FORM_META_BY_ID_REQUEST:
    case ADD_FORM_META_REQUEST:
    case UPDATE_FORM_META_REQUEST:
    case DELETE_FORM_META_REQUEST:
    case UPLOAD_IMAGE_REQUEST:
      return update(state, {
        loading: { $set: true },
        error: { $set: null }
      });

    case GET_FORM_META_BY_ID_SUCCESS:
    case ADD_FORM_META_SUCCESS:
    case UPDATE_FORM_META_SUCCESS:
    case UPLOAD_IMAGE_SUCCESS:
      return update(state, {
        loading: { $set: false },
        currentFormMeta: { $set: action.payload[0] },
        error: { $set: null }
      });

    case GET_FORM_META_BY_ID_FAILURE:
    case ADD_FORM_META_FAILURE:
    case UPDATE_FORM_META_FAILURE:
    case DELETE_FORM_META_FAILURE:
    case UPLOAD_IMAGE_FAILURE:
      if (typeof action.payload.message === "string") {
        error = action.payload.message;
      } else {
        error = "Sorry, something went wrong :(\nPlease try again.";
      }
      console.log(error);
      return update(state, {
        loading: { $set: false },
        error: { $set: error }
      });

    default:
      return state;
  }
}

export default formMeta;
