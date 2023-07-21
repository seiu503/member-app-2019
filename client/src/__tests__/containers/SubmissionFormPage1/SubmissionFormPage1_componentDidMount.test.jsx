import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "@testing-library/jest-dom/extend-expect";
import "@testing-library/jest-dom";
import { within } from "@testing-library/dom";
import {
  fireEvent,
  render,
  screen,
  cleanup,
  waitFor
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { employersPayload, storeFactory } from "../../../utils/testUtils";
import { rest } from "msw";
import { setupServer } from "msw/node";
import "jest-canvas-mock";
import * as formElements from "../../../components/SubmissionFormElements";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../../../styles/theme";
import {
  generatePage2Validate,
  generateSubmissionBody
} from "../../../../../app/utils/fieldConfigs";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../translations/i18n";
import handlers from "../../../mocks/handlers";
let pushMock = jest.fn(),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  handleErrorMock = jest.fn(),
  executeMock = jest.fn().mockImplementation(() => Promise.resolve());

const testData = generatePage2Validate();
const server = setupServer(...handlers);

import { SubmissionFormPage1Container } from "../../../containers/SubmissionFormPage1";

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
    getSFEmployers: () => Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" }),
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
    current: {
      execute: executeMock
    }
  },
  refreshRecaptcha: refreshRecaptchaMock,
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
  handleError: jest.fn(),
  renderHeadline: jest.fn(),
  t: text => text,
  renderBodyCopy: jest.fn()
};

let handleSubmit;
const initialState = {};
const store = storeFactory(initialState);
const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props, handleSubmit };
  return render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <I18nextProvider i18n={i18n} defaultNS={"translation"}>
          <SubmissionFormPage1Container {...setupProps} />
        </I18nextProvider>
      </Provider>
    </ThemeProvider>
  );
};

describe("<SubmissionFormPage1Container /> unconnected", () => {
  beforeEach(() => {
    handleSubmit = fn => fn;
  });

  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

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
          getSFContactByDoubleId: getSFContactByDoubleIdSuccess,
          getSFEmployers: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "GET_SF_EMPLOYERS_SUCCESS",
              payload: [...employersPayload]
            })
          )
        },
        submission: {
          formPage1: {
            firstName: "test",
            lastName: "test"
          },
          cape: {
            monthlyOptions: []
          },
          payment: {}
        }
      };

      const { getByTestId } = setup(props);
      const component = getByTestId("component-submissionformpage1");
      expect(component).toBeInTheDocument();
      expect(getSFContactByDoubleIdSuccess).toHaveBeenCalled();
    });

    test("does not call `getSFContactByDoubleId` on componentDidMount if no aId in query", () => {
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
          search: "cId=1"
        },
        apiSF: {
          getSFContactByDoubleId: getSFContactByDoubleIdSuccess,
          getSFEmployers: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "GET_SF_EMPLOYERS_SUCCESS",
              payload: [...employersPayload]
            })
          )
        },
        submission: {
          formPage1: {
            firstName: "test",
            lastName: "test"
          },
          cape: {
            monthlyOptions: []
          },
          payment: {}
        }
      };

      const { getByTestId } = setup(props);
      const component = getByTestId("component-submissionformpage1");
      expect(component).toBeInTheDocument();
      expect(getSFContactByDoubleIdSuccess).not.toHaveBeenCalled();
    });

    test("clears form if `getSFContactByDoubleId` fails", async () => {
      clearFormMock = jest.fn();
      getSFContactByDoubleIdError = () =>
        Promise.resolve({ type: "GET_SF_CONTACT_DID_FAILURE" });
      let props = {
        ...defaultProps,
        location: {
          search: "cId=1&aId=2"
        },
        apiSF: {
          ...defaultProps.apiSF,
          getSFContactByDoubleId: getSFContactByDoubleIdError
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          clearForm: clearFormMock
        }
      };

      const { getByTestId } = setup(props);
      const component = await getByTestId("component-submissionformpage1");
      expect(component).toBeInTheDocument();
      await waitFor(() => expect(clearFormMock).toHaveBeenCalled());
    });

    test("clears form if no first or last name in store", async () => {
      clearFormMock = jest.fn();
      getSFContactByDoubleIdError = () =>
        Promise.resolve({ type: "GET_SF_CONTACT_DID_FAILURE" });
      let props = {
        ...defaultProps,
        location: {
          search: "cId=1&aId=2"
        },
        submission: {
          formPage1: {
            firstName: null,
            lastName: null
          }
        },
        apiSF: {
          ...defaultProps.apiSF
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          clearForm: clearFormMock
        }
      };

      const { getByTestId } = setup(props);
      const component = await getByTestId("component-submissionformpage1");
      expect(component).toBeInTheDocument();
      await waitFor(() => expect(clearFormMock).toHaveBeenCalled());
    });

    test("handles error if `getSFContactByDoubleId` throws", async () => {
      const oldWindowLocation = window.location;
      const oldWindowHistory = window.history;
      delete window.location;
      delete window.history;
      window.location = Object.assign(new URL("https://test.com"));
      window.history = {
        replaceState: jest.fn()
      };
      clearFormMock = jest.fn(() => console.log("clearFormMock"));
      getSFContactByDoubleIdError = () =>
        Promise.reject("getSFContactByDoubleIdError");
      let props = {
        ...defaultProps,
        location: {
          search: "cId=1&aId=2"
        },
        apiSF: {
          ...defaultProps.apiSF,
          getSFContactByDoubleId: getSFContactByDoubleIdError
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          clearForm: clearFormMock
        },
        handleError: handleErrorMock
      };

      await setup(props);
      await waitFor(() =>
        expect(handleErrorMock).toHaveBeenCalledWith(
          "getSFContactByDoubleIdError"
        )
      );
      window.location = oldWindowLocation;
      window.history = oldWindowHistory;
    });
  });
});
