import React from "react";
import { shallow } from "enzyme";
import moment from "moment";

import "jest-canvas-mock";
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

  describe("handleDonationFrequencyChange", () => {
    beforeEach(() => {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve(""));
    });
    afterEach(() => {
      handleInputMock.mockClear();
      jest.restoreAllMocks();
    });
    test("`handleDonationFrequencyChange` returns without calling anything if !capeAmount && !capeAmountOther", () => {
      const props = {
        submission: {
          formPage1: {
            paymentRequired: false
          },
          payment: {
            activeMethodLast4: null
          },
          cape: {
            activeMethodLast4: "1234"
          }
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        formValues: {
          capeAmount: null,
          capeAmountOther: null
        }
      };
      wrapper = setup(props);
      wrapper.instance().handleDonationFrequencyChange();
      expect(handleInputMock).not.toHaveBeenCalled();
    });
    test("`handleDonationFrequencyChange` calls handleInput to set newCardNeeded to `false` if validMethod", () => {
      const props = {
        submission: {
          formPage1: {
            paymentRequired: true
          },
          payment: {
            activeMethodLast4: "1234",
            paymentErrorHold: false
          },
          cape: {
            activeMethodLast4: null
          }
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        formValues: {
          capeAmount: "Other",
          capeAmountOther: 10
        }
      };
      wrapper = setup(props);
      wrapper.instance().handleDonationFrequencyChange("Monthly");
      expect(handleInputMock).toHaveBeenCalledWith({
        target: { name: "newCardNeeded", value: false }
      });
    });
    test("`handleDonationFrequencyChange` calls handleInput to set paymentRequired to `true` if donationFrequency === 'One-Time'", async () => {
      const props = {
        submission: {
          formPage1: {
            paymentRequired: true,
            donationFrequency: "One-Time"
          },
          payment: {
            activeMethodLast4: "1234",
            paymentErrorHold: false
          },
          cape: {
            activeMethodLast4: null
          }
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        formValues: {
          capeAmount: 10
        }
      };
      wrapper = setup(props);
      const getIframeURLMock = jest
        .fn()
        .mockImplementation(() => console.log("getIframeURLMock"));
      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.instance().handleDonationFrequencyChange("One-Time");
      expect(handleInputMock.mock.calls[0][0]).toEqual({
        target: { name: "newCardNeeded", value: false }
      });
      await handleInputMock();
      await handleInputMock();
      expect(getIframeURLMock.mock.calls.length).toBe(1);
    });
    test("`handleDonationFrequencyChange` calls handleInput to set paymentRequired to `false` if dFrequency === 'Monthly' && checkoff", async () => {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      const props = {
        submission: {
          formPage1: {
            paymentRequired: false,
            donationFrequency: "Monthly",
            checkoff: true
          },
          payment: {
            activeMethodLast4: "1234",
            paymentErrorHold: true // coverage for !validMethod edge case
          },
          cape: {
            activeMethodLast4: null
          }
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        formValues: {
          capeAmount: 10
        }
      };
      wrapper = setup(props);
      const getIframeURLMock = jest.fn();
      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.instance().handleDonationFrequencyChange("Monthly");
      expect(handleInputMock.mock.calls[0][0]).toEqual({
        target: { name: "paymentRequired", value: false }
      });
    });
  });
  test("`handleDonationFrequencyChange` does not call handleInput if dFrequency === 'Monthly' && !checkoff", async () => {
    handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
    const props = {
      submission: {
        formPage1: {
          paymentRequired: false,
          donationFrequency: "Monthly",
          checkoff: false
        },
        payment: {
          activeMethodLast4: "1234",
          paymentErrorHold: true // coverage for !validMethod edge case
        },
        cape: {
          activeMethodLast4: null
        }
      },
      apiSubmission: {
        handleInput: handleInputMock
      },
      formValues: {
        capeAmount: 10
      }
    };
    wrapper = setup(props);
    const getIframeURLMock = jest.fn();
    wrapper.instance().getIframeURL = getIframeURLMock;
    wrapper.instance().handleDonationFrequencyChange("Monthly");
    expect(handleInputMock.mock.calls.length).toBe(0);
  });
});
