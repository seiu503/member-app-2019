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

  describe("misc methods", () => {
    beforeEach(() => {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve(""));
    });
    afterEach(() => {
      handleInputMock.mockClear();
    });

    test("`handleOpen` opens modal", () => {
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().handleOpen();
      expect(wrapper.instance().state.open).toBe(true);
    });

    test("`handleCAPEOpen` opens alert dialog", () => {
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().handleCAPEOpen();
      expect(wrapper.instance().state.capeOpen).toBe(true);
    });

    test("`handleClose` closes modal", () => {
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().handleClose();
      expect(wrapper.instance().state.open).toBe(false);
    });

    test("`handleEmployerChange` sets prefillEmployerChanged state to true", () => {
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().handleEmployerChange();
      expect(wrapper.instance().state.prefillEmployerChanged).toBe(true);
    });

    test("`handleCloseAndClear` closes modal, clears form, resets window.location", async () => {
      let originalReplaceState = window.history.replaceState;
      let replaceStateMock = jest.fn();
      clearFormMock = jest.fn();
      window.history.replaceState = replaceStateMock;
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().props.apiSubmission.clearForm = clearFormMock;
      await wrapper.instance().handleCloseAndClear();
      expect(wrapper.instance().state.open).toBe(false);
      expect(clearFormMock.mock.calls.length).toBe(1);

      window.history.replaceState = originalReplaceState;
    });

    test("`handleCAPEClose` closes alert dialog", () => {
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().handleCAPEClose();
      expect(wrapper.instance().state.capeOpen).toBe(false);
    });

    test("`closeDialog` calls handleCAPEClose and this.props.history.push", () => {
      const props = {
        history: {
          push: pushMock
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().closeDialog();
      expect(wrapper.instance().state.capeOpen).toBe(false);
      expect(pushMock).toHaveBeenCalled();
    });

    test("`mobilePhoneOnBlur` calls handleEmployerTypeChange", () => {
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      const handleEmployerTypeChangeMock = jest.fn();
      wrapper.instance().handleEmployerTypeChange = handleEmployerTypeChangeMock;
      wrapper.instance().mobilePhoneOnBlur();
      expect(handleEmployerTypeChangeMock).toHaveBeenCalled();
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
          }
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().setCAPEOptions();
      expect(setCAPEOptionsMock).toHaveBeenCalled();
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

    test("`checkCAPEPaymentLogic` sets displayCAPEPaymentFields to true and calls handleEmployerTypeChange and handleDonationFrequencyChange", async () => {
      const handleEmployerTypeChangeMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(""));
      const handleDonationFrequencyChangeMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(""));
      const props = {
        formValues: {
          employerType: "retired",
          donationFrequency: "Monthly"
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().handleEmployerTypeChange = handleEmployerTypeChangeMock;
      wrapper.instance().handleDonationFrequencyChange = handleDonationFrequencyChangeMock;
      wrapper.update();
      await wrapper.instance().checkCAPEPaymentLogic();
      expect(handleEmployerTypeChangeMock).toHaveBeenCalled();
      expect(handleDonationFrequencyChangeMock).toHaveBeenCalled();
      expect(wrapper.instance().state.displayCAPEPaymentFields).toBe(true);
    });

    test("`clearSignature` calls sigBox.clear", () => {
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().clearSignature();
      expect(clearSigBoxMock.mock.calls.length).toBe(1);
    });

    test("`trimSignature` calls sigBox.toDataURL", () => {
      const dataURItoBlobMock = jest.fn();
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().dataURItoBlob = dataURItoBlobMock;
      wrapper.instance().trimSignature();
      expect(toDataURLMock.mock.calls.length).toBe(1);
      expect(dataURItoBlobMock.mock.calls.length).toBe(1);
    });

    test("`trimSignature` handles error if sigbox is blank", () => {
      toDataURLMock = jest.fn().mockImplementation(() => formElements.blankSig);
      const dataURItoBlobMock = jest.fn();
      const props = {
        sigBox: {
          current: {
            toDataURL: toDataURLMock
          }
        }
      };
      wrapper = setup(props);
      wrapper.instance().dataURItoBlob = dataURItoBlobMock;
      wrapper.instance().trimSignature();
      expect(toDataURLMock.mock.calls.length).toBe(1);
      expect(dataURItoBlobMock.mock.calls.length).toBe(0);
      expect(handleErrorMock.mock.calls.length).toBe(1);
    });

    test("`dataURItoBlob` returns Blob", () => {
      let props = {
        legal_language: {
          current: {
            innerHTML: ""
          }
        },
        direct_deposit: {
          current: {
            innerHTML: ""
          }
        },
        direct_pay: {
          current: {
            innerHTML: ""
          }
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      const testBlob = wrapper.instance().dataURItoBlob(fakeDataURI);
      expect(typeof testBlob).toBe("object");
      expect(testBlob.type).toBe("image/jpeg");
    });

    test("`toggleSignatureInputType` changes signature type in state", async function() {
      wrapper = setup();
      wrapper.instance().state.signatureType = "draw";
      await wrapper.instance().toggleSignatureInputType();
      await wrapper.update();
      expect(wrapper.state("signatureType")).toEqual("write");
      await wrapper.instance().toggleSignatureInputType();
      await wrapper.update();
      expect(wrapper.state("signatureType")).toEqual("draw");
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
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

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
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      await wrapper.instance().generateCAPEBody(null, null);
      expect(wrapper.instance().state.displayCAPEPaymentFields).toBe(true);
    });
  });
});
