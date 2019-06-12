import update from "immutability-helper";

import {
  HANDLE_INPUT,
  HANDLE_SELECT,
  HANDLE_CHECKBOX,
  CLEAR_FORM
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
    homePostalCode: "",
    homeState: "",
    homeEmail: "",
    mobilePhone: "",
    textAuthOptOut: false,
    termsAgree: false,
    Signature: "",
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

    case CLEAR_FORM:
      return update(state, {
        form: {
          firstName: { $set: "" },
          LastName: { $set: "" },
          Dd: { $set: "" },
          Mm: { $set: "" },
          Yyyy: { $set: "" },
          preferredLanguage: { $set: "english" },
          homeStreet: { $set: "" },
          homePostalCode: { $set: "" },
          homeState: { $set: "" },
          homeEmail: { $set: "" },
          mobilePhone: { $set: "" },
          textAuthOptOut: { $set: false },
          termsAgree: { $set: false },
          Signature: { $set: "" },
          onlineCampaignSource: { $set: "" },
          signedApplication: { $set: false }
        }
      });

    default:
      return state;
  }
}

export default Submission;
