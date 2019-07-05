import update from "immutability-helper";
import moment from "moment";

import {
  ADD_SUBMISSION_REQUEST,
  ADD_SUBMISSION_SUCCESS,
  ADD_SUBMISSION_FAILURE
  // UPDATE_SUBMISSION_REQUEST,
  // UPDATE_SUBMISSION_SUCCESS,
  // UPDATE_SUBMISSION_FAILURE,
} from "../actions/apiSubmissionActions";

const INITIAL_STATE = {
  loading: false,
  error: null,
  salseforceId: null
};

function Submission(state = INITIAL_STATE, action) {
  let error;

  switch (action.type) {
    case ADD_SUBMISSION_REQUEST:
      return update(state, {
        loading: { $set: true },
        error: { $set: null }
      });

    case ADD_SUBMISSION_SUCCESS:
      return update(state, {
        loading: { $set: false },
        salseforceId: { $set: action.payload.salesforce_id }
      });

    case ADD_SUBMISSION_FAILURE:
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
    // case UPDATE_SUBMISSION_REQUEST:
    //   return update(state, {
    //     loading: { $set: true },
    //     error: { $set: null }
    //   });

    // case UPDATE_SUBMISSION_SUCCESS:
    //   return update(state, {
    //     loading: { $set: false },
    //     formPage2SubmitSucess: { $set: true }
    //   });

    // case UPDATE_SUBMISSION_FAILURE:
    //   if (typeof action.payload.message === "string") {
    //     error = action.payload.message;
    //   } else {
    //     error = "Sorry, something went wrong :(\nPlease try again.";
    //   }
    //   console.log(error);
    //   return update(state, {
    //     loading: { $set: false },
    //     error: { $set: error }
    //   });

    default:
      return state;
  }
}

export default Submission;
