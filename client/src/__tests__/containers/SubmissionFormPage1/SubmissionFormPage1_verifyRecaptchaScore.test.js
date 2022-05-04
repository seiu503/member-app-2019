import React from "react";
import { shallow } from "enzyme";
import moment from "moment";
import "jest-canvas-mock";

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
  },
  translate: jest.fn()
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

  describe("verifyRecaptchaScore", () => {
    test("verifyRecaptchaScore calls `recaptcha.current.execute()`", async function() {
      const props = {
        recaptcha: {
          current: {
            execute: executeMock
          }
        }
      };
      wrapper = setup(props);
      await wrapper.instance().verifyRecaptchaScore();
      expect(executeMock.mock.calls.length).toBe(1);
    });
    test("verifyRecaptchaScore calls `apiSubmission.verify`", async function() {
      const verifySuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "VERIFY_SUCCESS", payload: { score: 0.9 } })
        );
      const props = {
        recaptcha: {
          current: {
            execute: executeMock
          }
        },
        submission: {
          formPage1: {
            reCaptchaValue: 123
          }
        },
        apiSubmission: {
          verify: verifySuccess
        }
      };
      wrapper = setup(props);
      await wrapper.instance().verifyRecaptchaScore();
      expect(verifySuccess.mock.calls.length).toBe(1);
    });
    test("verifyRecaptchaScore handles error if `apiSubmission.verify` throws", async function() {
      const verifyError = jest
        .fn()
        .mockImplementation(() => Promise.reject({ type: "VERIFY_FAILURE" }));
      const props = {
        recaptcha: {
          current: {
            execute: executeMock
          }
        },
        submission: {
          formPage1: {
            reCaptchaValue: 123
          }
        },
        apiSubmission: {
          verify: verifyError
        }
      };
      wrapper = setup(props);
      await wrapper.instance().verifyRecaptchaScore();
      await verifyError()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(error => {
          console.log(error);
        });
    });
  });
});
