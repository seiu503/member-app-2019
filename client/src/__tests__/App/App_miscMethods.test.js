import React from "react";
import { shallow } from "enzyme";
import moment from "moment";

import "jest-canvas-mock";
// import * as formElements from "../../components/SubmissionFormElements";

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
  },
  lookupSFContact: lookupSFContactSuccess
};

const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  return shallow(<AppUnconnected {...setupProps} />);
};

describe("<App />", () => {
  beforeEach(() => {
    // console.log = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("misc methods", () => {
    beforeEach(() => {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve(""));
    });
    afterEach(() => {
      handleInputMock.mockClear();
    });

    test("`prepForContact` sets employerId conditionally based on prefillEmployerChanged state key", () => {
      const props = {
        submission: {
          formPage1: {
            prefillEmployerId: "1234"
          }
        }
      };
      const body = {
        firstName: "firstName",
        lastName: "lastName",
        homeStreet: "homeStreet",
        homeCity: "city",
        homeState: "state",
        homeZip: "zip",
        birthdate: new Date(),
        homeEmail: "test@test.com",
        mobilePhone: "1234567890",
        preferredLanguage: "Spanish",
        textAuthOptOut: false,
        capeAmountOther: 11,
        employerName: "homecare"
      };
      wrapper = setup(props);
      wrapper.instance().state.prefillEmployerChanged = true;
      wrapper.update();
      wrapper.instance().prepForContact(body);
    });

    test("`setCAPEOptions` calls this.props.apiSubmission.setCAPEOptions", () => {
      const setCAPEOptionsMock = jest.fn();
      const props = {
        apiSubmission: {
          setCAPEOptions: setCAPEOptionsMock
        },
        submission: {
          payment: {
            currentCAPEFromSF: 20
          },
          formPage1: {}
        }
      };
      wrapper = setup(props);
      wrapper.instance().setCAPEOptions();
      expect(setCAPEOptionsMock).toHaveBeenCalled();
    });

    test("`prepForSubmission` sets salesforceId conditionally based on query string, redux store, and passed values", () => {
      const props = {
        submission: {
          salesforceId: "1234",
          formPage1: {
            legalLanguage: "abc"
          }
        },
        location: {
          search: "&cId=1234"
        }
      };
      const body = {
        firstName: "firstName",
        lastName: "lastName",
        homeStreet: "homeStreet",
        homeCity: "city",
        homeState: "state",
        homeZip: "zip",
        birthdate: new Date(),
        homeEmail: "test@test.com",
        mobilePhone: "1234567890",
        preferredLanguage: "Spanish",
        textAuthOptOut: false,
        capeAmountOther: 11,
        employerName: "homecare"
      };
      wrapper = setup(props);
      wrapper.instance().prepForSubmission(body);
    });
  });
});
