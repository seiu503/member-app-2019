import update from "immutability-helper";
import welcomeInfo from "../../translations/welcomeInfo.json";

import { 
  SET_SPINNER, 
  SPINNER_OFF,
  SET_TAB,
  SET_SPF,
  SET_USER_SELECTED_LANGUAGE,
  SET_SNACKBAR,
  SET_EMBED,
  SET_HEADLINE,
  SET_BODY,
  SET_IMAGE,
  SET_OPEN,
  SET_CAPE_OPEN,
  SET_LEGAL_LANGUAGE,
  SET_DISPLAY_CAPE_PAYMENT_FIELDS
} from "../actions";

import {
  ADD_SUBMISSION_REQUEST,
  ADD_SUBMISSION_SUCCESS,
  ADD_SUBMISSION_FAILURE,
  UPDATE_SUBMISSION_REQUEST,
  UPDATE_SUBMISSION_SUCCESS,
  UPDATE_SUBMISSION_FAILURE,
  CREATE_CAPE_REQUEST,
  CREATE_CAPE_SUCCESS,
  CREATE_CAPE_FAILURE,
  UPDATE_CAPE_REQUEST,
  UPDATE_CAPE_SUCCESS,
  UPDATE_CAPE_FAILURE,
  VERIFY_REQUEST,
  VERIFY_SUCCESS,
  VERIFY_FAILURE
} from "../actions/apiSubmissionActions";

import {
  GET_SF_CONTACT_REQUEST,
  GET_SF_CONTACT_SUCCESS,
  GET_SF_CONTACT_FAILURE,
  GET_SF_CONTACT_DID_REQUEST,
  GET_SF_CONTACT_DID_SUCCESS,
  GET_SF_CONTACT_DID_FAILURE,
  GET_SF_EMPLOYERS_REQUEST,
  GET_SF_EMPLOYERS_SUCCESS,
  GET_SF_EMPLOYERS_FAILURE,
  LOOKUP_SF_CONTACT_REQUEST,
  LOOKUP_SF_CONTACT_SUCCESS,
  LOOKUP_SF_CONTACT_FAILURE,
  CREATE_SF_CONTACT_SUCCESS,
  CREATE_SF_CONTACT_REQUEST,
  CREATE_SF_CONTACT_FAILURE,
  CREATE_SF_OMA_REQUEST,
  CREATE_SF_OMA_SUCCESS,
  CREATE_SF_OMA_FAILURE,
  UPDATE_SF_CONTACT_SUCCESS,
  UPDATE_SF_CONTACT_REQUEST,
  UPDATE_SF_CONTACT_FAILURE,
  CREATE_SF_CAPE_REQUEST,
  CREATE_SF_CAPE_SUCCESS,
  CREATE_SF_CAPE_FAILURE
} from "../actions/apiSFActions";

// CREATE_CAPE_SUCCESS, UPDATE_SUBMISSION_SUCCESS
// intentionally omitted because they are being called in a
// long Promise.all chain

export const INITIAL_STATE = {
  loggedIn: false,
  authToken: "",
  loading: false,
  userType: "",
  tab: undefined,
  spf: false,
  userSelectedLanguage: "",
  embed: false,
  headline: {
    text: welcomeInfo.headline,
    id: 0
  },
  body: {
    text: welcomeInfo.body,
    id: 0
  },
  image: {},
  snackbar: {
    open: false,
    variant: "info",
    message: null
  },
  open: false,
  capeOpen: false,
  legalLanguage: "",
  displayCapePaymentFields: false
};

