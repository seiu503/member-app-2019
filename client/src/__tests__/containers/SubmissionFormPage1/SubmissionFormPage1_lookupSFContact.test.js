import React from "react";
import { shallow } from "enzyme";
import moment from "moment";

import "jest-canvas-mock";
import * as formElements from "../../../components/SubmissionFormElements";

import { SubmissionFormPage1Container } from "../../../containers/SubmissionFormPage1";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

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

global.scrollTo = jest.fn();

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

  describe("lookupSFContact", () => {
    test("`lookupSFContact` calls lookupSFContact prop if required fields populated", async function() {
      let props = {
        formValues: {
          firstName: "string",
          lastName: "string",
          employerName: "homecare",
          homeEmail: "test@test.com"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: null
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          lookupSFContact: lookupSFContactSuccess
        }
      };
      wrapper = setup(props);
      wrapper.instance().setCAPEOptions = jest.fn();

      wrapper.update();
      wrapper
        .instance()
        .lookupSFContact()
        .then(() => {
          expect(lookupSFContactSuccess.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`lookupSFContact` handles error if lookupSFContact prop throws", async function() {
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      let props = {
        formValues: {
          firstName: "string",
          lastName: "string",
          employerName: "homecare",
          homeEmail: "test@test.com"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: null,
          formPage1: {
            prefillEmployerId: "123"
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          lookupSFContact: lookupSFContactError
        }
      };
      wrapper = setup(props);
      wrapper.instance().setCAPEOptions = jest.fn();

      // wrapper.update();
      wrapper
        .instance()
        .lookupSFContact()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`lookupSFContact` calls createSFContact if lookupSFContact finds no match", async function() {
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          firstName: "string",
          lastName: "string",
          employerName: "homecare",
          homeEmail: "test@test.com"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: null,
          formPage1: {
            prefillEmployerId: null
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          lookupSFContact: lookupSFContactSuccess
        }
      };
      wrapper = setup(props);
      let createSFContactMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      wrapper.instance().setCAPEOptions = jest.fn();
      wrapper.instance().createSFContact = createSFContactMock;

      wrapper.update();
      wrapper
        .instance()
        .lookupSFContact()
        .then(async () => {
          await lookupSFContactSuccess;
          expect(createSFContactMock.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`lookupSFContact` handles error if createSFContact throws", async function() {
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          firstName: "string",
          lastName: "string",
          employerName: "homecare",
          homeEmail: "test@test.com"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: null,
          formPage1: {
            prefillEmployerId: "123"
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          lookupSFContact: lookupSFContactSuccess
        }
      };
      wrapper = setup(props);
      let createSFContactMock = jest
        .fn()
        .mockImplementation(() => Promise.reject("Error"));
      wrapper.instance().setCAPEOptions = jest.fn();
      wrapper.instance().createSFContact = createSFContactMock;

      wrapper.update();
      wrapper
        .instance()
        .lookupSFContact()
        .then(async () => {
          await lookupSFContactSuccess;
          await createSFContactMock;
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`lookupSFContact` doesn't call createSFContact if salesforceId in redux store", async function() {
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          firstName: "string",
          lastName: "string",
          employerName: "homecare",
          homeEmail: "test@test.com"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "1",
          formPage1: {
            prefillEmployerId: null
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          lookupSFContact: lookupSFContactSuccess
        }
      };
      wrapper = setup(props);
      let createSFContactMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      wrapper.instance().setCAPEOptions = jest.fn();
      wrapper.instance().createSFContact = createSFContactMock;

      wrapper.update();
      wrapper
        .instance()
        .lookupSFContact()
        .then(async () => {
          await lookupSFContactSuccess;
          expect(createSFContactMock.mock.calls.length).toBe(0);
        })
        .catch(err => console.log(err));
    });
  });
});
