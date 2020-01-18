import React from "react";
import { shallow } from "enzyme";
import moment from "moment";
import "jest-canvas-mock";
import * as formElements from "../../components/SubmissionFormElements";

import { AppUnconnected } from "../../App";

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

let createSFContactError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "CREATE_SF_CONTACT_FAILURE", payload: {} })
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

global.scrollTo = jest.fn();

const clearSigBoxMock = jest.fn();
let toDataURLMock = jest.fn();

const sigBox = {
  current: {
    toDataURL: toDataURLMock,
    clear: clearSigBoxMock
  }
};

let formValues;

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
  appState: {},
  apiProfile: {},
  initialize: jest.fn(),
  addTranslation: jest.fn(),
  profile: {},
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
  return shallow(<AppUnconnected {...setupProps} />);
};

describe("<App />", () => {
  beforeEach(() => {
    formValues = {
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
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("prepForContact", () => {
    test("`prepForContact` handles edge case if no employerName in formValues", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: undefined,
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
            prefillEmployerId: null
          },
          employerObjects: [{ id: "1", Name: "SEIU LOCAL 503 OPEU" }]
        },
        apiSF: {
          createSFContact: createSFContactError,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
      };
      wrapper = setup(props);
      wrapper.instance().prepForContact(props.formValues);
    });
    test("`prepForContact` handles edge case if no matching employer object found", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "SEIU 503 Staff",
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
            prefillEmployerId: null
          },
          employerObjects: [{ id: "1", Name: "SEIU LOCAL 503 OPEU" }]
        },
        apiSF: {
          createSFContact: createSFContactError,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
      };
      wrapper = setup(props);
      const result = await wrapper
        .instance()
        .prepForContact(formValues)
        .catch(err => console.log(err));

      expect(result.agencyNumber).toBe(0);
      expect(result.employerId).toBe("0016100000WERGeAAP");
    });
    test("`prepForContact` handles edge case if prefill employer id & employer changed", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "SEIU 503 Staff",
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
            prefillEmployerId: "2",
            prefillEmployerChanged: true
          },
          employerObjects: [{ id: "1", Name: "SEIU LOCAL 503 OPEU" }]
        },
        apiSF: {
          createSFContact: createSFContactError,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
      };
      wrapper = setup(props);
      const result = await wrapper
        .instance()
        .prepForContact(formValues)
        .catch(err => console.log(err));
      expect(result.agencyNumber).toBe(0);
      expect(result.employerId).toBe("0016100000WERGeAAP");
    });
    test("`prepForContact` handles SEIU 503 Staff edge case", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      formValues.employerName = "SEIU 503 Staff";
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "SEIU 503 Staff",
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
            prefillEmployerId: null
          },
          employerObjects: [
            { id: "1", Name: "SEIU LOCAL 503 OPEU", Agency_Number__c: 700 }
          ]
        },
        apiSF: {
          createSFContact: createSFContactError,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
      };
      wrapper = setup(props);
      const result = await wrapper
        .instance()
        .prepForContact(formValues)
        .catch(err => console.log(err));

      expect(result.agencyNumber).toBe(700);
    });
  });
});
