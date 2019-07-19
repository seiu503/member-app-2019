import update from "immutability-helper";

import { LOGOUT } from "../actions";
import {
  GET_PROFILE_REQUEST,
  GET_PROFILE_SUCCESS,
  GET_PROFILE_FAILURE
} from "../actions/apiProfileActions";

export const INITIAL_STATE = {
  profile: {
    id: "",
    name: "",
    email: "",
    avatar_url: ""
  },
  error: null
};

function profile(state = INITIAL_STATE, action) {
  let error;

  switch (action.type) {
    case LOGOUT:
      return INITIAL_STATE;

    case GET_PROFILE_REQUEST:
      return update(state, {
        error: { $set: null }
      });

    case GET_PROFILE_SUCCESS:
      return update(state, {
        profile: {
          id: { $set: action.payload.id },
          name: { $set: action.payload.name },
          email: { $set: action.payload.email },
          avatar_url: { $set: action.payload.avatar_url }
        },
        error: { $set: null }
      });

    case GET_PROFILE_FAILURE:
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

export default profile;
