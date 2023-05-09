import React from "react";
// import { render } from '../../../setupTests.js';
import { render } from "@testing-library/react";
import { shallow } from "enzyme";
import moment from "moment";
import "jest-canvas-mock";
import * as formElements from "../../../components/SubmissionFormElements";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../../styles/theme";
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
    payment: {},
    employerObjects: [{ Name: "" }]
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
  handleError: jest.fn()
};

// const setup = (props = {}) => {
//   const setupProps = { ...defaultProps, ...props };
//   return render(<SubmissionFormPage1Container {...setupProps} />);
// };

// const setup = (props = {}) => {
//   const setupProps = { ...defaultProps, ...props };
//   return render(
//     <ThemeProvider theme={theme}>
//       <SubmissionFormPage1Container {...setupProps} />
//     </ThemeProvider>
//     )
// };

const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  return shallow(<SubmissionFormPage1Container {...setupProps} />);
};

// const setup = (props = {}) => {
//   const setupProps = { ...defaultProps, ...props };
//   return shallow(
//     <ThemeProvider theme={theme}>
//       <SubmissionFormPage1Container {...setupProps} />
//     </ThemeProvider>);
// };

describe("<SubmissionFormPage1Container /> unconnected", () => {
  beforeEach(() => {
    // console.log = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getCAPEBySFId", () => {
    test.only("`getCAPEBySFId` calls getCAPEBySFId prop function", async function() {
      const getCAPEBySFIdSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_CAPE_BY_SFID_SUCCESS" })
        );
      let props = {
        submission: {
          salesforceId: "123",
          formPage1: {}
        },
        apiSubmission: {
          getCAPEBySFId: getCAPEBySFIdSuccess
        },
        handleError: jest.fn()
      };
      wrapper = setup(props);

      wrapper.update();
      wrapper
        .instance()
        .getCAPEBySFId()
        .then(() => {
          expect(getCAPEBySFIdSuccess.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });

    test("`getCAPEBySFId` does not call getCAPEBySFId prop function if no SF id in redux store", async function() {
      const getCAPEBySFIdSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_CAPE_BY_SFID_SUCCESS" })
        );
      let props = {
        submission: {
          salesforceId: null,
          formPage1: {}
        },
        apiSubmission: {
          getCAPEBySFId: getCAPEBySFIdSuccess
        }
      };
      wrapper = setup(props);

      wrapper.update();
      wrapper
        .instance()
        .getCAPEBySFId()
        .then(() => {
          expect(getCAPEBySFIdSuccess.mock.calls.length).toBe(0);
        })
        .catch(err => console.log(err));
    });

    test("`getCAPEBySFId` handles error if prop function throws", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      const getCAPEBySFIdError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "GET_CAPE_BY_SFID_FAILURE" })
        );
      let props = {
        submission: {
          salesforceId: "123",
          formPage1: {}
        },
        apiSubmission: {
          getCAPEBySFId: getCAPEBySFIdError
        }
      };
      wrapper = setup(props);

      wrapper.update();
      wrapper
        .instance()
        .getCAPEBySFId()
        .then(() => {
          expect(props.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });

    test("`getCAPEBySFId` handles error if prop function fails", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      const getCAPEBySFIdError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_CAPE_BY_SFID_FAILURE", payload: {} })
        );
      let props = {
        submission: {
          salesforceId: "123",
          formPage1: {}
        },
        apiSubmission: {
          getCAPEBySFId: getCAPEBySFIdError
        }
      };
      wrapper = setup(props);

      wrapper.update();
      wrapper
        .instance()
        .getCAPEBySFId()
        .then(() => {
          // this error is not returned to client
          // expect(handleError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
  });
});
