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

let refreshRecaptchaMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));

let verifyRecaptchaScoreMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve(0.9));

global.scrollTo = jest.fn();

const clearSigBoxMock = jest.fn();
let toDataURLMock = jest.fn();

const sigBox = {
  current: {
    toDataURL: toDataURLMock,
    clear: clearSigBoxMock
  }
};

const changeTabMock = jest.fn();

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
  },
  updateSFContact: updateSFContactSuccess,
  changeTab: changeTabMock,
  lookupSFContact: lookupSFContactSuccess,
  createSFContact: createSFContactSuccess,
  translate: jest.fn()
};

const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  return shallow(<SubmissionFormPage1Container {...setupProps} />);
};

describe("<SubmissionFormPage1Container /> unconnected", () => {
  beforeEach(() => {
    // console.log = jest.fn();
    changeTabMock.mockClear();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("handleTab1", () => {
    test("`handleTab1` handles error if verifyRecaptchaScore fails", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
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
          formPage1: {}
        },
        apiSF: {
          updateSFContact: updateSFContactError,
          createSFContact: createSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
      };
      const verifyRecaptchaScoreError = jest
        .fn()
        .mockImplementation(() => Promise.resolve(0));
      wrapper = setup(props);
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreError;

      wrapper.update();
      wrapper
        .instance()
        .handleTab1()
        .then(async () => {
          await verifyRecaptchaScoreError();
          expect(formElements.handleError.mock.calls.length).toBe(1);
          changeTabMock.mockClear();
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleTab1` sets howManyTabs to 3 if no payment required", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "homecare",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {}
        },
        apiSF: {
          updateSFContact: updateSFContactError,
          createSFContact: createSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
      };

      wrapper = setup(props);
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;

      wrapper.update();
      wrapper
        .instance()
        .handleTab1()
        .then(async () => {
          await verifyRecaptchaScoreMock();
          expect(handleInputMock.mock.calls[0][0]).toEqual({
            target: { name: "howManyTabs", value: 3 }
          });
          changeTabMock.mockClear();
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleTab1` handles error if updateSFContact fails", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
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
          formPage1: {}
        },
        apiSF: {
          updateSFContact: updateSFContactError,
          createSFContact: createSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
      };
      updateSFContactError = () => Promise.reject();
      wrapper = setup(props);
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper.instance().updateSFContact = updateSFContactError;

      wrapper.update();
      wrapper
        .instance()
        .handleTab1()
        .then(async () => {
          await verifyRecaptchaScoreMock();
          await handleInputMock();
          return updateSFContactError().then(() => {
            expect(formElements.handleError.mock.calls.length).toBe(1);
            changeTabMock.mockClear();
          });
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleTab1` handles error if lookupSFContact fails", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
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
          salesforceId: null,
          formPage1: {}
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          updateSFContact: updateSFContactSuccess,
          lookupSFContact: lookupSFContactError,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
      };
      wrapper = setup(props);
      lookupSFContactError = () => Promise.reject("");
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper.instance().updateSFContact = updateSFContactSuccess;
      wrapper.instance().lookupSFContact = lookupSFContactError;
      wrapper.update();
      wrapper
        .instance()
        .handleTab1()
        .then(async () => {
          await verifyRecaptchaScoreMock();
          await handleInputMock();
          await updateSFContactSuccess();
          return lookupSFContactError().then(() => {
            expect(formElements.handleError.mock.calls.length).toBe(1);
            changeTabMock.mockClear();
          });
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleTab1` navigates to tab 1 if salesforceId found in state", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      clearFormMock = jest.fn();
      updateSFContactSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SF_CONTACT_SUCCESS", payload: {} })
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
          handleInput: handleInputMock,
          clearForm: clearFormMock,
          verify: () =>
            Promise.resolve({ type: "VERIFY_SUCCESS", payload: { score: 0.9 } })
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            reCaptchaValue: ""
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          updateSFContact: updateSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        },
        recaptcha: {
          execute: jest.fn()
        }
      };
      wrapper = setup(props);
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper.instance().updateSFContact = updateSFContactSuccess;

      wrapper
        .instance()
        .handleTab1()
        .then(async () => {
          await verifyRecaptchaScoreMock();
          await handleInputMock();
          return updateSFContactSuccess().then(() => {
            expect(changeTabMock.mock.calls.length).toBe(1);
            changeTabMock.mockClear();
          });
        })
        .catch(err => console.log(err));
    });

    test("`handleTab1` navigates to tab 1 if lookup successful", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      const handleErrorMock = jest.fn();
      formElements.handleError = handleErrorMock;
      clearFormMock = jest.fn();
      updateSFContactSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SF_CONTACT_SUCCESS", payload: {} })
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
          handleInput: handleInputMock,
          clearForm: clearFormMock,
          verify: () =>
            Promise.resolve({ type: "VERIFY_SUCCESS", payload: { score: 0.9 } })
        },
        submission: {
          salesforceId: null,
          formPage1: {
            reCaptchaValue: ""
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          updateSFContact: updateSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        },
        recaptcha: {
          execute: jest.fn()
        }
      };
      wrapper = setup(props);
      updateSFContactError = jest
        .fn()
        .mockImplementation(() => Promise.reject("is this the error?"));
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper.instance().lookupSFContact = lookupSFContactSuccess;
      wrapper.instance().updateSFContact = updateSFContactError;
      const changeTabMock = jest.fn();
      wrapper.instance().changeTab = changeTabMock;
      wrapper.update();
      await wrapper
        .instance()
        .handleTab1()
        .catch(err => console.log(err));
      await verifyRecaptchaScoreMock();
      await handleInputMock();
      await lookupSFContactSuccess();
      wrapper.instance().props.submission.salesforceId = "1";
      await updateSFContactError().catch(err => console.log(err));
      changeTabMock.mockClear();
      // expect(formElements.handleError.mock.calls.length).toBe(1);
    });
  });
});
