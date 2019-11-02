import React from "react";
import { shallow } from "enzyme";
import moment from "moment";

import "jest-canvas-mock";
import * as formElements from "../../../components/SubmissionFormElements";

import { SubmissionFormPage1Container } from "../../../containers/SubmissionFormPage1";

let wrapper;

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

let lookupSFContactSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "LOOKUP_SF_CONTACT_SUCCESS",
    payload: { salesforce_id: "123" }
  })
);

let createSFContactSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "CREATE_SF_CONTACT_SUCCESS",
    payload: { salesforce_id: "123" }
  })
);

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

let getSFDJRSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_SF_DJR_SUCCESS", payload: {} })
  );

let createSFDJRSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS", payload: {} })
  );

let updateSFDJRSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_DJR_SUCCESS", payload: {} })
  );

let getIframeExistingSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({
      type: "GET_IFRAME_EXISTING_SUCCESS",
      payload: { cardAddingUrl: "hkj" }
    })
  );

let getIframeExistingError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "GET_IFRAME_EXISTING_FAILURE", payload: {} })
  );

let getUnioniseTokenSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "GET_UNIONISE_TOKEN_SUCCESS",
    payload: { access_token: "1234" }
  })
);

let refreshRecaptchaMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));

global.scrollTo = jest.fn();
const clearSigBoxMock = jest.fn();
let toDataURLMock = jest.fn();

const sigBox = {
  current: {
    toDataURL: toDataURLMock,
    clear: clearSigBoxMock
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

  describe("getIframeExisting", () => {
    test("`getIframeExisting` calls getIframeExisting prop function", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          cape: {}
        },
        apiSF: {
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: getUnioniseTokenSuccess
        }
      };
      wrapper = setup(props);

      wrapper
        .instance()
        .getIframeExisting()
        .then(() => {
          expect(getIframeExistingSuccess.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });

    test("`getIframeExisting` handles error if prop function fails", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve());
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      getIframeExistingError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({
            type: "GET_IFRAME_EXISTING_FAILURE",
            payload: { message: "test" }
          })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          cape: {
            memberShortId: "1234"
          },
          payment: {},
          error: "Error"
        },
        apiSF: {
          getIframeExisting: getIframeExistingError
        }
      };
      wrapper = setup(props);
      wrapper
        .instance()
        .getIframeExisting()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`getIframeExisting` handles error if prop function throws", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      getIframeExistingError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "GET_IFRAME_EXISTING_FAILURE", payload: {} })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          cape: {},
          error: "Error"
        },
        apiSF: {
          getIframeExisting: getIframeExistingError
        }
      };
      wrapper = setup(props);
      wrapper
        .instance()
        .getIframeExisting()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });
    });
  });
});
