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

let getSFContactByDoubleIdError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "GET_SF_CONTACT_DID_FAILURE", payload: {} })
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
  direct_pay: {
    current: {
      innerHTML: "pay"
    }
  },
  actions: {
    setSpinner: jest.fn()
  },
  headline: {
    id: 1,
    text: ""
  },
  image: {
    id: 2,
    url: "blah"
  },
  body: {
    id: 3,
    text: ""
  },
  setCAPEOptions: jest.fn(),
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

  describe("componentDidMount", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    test("calls `getSFContactByDoubleId` on componentDidMount if id in query", () => {
      getSFContactByDoubleIdSuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "GET_SF_CONTACT_DID_SUCCESS",
          payload: {
            firstName: "test",
            lastName: "test"
          }
        })
      );
      let props = {
        location: {
          search: "cId=1&aId=2"
        },
        apiSF: {
          getSFContactByDoubleId: getSFContactByDoubleIdSuccess
        },
        submission: {
          formPage1: {
            firstName: "test",
            lastName: "test"
          },
          cape: {},
          payment: {}
        }
      };

      wrapper = setup(props);
      wrapper.instance().componentDidMount();
      expect(getSFContactByDoubleIdSuccess).toHaveBeenCalled();
    });

    test("clears form if `getSFContactByDoubleId` fails", () => {
      formElements.handleError = jest.fn();
      getSFContactByDoubleIdError = () =>
        Promise.resolve({ type: "GET_SF_CONTACT_DID_FAILURE" });
      let props = {
        location: {
          search: "cId=1&aId=2"
        },
        apiSF: {
          getSFContactByDoubleId: getSFContactByDoubleIdError
        }
      };

      wrapper = setup(props);

      wrapper.instance().componentDidMount();
      return getSFContactByDoubleIdError()
        .then(() => {
          expect(clearFormMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("handles error if `getSFContactByDoubleId` throws", () => {
      getSFContactByDoubleIdError = () =>
        Promise.reject({ type: "GET_SF_CONTACT_DID_FAILURE" });
      formElements.handleError = jest.fn();
      let props = {
        location: {
          search: "cId=1&aId=2"
        },
        apiSF: {
          getSFContactByDoubleId: getSFContactByDoubleIdError
        },
        setCAPEOptions: jest.fn()
      };

      wrapper = setup(props);

      wrapper.instance().componentDidMount();
      return getSFContactByDoubleIdError()
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("calls `handleOpen` on componentDidMount if firstName and lastName returned from getSFContactByDoubleId", () => {
      getSFContactByDoubleIdSuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "GET_SF_CONTACT_DID_SUCCESS",
          payload: {
            firstName: "test",
            lastName: "test"
          }
        })
      );
      let props = {
        location: {
          search: "cId=1&aId=2"
        },
        apiSF: {
          getSFContactByDoubleId: getSFContactByDoubleIdSuccess
        },
        apiSubmission: {
          setCAPEOptions: jest.fn()
        },
        submission: {
          formPage1: {
            firstName: "test",
            lastName: "test"
          },
          payment: {
            currentCAPEFromSF: 0
          },
          cape: {}
        }
      };

      wrapper = setup(props);

      let handleOpenMock = jest.fn();
      wrapper.instance().handleOpen = handleOpenMock;

      wrapper.instance().componentDidMount();
      return getSFContactByDoubleIdSuccess()
        .then(() => {
          expect(handleOpenMock).toHaveBeenCalled();
        })
        .catch(err => {
          console.log(err);
        });
    });
  });
});
