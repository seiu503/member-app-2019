import React from "react";
import { shallow } from "enzyme";
import moment from "moment";
import "jest-canvas-mock";
import * as formElements from "../../../components/SubmissionFormElements";

import { SubmissionFormPage1Container } from "../../../containers/SubmissionFormPage1";

import { handleInput } from "../../../store/actions/apiSubmissionActions";

let wrapper;

let pushMock = jest.fn(),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  executeMock = jest.fn().mockImplementation(() => Promise.resolve()),
  handleUploadMock = jest.fn().mockImplementation(() => Promise.resolve({}));

let updateSFContactSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_CONTACT_SUCCESS", payload: {} })
  );

let updateSubmissionSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
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

let addSubmissionSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
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
    addSubmission: addSubmissionSuccess,
    updateSubmission: updateSubmissionSuccess
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

  describe("handleTab2", () => {
    test("`handleTab2` handles error if saveSignature fails", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const saveSignatureMock = jest
        .fn()
        .mockImplementation(() => Promise.reject("Error"));
      formElements.handleError = jest.fn();

      wrapper = setup();
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().saveSignature = saveSignatureMock;
      wrapper
        .instance()
        .handleTab2()
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBe(1);
        });
    });

    test("`handleTab2` handles error if getIframeURL fails", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const saveSignatureMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const getIframeURLMock = jest
        .fn()
        .mockImplementation(() => Promise.reject("Error"));
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          employerType: "community member"
        }
      };

      wrapper = setup(props);
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().saveSignature = saveSignatureMock;
      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.update();
      wrapper
        .instance()
        .handleTab2()
        .then(() => {
          return getIframeURLMock().then(async function() {
            await flushPromises();
            expect(formElements.handleError.mock.calls.length).toBe(1);
          });
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleTab2` calculates AFH dues rate if employerType === 'afh'", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const saveSignatureMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const calculateAFHDuesRateMock = jest.fn();
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          employerType: "adult foster home",
          preferredLanguage: "Spanish"
        }
      };

      wrapper = setup(props);
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().saveSignature = saveSignatureMock;
      wrapper.instance().calculateAFHDuesRate = calculateAFHDuesRateMock;
      wrapper
        .instance()
        .handleTab2()
        .then(() => {
          expect(calculateAFHDuesRateMock.mock.calls.length).toBe(1);
        });
    });

    test("`handleTab2` calls getSFDJRById if paymentRequired === true", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const saveSignatureMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const calculateAFHDuesRateMock = jest.fn();
      formElements.handleError = jest.fn();
      const getIframeURLMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const getSFDJRByIdMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ payload: {} }));
      let props = {
        formValues: {
          employerType: "adult foster home",
          preferredLanguage: "Spanish"
        },
        submission: {
          formPage1: {
            paymentRequired: true
          },
          payment: {
            memberShortId: "1234"
          }
        }
      };

      wrapper = setup(props);
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().saveSignature = saveSignatureMock;
      wrapper.instance().calculateAFHDuesRate = calculateAFHDuesRateMock;
      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.instance().getSFDJRById = getSFDJRByIdMock;
      wrapper
        .instance()
        .handleTab2()
        .then(() => {
          expect(getSFDJRByIdMock.mock.calls.length).toBe(1);
        });
    });

    test("`handleTab2` handles error if getSFDJRById throws", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const saveSignatureMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const calculateAFHDuesRateMock = jest.fn();
      formElements.handleError = jest.fn();
      const getIframeURLMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const getSFDJRByIdMock = jest
        .fn()
        .mockImplementation(() => Promise.reject("Error"));
      let props = {
        formValues: {
          employerType: "adult foster home",
          preferredLanguage: "Spanish"
        },
        submission: {
          formPage1: {
            paymentRequired: true
          },
          payment: {
            memberShortId: "1234"
          }
        }
      };

      wrapper = setup(props);
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().saveSignature = saveSignatureMock;
      wrapper.instance().calculateAFHDuesRate = calculateAFHDuesRateMock;
      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.instance().getSFDJRById = getSFDJRByIdMock;
      wrapper
        .instance()
        .handleTab2()
        .then(() => {
          expect(getSFDJRByIdMock.mock.calls.length).toBe(1);
        });
    });

    test("`handleTab2` handles error if getIframeURL throws", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const saveSignatureMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const calculateAFHDuesRateMock = jest.fn();
      formElements.handleError = jest.fn();
      const getIframeURLMock = jest
        .fn()
        .mockImplementation(() => Promise.reject("Error"));
      const getSFDJRByIdMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ payload: {} }));
      let props = {
        formValues: {
          employerType: "adult foster home",
          preferredLanguage: "Spanish"
        },
        submission: {
          formPage1: {
            paymentRequired: true
          },
          payment: {
            memberShortId: "1234"
          }
        }
      };

      wrapper = setup(props);
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().saveSignature = saveSignatureMock;
      wrapper.instance().calculateAFHDuesRate = calculateAFHDuesRateMock;
      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.instance().getSFDJRById = getSFDJRByIdMock;
      wrapper
        .instance()
        .handleTab2()
        .then(() => {
          expect(getSFDJRByIdMock.mock.calls.length).toBe(1);
        });
    });

    test("`handleTab2` handles error if createSubmission throws", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const saveSignatureMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const calculateAFHDuesRateMock = jest.fn();
      formElements.handleError = jest.fn();
      const getIframeURLMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      const getSFDJRByIdMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ payload: {} }));
      const createSubmissionMock = jest
        .fn()
        .mockImplementation(() => Promise.reject("Error"));
      let props = {
        formValues: {
          employerType: "adult foster home",
          preferredLanguage: "Spanish"
        },
        submission: {
          formPage1: {
            paymentRequired: true
          },
          payment: {
            memberShortId: "1234"
          }
        }
      };

      wrapper = setup(props);
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().saveSignature = saveSignatureMock;
      wrapper.instance().calculateAFHDuesRate = calculateAFHDuesRateMock;
      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.instance().getSFDJRById = getSFDJRByIdMock;
      wrapper.instance().createSubmission = createSubmissionMock;
      wrapper
        .instance()
        .handleTab2()
        .then(() => {
          expect(createSubmissionMock.mock.calls.length).toBe(1);
        });
    });
  });
});
