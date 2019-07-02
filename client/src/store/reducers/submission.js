import update from "immutability-helper";
import moment from "moment";

import {
  ADD_SUBMISSION_REQUEST,
  ADD_SUBMISSION_SUCCESS,
  ADD_SUBMISSION_FAILURE,
  CLEAR_FORM
} from "../actions/apiSubmissionActions";

const INITIAL_STATE = {
  loading: false,
  error: null,
  formPage1: {},
  formPage2: {}
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
          mm: { $set: moment(action.payload.birthdate).format("mm") },
          dd: { $set: moment(action.payload.birthdate).format("dd") },
          yy: { $set: moment(action.payload.birthdate).format("yyyy") },
          cellPhone: { $set: action.payload.cell_phone },
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
        }
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

    case CLEAR_FORM:
      return update(state, {
        formPage1: {
          firstName: { $set: "" },
          lastName: { $set: "" },
          dd: { $set: "" },
          mm: { $set: "" },
          yyyy: { $set: "" },
          preferredLanguage: { $set: "english" },
          homeStreet: { $set: "" },
          homeCity: { $set: "" },
          homePostalCode: { $set: "" },
          homeState: { $set: "" },
          homeEmail: { $set: "" },
          mobilePhone: { $set: "" },
          employerName: { $set: "" },
          textAuthOptOut: { $set: false },
          termsAgree: { $set: false },
          signature: { $set: "" },
          signedApplication: { $set: false }
        }
      });

    default:
      return state;
  }
}

export default Submission;
