import update from "immutability-helper";
import moment from "moment";

import {
  ADD_SUBMISSION_REQUEST,
  ADD_SUBMISSION_SUCCESS,
  ADD_SUBMISSION_FAILURE,
  UPDATE_SUBMISSION_REQUEST,
  UPDATE_SUBMISSION_SUCCESS,
  UPDATE_SUBMISSION_FAILURE,
  CLEAR_FORM
} from "../actions/apiSubmissionActions";

const INITIAL_STATE = {
  loading: false,
  error: null,
  formPage2SubmitSucess: false,
  formPage1SubmitSucess: false
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
        formPage1SubmitSucess: { $set: true }
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

    case CLEAR_FORM:
      return update(state, {
        formPage2: {
          mailToCity: { $set: "" },
          mailToState: { $set: "" },
          mailToStreet: { $set: "" },
          mailToPostalCode: { $set: "" },
          africanOrAfricanAmerican: { $set: false },
          arabAmericanMiddleEasternOrNorthAfrican: { $set: false },
          asianOrAsianAmerican: { $set: false },
          hispanicOrLatinx: { $set: false },
          nativeAmericanOrIndigenous: { $set: false },
          nativeHawaiianOrOtherPacificIslander: { $set: false },
          white: { $set: false },
          other: { $set: false },
          declined: { $set: false },
          lgbtqId: { $set: false },
          transId: { $set: false },
          disabilityId: { $set: false },
          deafOrHardOfHearing: { $set: false },
          blindOrVisuallyImpaired: { $set: false },
          gender: { $set: "" },
          genderOtherDescription: { $set: "" },
          genderPronoun: { $set: "" },
          jobTitle: { $set: "" },
          worksite: { $set: "" },
          workEmail: { $set: "" },
          workPhone: { $set: "" },
          hireDate: { $set: "" }
        }
      });

    default:
      return state;
  }
}

export default Submission;
