import React from "react";
import { mount, shallow } from "enzyme";
import moment from "moment";
import {
  findByTestAttr,
  storeFactory,
  fakeDataURI
} from "../../../utils/testUtils";
import { Provider } from "react-redux";
import "jest-canvas-mock";
import * as formElements from "../../../components/SubmissionFormElements";

import * as apiSForce from "../../../store/actions/apiSFActions";
import {
  SubmissionFormPage1Connected,
  SubmissionFormPage1Container
} from "../../../containers/SubmissionFormPage1";

import { handleInput } from "../../../store/actions/apiSubmissionActions";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store, wrapper, trimSignatureMock, handleUploadMock, addSubmissionMock;

let pushMock = jest.fn(),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  handleErrorMock = jest.fn(),
  executeMock = jest.fn().mockImplementation(() => Promise.resolve());

let updateSFContactSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_CONTACT_SUCCESS", payload: {} })
  );

let updateSFContactError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "UPDATE_SF_CONTACT_FAILURE", payload: {} })
  );

let updateSubmissionSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS", payload: {} })
  );

let updateSubmissionError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SUBMISSION_FAILURE", payload: {} })
  );

let lookupSFContactSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "LOOKUP_SF_CONTACT_SUCCESS",
    payload: { salesforce_id: "123" }
  })
);

let lookupSFContactError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "LOOKUP_SF_CONTACT_FAILURE", payload: {} })
  );

let createSFContactSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "CREATE_SF_CONTACT_SUCCESS",
    payload: { salesforce_id: "123" }
  })
);

let createSFContactError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "CREATE_SF_CONTACT_FAILURE", payload: {} })
  );

let createSFOMAError = jest
  .fn()
  .mockImplementation(() => Promise.reject({ type: "CREATE_SF_OMA_FAILURE" }));

let getSFContactByIdSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "GET_SF_CONTACT_SUCCESS",
    payload: {
      Birthdate: moment("01-01-1900", "MM-DD-YYYY"),
      firstName: "test",
      lastName: "test"
    }
  })
);

let getSFContactByDoubleIdSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "GET_SF_CONTACT_DID_SUCCESS",
    payload: {
      firstName: "test",
      lastName: "test"
    }
  })
);

let getSFContactByIdError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "GET_SF_CONTACT_FAILURE", payload: {} })
  );

let getSFContactByDoubleIdError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "GET_SF_CONTACT_DID_FAILURE", payload: {} })
  );

let addSubmissionSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
  );

let addSubmissionError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "ADD_SUBMISSION_FAILURE" })
  );

let createSubmissionSuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));

let getSFDJRSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_SF_DJR_SUCCESS", payload: {} })
  );

let getSFDJRError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "GET_SF_DJR_FAILURE", payload: {} })
  );

let createSFDJRSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS", payload: {} })
  );

let createSFDJRError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "CREATE_SF_DJR_FAILURE", payload: {} })
  );

let updateSFDJRSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_DJR_SUCCESS", payload: {} })
  );

let updateSFDJRError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "UPDATE_SF_DJR_FAILURE", payload: {} })
  );

let getIframeExistingSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_IFRAME_EXISTING_SUCCESS", payload: {} })
  );

let getIframeExistingError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "GET_IFRAME_EXISTING_FAILURE", payload: {} })
  );

let getIframeNewSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_IFRAME_URL_SUCCESS", payload: {} })
  );

let getIframeNewError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_IFRAME_URL_FAILURE", payload: {} })
  );

let getUnioniseTokenSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "GET_UNIONISE_TOKEN_SUCCESS",
    payload: { access_token: "1234" }
  })
);

let getUnioniseTokenError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_UNIONISE_TOKEN_FAILURE", payload: {} })
  );

// let refreshUnioniseTokenSuccess = jest
//   .fn()
//   .mockImplementation(() =>
//     Promise.resolve({ type: "REFRESH_UNIONISE_TOKEN_SUCCESS", payload: {} })
//   );

// let refreshUnioniseTokenError = jest
//   .fn()
//   .mockImplementation(() =>
//     Promise.resolve({ type: "REFRESH_UNIONISE_TOKEN_FAILURE", payload: {} })
//   );

let refreshRecaptchaMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));

let verifyRecaptchaScoreMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve(0.9));

let createSFCAPESuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "CREATE_SF_CAPE_SUCCESS",
    payload: { sf_cape_id: 123 }
  })
);

