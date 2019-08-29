import update from "immutability-helper";

import { LOGOUT, SET_LOGGEDIN, SET_REDIRECT_URL } from "../actions";
import {
  VALIDATE_TOKEN_REQUEST,
  VALIDATE_TOKEN_SUCCESS,
  VALIDATE_TOKEN_FAILURE
} from "../actions/apiProfileActions";

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

    case VALIDATE_TOKEN_FAILURE:
      return update(state, {
        loggedIn: { $set: false },
        loading: { $set: false }
      });

    case SET_REDIRECT_URL:
      return update(state, { redirect: { $set: action.payload } });

    case SET_LOGGEDIN:
      return update(state, { loggedIn: { $set: true } });

    case action.type.includes("REQUEST"):
      return update(state, {
        loading: { $set: true }
      });

    case action.type.includes("SUCCESS") || action.type.includes("FAILURE"):
      return update(state, {
        loading: { $set: false }
      });

    default:
      return state;
  }
}

export default appState;
