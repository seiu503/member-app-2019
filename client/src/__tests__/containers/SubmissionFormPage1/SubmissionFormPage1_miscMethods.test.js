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
      innerHTML: "legal",
      innerText: "legal"
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
  lookupSFContact: lookupSFContactSuccess,
  translate: jest.fn(),
  handleError: jest.fn()
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

  describe("misc methods", () => {
    beforeEach(() => {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve(""));
    });
    afterEach(() => {
      handleInputMock.mockClear();
    });

    test("`handleOpen` opens modal", () => {
      wrapper = setup();
      wrapper.instance().handleOpen();
      expect(wrapper.instance().state.open).toBe(true);
    });

    test("`handleCAPEOpen` opens alert dialog", () => {
      wrapper = setup();
      wrapper.instance().handleCAPEOpen();
      expect(wrapper.instance().state.capeOpen).toBe(true);
    });

    test("`handleClose` closes modal", () => {
      wrapper = setup();
      wrapper.instance().handleClose();
      expect(wrapper.instance().state.open).toBe(false);
    });

    test("`handleEmployerChange` calls handleInput to set prefillEmployerChanged to true", () => {
      const props = {
        apiSubmission: {
          handleInput: handleInputMock
        }
      };
      wrapper = setup(props);
      wrapper.instance().handleEmployerChange();
      expect(handleInputMock.mock.calls[0][0]).toEqual({
        target: { name: "prefillEmployerChanged", value: true }
      });
    });

    test("`handleCloseAndClear` closes modal, clears form, resets window.location", async () => {
      let originalReplaceState = window.history.replaceState;
      let replaceStateMock = jest.fn();
      clearFormMock = jest.fn();
      window.history.replaceState = replaceStateMock;
      wrapper = setup();
      wrapper.instance().props.apiSubmission.clearForm = clearFormMock;
      await wrapper.instance().handleCloseAndClear();
      expect(wrapper.instance().state.open).toBe(false);
      expect(clearFormMock.mock.calls.length).toBe(1);

      window.history.replaceState = originalReplaceState;
    });

    test("`handleCAPEClose` closes alert dialog", () => {
      wrapper = setup();
      wrapper.instance().handleCAPEClose();
      expect(wrapper.instance().state.capeOpen).toBe(false);
    });

    test("`closeDialog` calls handleCAPEClose and this.props.history.push", () => {
      const props = {
        history: {
          push: pushMock
        }
      };
      wrapper = setup(props);
      wrapper.instance().closeDialog();
      expect(wrapper.instance().state.capeOpen).toBe(false);
      expect(pushMock).toHaveBeenCalled();
    });

    test("`checkCAPEPaymentLogic` sets displayCAPEPaymentFields to true and calls handleEmployerTypeChange", async () => {
      const handleEmployerTypeChangeMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(""));
      const props = {
        formValues: {
          employerType: "retired",
          donationFrequency: "Monthly"
        }
      };
      wrapper = setup(props);
      wrapper.instance().handleEmployerTypeChange = handleEmployerTypeChangeMock;
      wrapper.update();
      await wrapper.instance().checkCAPEPaymentLogic();
      expect(handleEmployerTypeChangeMock).toHaveBeenCalled();
      expect(wrapper.instance().state.displayCAPEPaymentFields).toBe(true);
    });

    test("`calculateAFHDuesRate` calls handleInput", async function() {
      let props = {
        formValues: {
          afhDuesRate: null
        },
        apiSubmission: {
          handleInput: handleInputMock
        }
      };
      wrapper = setup(props);
      const residents = 1;
      await wrapper.instance().calculateAFHDuesRate(residents);
      expect(handleInputMock.mock.calls[0][0]).toEqual({
        target: { name: "afhDuesRate", value: 17.59 }
      });
    });

    test("`saveLegalLanguage` saves legal language to formValues", async function() {
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
        }
      };
      wrapper = setup(props);

      wrapper.update();
      wrapper
        .instance()
        .saveLegalLanguage()
        .then(() => {
          expect(handleInputMock.mock.calls[0][0]).toEqual({
            target: { name: "legalLanguage", value: "legal<hr>deposit<hr>pay" }
          });
        })
        .catch(err => console.log(err));
    });

    test("`generateCAPEBody` displays CAPE Payment fields if no donation amount chosen", async () => {
      wrapper = setup();
      await wrapper.instance().generateCAPEBody(null, null);
      expect(wrapper.instance().state.displayCAPEPaymentFields).toBe(true);
    });
  });
});
