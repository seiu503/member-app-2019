import update from "immutability-helper";
import moment from "moment";

import {
  ADD_SUBMISSION_REQUEST,
  ADD_SUBMISSION_SUCCESS,
  ADD_SUBMISSION_FAILURE,
  UPDATE_SUBMISSION_REQUEST,
  UPDATE_SUBMISSION_SUCCESS,
  UPDATE_SUBMISSION_FAILURE,
  SAVE_SALESFORCEID
} from "../actions/apiSubmissionActions";

export const INITIAL_STATE = {
  loading: false,
  error: null,
  salesforceId: null
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
        formPage1: {
          mm: { $set: moment(action.payload.birthdate).format("MM") },
          dd: { $set: moment(action.payload.birthdate).format("DD") },
          yyyy: { $set: moment(action.payload.birthdate).format("YYYY") },
          mobilePhone: { $set: action.payload.cell_phone },
          employerName: { $set: action.payload.employer_name },
          firstName: { $set: action.payload.first_name },
          lastName: { $set: action.payload.last_name },
          homeStreet: { $set: action.payload.home_street },
          homeCity: { $set: action.payload.home_city },
          homeState: { $set: action.payload.home_state },
          homeZip: { $set: action.payload.home_zip },
          homeEmail: { $set: action.payload.home_email },
          preferredLanguage: { $set: action.payload.preferred_language },
          termsAgree: { $set: action.payload.terms_agree },
          signature: { $set: action.payload.signature },
          textAuthOptOut: { $set: action.payload.text_auth_opt_out }
        },
        error: { $set: null }
      });

    case ADD_SUBMISSION_FAILURE:
      if (typeof action.payload.message === "string") {
        error = action.payload.message;
      } else {
        error = "Sorry, something went wrong :(\nPlease try again.";
      }
      return update(state, {
        loading: { $set: false },
        error: { $set: error }
      });

    case SAVE_SALESFORCEID:
      return update(state, {
        salesforceId: { $set: action.payload.salesforceId }
      });

    case UPDATE_SUBMISSION_REQUEST:
      return update(state, {
        loading: { $set: true },
        error: { $set: null }
      });

    case UPDATE_SUBMISSION_SUCCESS:
      return update(state, {
        loading: { $set: false },
        formPage2SubmitSucess: { $set: true }
      });

    case UPDATE_SUBMISSION_FAILURE:
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

export default Submission;
