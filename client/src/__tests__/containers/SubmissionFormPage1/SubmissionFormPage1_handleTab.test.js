import React from "react";
import { shallow } from "enzyme";
import moment from "moment";
import "jest-canvas-mock";
import * as formElements from "../../../components/SubmissionFormElements";

import { SubmissionFormPage1Container } from "../../../containers/SubmissionFormPage1";

import { handleInput } from "../../../store/actions/apiSubmissionActions";

let wrapper, addSubmissionMock, handleUploadMock;

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

let refreshRecaptchaMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));

let createSubmissionSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "CREATE_SUBMISSION_SUCCESS" })
  );

let sigUrl = "http://www.example.com/png";
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

const changeTabMock = jest.fn().mockImplementation(() => Promise.resolve());

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
    addSubmission: () => Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" }),
    updateSubmission: () =>
      Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
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
  createSubmission: createSubmissionSuccess,
  changeTab: changeTabMock
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

  describe("handleTab", () => {
    test("`handleTab` calls saveLegalLanguage and saveSignature if newValue === 2", async function() {
      let saveLegalLanguageMock = jest.fn();
      let saveSignatureMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      let handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        }
      };

      wrapper = setup(props);
      wrapper.instance().saveLegalLanguage = saveLegalLanguageMock;
      wrapper.instance().saveSignature = saveSignatureMock;
      wrapper.instance().handleUpload = handleUploadMock;
      wrapper.update();
      wrapper
        .instance()
        .handleTab(2)
        .then(() => {
          expect(saveLegalLanguageMock.mock.calls.length).toBe(1);
          expect(saveSignatureMock.mock.calls.length).toBe(1);
          changeTabMock.mockClear();
        });
    });

    test("`handleTab` called with 2 calls handleTab2", () => {
      wrapper = setup();
      wrapper.instance().state.signatureType = "write";
      const handleTab2Mock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      wrapper.instance().handleTab2 = handleTab2Mock;
      wrapper
        .instance()
        .handleTab(2)
        .then(() => {
          return createSubmissionSuccess().then(() => {
            expect(handleTab2Mock.mock.calls.length).toBe(1);
            changeTabMock.mockClear();
          });
        })
        .catch(err => console.log(err));
    });

    test("`handleTab` called with 0 calls changeTab prop", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));

      wrapper = setup();
      wrapper.instance().state.signatureType = "write";
      wrapper.instance().handleUpload = handleUploadMock();
      wrapper
        .instance()
        .handleTab(0)
        .then(() => {
          expect(changeTabMock.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });

    test("`handleTab` called with 1 calls handleTab1", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      addSubmissionMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
        );
      let props = {
        apiSubmission: { handleInput, addSubmission: addSubmissionMock },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFContact: createSFContactSuccess,
          updateSFContact: updateSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        },
        formValues: {
          signature: "typed signature"
        },
        reCaptchaRef: {
          current: {
            getValue: jest.fn().mockImplementation(() => "ref value")
          }
        }
      };
      const handleTab1Mock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      wrapper = setup(props);
      wrapper.instance().state.signatureType = "write";
      wrapper.instance().handleTab1 = handleTab1Mock;
      wrapper.update();
      wrapper
        .instance()
        .handleTab(1)
        .then(() => {
          expect(handleTab1Mock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleTab` handles error if handleTab1 fails", () => {
      const handleTab1Mock = jest
        .fn()
        .mockImplementation(() => Promise.reject("Error"));
      let props = {
        apiSubmission: { handleInput, addSubmission: addSubmissionMock },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFContact: createSFContactSuccess,
          updateSFContact: updateSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        },
        formValues: {
          signature: "typed signature"
        },
        reCaptchaRef: {
          current: {
            getValue: jest.fn().mockImplementation(() => "ref value")
          }
        }
      };
      wrapper = setup(props);
      wrapper.instance().state.signatureType = "write";
      wrapper.instance().handleTab1 = handleTab1Mock;
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      wrapper.update();
      wrapper
        .instance()
        .handleTab(1)
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleTab` handles error if handleTab2 fails", () => {
      const handleTab2Mock = jest
        .fn()
        .mockImplementation(() => Promise.reject("Error"));
      let props = {
        apiSubmission: { handleInput, addSubmission: addSubmissionMock },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFContact: createSFContactSuccess,
          updateSFContact: updateSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        },
        formValues: {
          signature: "typed signature"
        },
        reCaptchaRef: {
          current: {
            getValue: jest.fn().mockImplementation(() => "ref value")
          }
        }
      };
      wrapper = setup(props);
      wrapper.instance().state.signatureType = "write";
      wrapper.instance().handleTab2 = handleTab2Mock;
      formElements.handleError = handleErrorMock;
      wrapper.update();
      wrapper
        .instance()
        .handleTab(2)
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBeGreaterThan(1);
        })
        .catch(err => {
          console.log(err);
        });
    });
  });
});
