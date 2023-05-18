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

let createSFCAPESuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "CREATE_SF_CAPE_SUCCESS",
    payload: { salesforce_id: "123" }
  })
);

let createSFContactError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "CREATE_SF_CONTACT_FAILURE", payload: {} })
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

let getSFEmployersSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "GET_SF_EMPLOYERS_SUCCESS",
    payload: { ...employersPayload }
  })
);

let refreshRecaptchaMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));

global.scrollTo = jest.fn();

let formValues;

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
    getSFEmployers: getSFEmployersSuccess,
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
  cape_legal: {
    current: {
      innerHTML: "cape"
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
  translate: jest.fn(),
  renderBodyCopy: jest.fn(),
  capeObject: {}
};

let handleSubmit;
const initialState = {};
const store = storeFactory(initialState);
const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props, handleSubmit };
  return render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <SubmissionFormPage1Container {...setupProps} />
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

  // test is passing but not sure if it provides coverage of that branch. have tracked it through line 403 of
  // generateCAPEBody, not sure what's happening after value is returned to createCAPE. may need to rewrite for coverage
  describe("createCAPE", () => {
    test("`createCAPE` handles case if no CAPE body generated", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          employerName: "sdjflk",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English",
          capeAmount: 1
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            prefillEmployerId: null
          },
          employerObjects: [{ Id: "1", Name: "SEIU LOCAL 503 OPEU" }]
        },
        apiSF: {
          createSFContact: createSFContactError,
          createSFCAPE: () =>
            Promise.resolve({
              type: "GET_SF_EMPLOYERS_SUCCESS",
              payload: { cape_id: "123" }
            }),
          getSFEmployers: () =>
            Promise.resolve({
              type: "GET_SF_EMPLOYERS_SUCCESS",
              payload: { ...employersPayload }
            })
        },
        location: {
          search: "&cape=true"
        }
      };

      const { queryByTestId, getByTestId } = setup(props);
      const cape = await getByTestId("cape-form");

      // simulate submit
      await fireEvent.submit(cape);

      // expect no error snackbar
      await waitFor(() => {
        const snackbar = queryByTestId("component-basic-snackbar");
        expect(snackbar).not.toBeInTheDocument();
      });
    });
  });
});
