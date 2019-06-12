import update from "immutability-helper";
import moment from "moment";

import {
  HANDLE_INPUT,
  HANDLE_SELECT,
  HANDLE_CHECKBOX,
  CLEAR_FORM,
  ADD_SUBMISSION_REQUEST,
  ADD_SUBMISSION_SUCCESS,
  ADD_SUBMISSION_FAILURE
} from "../actions/apiSubmissionActions";

const INITIAL_STATE = {
  loading: false,
  filteredList: [],
  allContent: [],
  form: {
    firstName: "",
    lastName: "",
    dd: "",
    mm: "",
    yyyy: "",
    preferredLanguage: "",
    homeStreet: "",
    homeCity: "",
    homeState: "",
    homePostalCode: "",
    homeEmail: "",
    mobilePhone: "",
    employerName: "",
    agencyNumber: "",
    textAuthOptOut: false,
    termsAgree: false,
    signature: "",
    onlineCampaignSource: "",
    signedApplication: false
  },
  error: null
};

function Submission(state = INITIAL_STATE, action) {
  let error;

  switch (action.type) {
    case HANDLE_INPUT:
      return update(state, {
        form: {
          [action.payload.name]: { $set: action.payload.value }
        }
      });
    case HANDLE_SELECT:
    case HANDLE_CHECKBOX:
      return update(state, {
        form: {
          [action.payload.name]: { $set: action.payload.value }
        }
      });

    case ADD_SUBMISSION_REQUEST:
      console.log("loading");
      return update(state, {
        loading: { $set: true },
        error: { $set: null }
      });

    case ADD_SUBMISSION_SUCCESS:
      return update(state, {
        loading: { $set: false },
        form: {
          agencyNumber: { $set: action.payload.agency_number },
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
          textAuthOptOut: { $set: action.payload.text_auth_opt_out },
          onlineCampaignSource: { $set: action.payload.online_campaign_source }
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
        form: {
          firstName: { $set: "" },
          lastName: { $set: "" },
          Dd: { $set: "" },
          Mm: { $set: "" },
          Yyyy: { $set: "" },
          preferredLanguage: { $set: "english" },
          homeStreet: { $set: "" },
          homeCity: { $set: "" },
          homePostalCode: { $set: "" },
          homeState: { $set: "" },
          homeEmail: { $set: "" },
          mobilePhone: { $set: "" },
          employerName: { $set: "" },
          agencyNumber: { $set: "" },
          textAuthOptOut: { $set: false },
          termsAgree: { $set: false },
          signature: { $set: "" },
          onlineCampaignSource: { $set: "" },
          signedApplication: { $set: false }
        }
      });

    default:
      return state;
  }
}

export default Submission;