function appState(state = INITIAL_STATE, action) {
  // console.log('appStateReducer');
  // console.log(action.type);
  // let error;
  switch (action.type) {
    case SET_SPINNER: {
      return update(state, {
        loading: { $set: true }
      });
    }

    case SET_TAB: {
      return update(state, {
        tab: { $set: action.payload.value }
      })
    }

    case SET_SPF: {
      return update(state, {
        spf: { $set: action.payload.value }
      })
    }

    case SET_EMBED: {
      return update(state, {
        embed: { $set: action.payload.value }
      })
    }

    case SET_USER_SELECTED_LANGUAGE: {
      return update(state, {
        userSelectedLanguage: { $set: action.payload.value }
      })
    }

    case SET_SNACKBAR: {
      return update(state, {
        snackbar: { 
          open: { $set: action.payload.open},
          variant: { $set: action.payload.variant },
          message: { $set: action.payload.message } 
        }
      })
    }

    case SET_HEADLINE: {
      return update(state, {
        headline: { 
          text: { $set: action.payload.text},
          id: { $set: action.payload.id } 
        }
      })
    }

    case SET_BODY: {
      return update(state, {
        body: { 
          text: { $set: action.payload.text},
          id: { $set: action.payload.id } 
        }
      })
    }

    case SET_IMAGE: {
        return update(state, {
          image: { $set: { ...action.payload.value } }
        })
      }

    case SET_OPEN: {
        console.log(`SET_OPEN`);
        console.log(action.payload);
        return update(state, {
          open: { $set: action.payload }
        })
      }

    case SET_CAPE_OPEN: {
      console.log(`SET_CAPE_OPEN`);
      console.log(action.payload);
        return update(state, {
          capeOpen: { $set: action.payload }
        })
      }

    case SET_DISPLAY_CAPE_PAYMENT_FIELDS: {
        return update(state, {
          displayCapePaymentFields: { $set: { ...action.payload.value } }
        })
      }

    case SET_LEGAL_LANGUAGE: {
        return update(state, {
          legalLanguage: { $set: { ...action.payload.value } }
        })
      }

    case SPINNER_OFF: {
      return update(state, {
        loading: { $set: false }
      });
    }

    case ADD_SUBMISSION_REQUEST:
    case UPDATE_SUBMISSION_REQUEST:
    case GET_SF_CONTACT_REQUEST:
    case GET_SF_EMPLOYERS_REQUEST:
    case LOOKUP_SF_CONTACT_REQUEST:
    case CREATE_SF_CONTACT_REQUEST:
    case CREATE_SF_OMA_REQUEST:
    case UPDATE_SF_CONTACT_REQUEST:
    case VERIFY_REQUEST:
    case CREATE_CAPE_REQUEST:
    case CREATE_SF_CAPE_REQUEST:
    case UPDATE_CAPE_REQUEST:
    case GET_SF_CONTACT_DID_REQUEST:
      return update(state, {
        loading: { $set: true }
      });

    case ADD_SUBMISSION_SUCCESS:
    case ADD_SUBMISSION_FAILURE:
    case UPDATE_SUBMISSION_SUCCESS:
    case UPDATE_SUBMISSION_FAILURE:
    case GET_SF_CONTACT_SUCCESS:
    case GET_SF_CONTACT_FAILURE:
    case GET_SF_EMPLOYERS_SUCCESS:
    case GET_SF_EMPLOYERS_FAILURE:
    case LOOKUP_SF_CONTACT_SUCCESS:
    case LOOKUP_SF_CONTACT_FAILURE:
    case CREATE_SF_CONTACT_SUCCESS:
    case CREATE_SF_CONTACT_FAILURE:
    case CREATE_SF_OMA_SUCCESS:
    case CREATE_SF_OMA_FAILURE:
    case UPDATE_SF_CONTACT_SUCCESS:
    case UPDATE_SF_CONTACT_FAILURE:
    case VERIFY_SUCCESS:
    case VERIFY_FAILURE:
    case CREATE_CAPE_FAILURE:
    case CREATE_CAPE_SUCCESS:
    case CREATE_SF_CAPE_SUCCESS:
    case CREATE_SF_CAPE_FAILURE:
    case UPDATE_CAPE_SUCCESS:
    case UPDATE_CAPE_FAILURE:
    case GET_SF_CONTACT_DID_SUCCESS:
    case GET_SF_CONTACT_DID_FAILURE:
      return update(state, {
        loading: { $set: false }
      });

    default:
      return state;
  }
}

export default appState;