let createSFCAPEError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "CREATE_SF_CAPE_FAILURE" })
  );

let createCAPESuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "CREATE_CAPE_SUCCESS" }));

let createCAPEError = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "CREATE_CAPE_FAILURE" }));

let updateCAPESuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" }));

let updateCAPEError = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "UPDATE_CAPE_FAILURE" }));

let updateSFCAPESuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_CAPE_SUCCESS" })
  );

let updateSFCAPEError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_CAPE_FAILURE" })
  );

let postOneTimePaymentSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "POST_ONE_TIME_PAYMENT_SUCCESS",
    payload: { access_token: 123 }
  })
);

let postOneTimePaymentError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "POST_ONE_TIME_PAYMENT_FAILURE" })
  );

let sigUrl = "http://www.example.com/png";
global.scrollTo = jest.fn();

const flushPromises = () => new Promise(setImmediate);
const clearSigBoxMock = jest.fn();
let toDataURLMock = jest.fn();

const sigBox = {
  current: {
    toDataURL: toDataURLMock,
    clear: clearSigBoxMock
  }
};

const initialState = {
  appState: {
    loading: false,
    error: ""
  }
};

const formValues = {
  firstName: "firstName",
  lastName: "lastName",
  homeEmail: "homeEmail",
  homeStreet: "homeStreet",
  homeCity: "homeCity",
  homeZip: "homeZip",
  homeState: "homeState",
  signature: "signature",
  employerType: "employerType",
  employerName: "employerName",
  mobilePhone: "mobilePhone",
  mm: "12",
  dd: "01",
  yyyy: "1999",
  preferredLanguage: "English",
  textAuthOptOut: false
};

const defaultProps = {
  submission: {
    error: null,
    loading: false,
    formPage1: {
      signature: ""
    },
    cape: {},
    payment: {}
  },
  initialValues: {
    mm: "",
    onlineCampaignSource: null
  },
  formValues,
  location: {
    search: "id=1"
  },
  classes: {},
  apiSF: {
    getSFEmployers: () => Promise.resolve({ type: "GET_SF_EMPLOYER_SUCCESS" }),
    getSFContactById: getSFContactByIdSuccess,
    getSFContactByDoubleId: getSFContactByDoubleIdSuccess,
    createSFOMA: () => Promise.resolve({ type: "CREATE_SF_OMA_SUCCESS" }),
    getIframeURL: () =>
      Promise.resolve({ type: "GET_IFRAME_URL_SUCCESS", payload: {} }),
    createSFDJR: createSFDJRSuccess,
    updateSFDJR: updateSFDJRSuccess,
    getSFDJRById: getSFDJRSuccess,
    updateSFContact: updateSFContactSuccess,
    createSFContact: createSFContactSuccess,
    lookupSFContact: lookupSFContactSuccess
  },
  apiSubmission: {
    handleInput: handleInputMock,
    clearForm: clearFormMock,
    setCAPEOptions: jest.fn(),
    addSubmission: () => Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
  },
  history: {
    push: pushMock
  },
  recaptcha: {
    execute: executeMock
  },
  refreshRecaptcha: refreshRecaptchaMock,
  sigBox: { ...sigBox },
  content: {
    error: null
  },
  legal_language: {
    current: {
      innerHTML: "legal"
    }
  },
  direct_deposit: {
    current: {
      innerHTML: "deposit"
    }
  },
  direct_pay: {
    current: {
      innerHTML: "pay"
    }
  },
  actions: {
    setSpinner: jest.fn()
  }
};

const setup = (props = {}) => {
  store = mockStore(initialState);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<SubmissionFormPage1Container {...setupProps} />);
};

describe("<SubmissionFormPage1Container /> unconnected", () => {
  beforeEach(() => {
    // console.log = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("saveSignature", () => {
    test("`saveSignature` saves signature to formValues", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      let props = { apiSubmission: { handleInput: handleInputMock } };
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().handleUpload = handleUploadMock;
      wrapper.update();
      wrapper
        .instance()
        .saveSignature()
        .then(() => {
          expect(handleInputMock.mock.calls[0][0]).toEqual({
            target: { name: "signature", value: sigUrl }
          });
        });
    });
    test("`saveSignature` handles error if handleUpload fails", async function() {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.reject("Error"));

      formElements.handleError = jest.fn();

      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().handleUpload = handleUploadMock;
      wrapper.update();
      wrapper
        .instance()
        .saveSignature()
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
  });
});
