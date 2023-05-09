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
import { employersPayload, storeFactory } from "../../utils/testUtils";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { AppUnconnected } from "../../App";
import "jest-canvas-mock";
import * as formElements from "../../components/SubmissionFormElements";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../../styles/theme";
import {
  generateSampleValidate,
  generateSubmissionBody
} from "../../../../app/utils/fieldConfigs";
import handlers from "../../mocks/handlers";
import { handleInput } from "../../store/actions/apiSubmissionActions.js";
let pushMock = jest.fn(),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  executeMock = jest.fn().mockImplementation(() => Promise.resolve());

const testData = generateSampleValidate();

const server = setupServer(...handlers);

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
  textAuthOptOut: false,
  directPayAuth: true,
  employerName: "homecare",
  paymentType: "card",
  employerType: "retired",
  preferredLanguage: "English"
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
  appState: {},
  apiProfile: {},
  initialize: jest.fn(),
  addTranslation: jest.fn(),
  profile: {},
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
    // updateSFContact: updateSFContactSuccess,
    createSFContact: createSFContactSuccess
    // lookupSFContact: lookupSFContactSuccess
  },
  apiSubmission: {
    // handleInput: handleInputMock,
    handleInput,
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
  createSubmission: createSubmissionSuccess,
  setActiveLanguage: jest.fn()
};

const initialState = {
  appState: {
    loading: false
  },
  submission: {
    formPage1: {
      reCaptchaValue: "token"
    },
    allSubmissions: [{ key: "value" }],
    employerObjects: [...employersPayload]
  }
};

const store = storeFactory(initialState);

const setup = async (props = {}, route = "/") => {
  const setupProps = {
    ...defaultProps,
    ...props
  };
  // console.log(setupProps.submission.employerObjects);
  return render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <AppUnconnected {...setupProps} />
        </MemoryRouter>
      </Provider>
    </ThemeProvider>
  );
};

describe("<App />", () => {
  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe("createSubmission", () => {
    test("`createSubmission` handles error if prop function fails", async function() {
      formElements.handleError = jest.fn();
      addSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_FAILURE" })
        );
      let props = {
        apiSubmission: {
          // handleInput: handleInputMock,
          handleInput,
          addSubmission: addSubmissionError,
          updateSubmission: jest
            .fn()
            .mockImplementation(() => Promise.resolve({}))
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            legalLanguage: "jjj"
          }
        }
      };

      let generateSubmissionBodyMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));

      // render app
      const user = userEvent.setup();
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        debug
      } = await setup(props);

      // simulate user click 'Next'
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that tab 1 renders
      const tab1Form = getByRole("form");
      await waitFor(() => {
        expect(tab1Form).toBeInTheDocument();
      });

      // simulate submit
      await fireEvent.submit(tab1Form, { ...testData });

      // enter signature and simulate submit tab2
      await waitFor(async () => {
        const sigInput = await getByLabelText("Signature");
        await fireEvent.change(sigInput, { target: { value: "test" } });
        const tab2Form = await getByTestId("form-tab2");
        await fireEvent.submit(tab2Form, { ...testData });
      });

      // expect snackbar to be in document with error styling and correct message
      await waitFor(() => {
        const snackbar = getByTestId("component-basic-snackbar");
        const errorIcon = getByTestId("ErrorOutlineIcon");
        const message = getByText(
          "An error occurred while saving your Submission"
        );
        expect(snackbar).toBeInTheDocument();
        expect(message).toBeInTheDocument();
        expect(errorIcon).toBeInTheDocument();
      });
    });
    test("`createSubmission` handles error if prop function throws", async function() {
      formElements.handleError = jest.fn();
      addSubmissionError = jest.fn().mockImplementation(() =>
        Promise.reject({
          type: "ADD_SUBMISSION_FAILURE",
          message: "An error occurred while saving your Submission"
        })
      );
      let props = {
        apiSubmission: {
          handleInput,
          addSubmission: addSubmissionError,
          updateSubmission: jest
            .fn()
            .mockImplementation(() => Promise.resolve({}))
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            legalLanguage: "jjj"
          }
        }
      };

      let generateSubmissionBodyMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));

      // render app
      const user = userEvent.setup(props);
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        debug
      } = await setup(props);

      // simulate user click 'Next'
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that tab 1 renders
      const tab1Form = getByRole("form");
      await waitFor(() => {
        expect(tab1Form).toBeInTheDocument();
      });

      // simulate submit
      await fireEvent.submit(tab1Form, { ...testData });

      // enter signature and simulate submit tab2
      await waitFor(async () => {
        const sigInput = await getByLabelText("Signature");
        await fireEvent.change(sigInput, { target: { value: "test" } });
        const tab2Form = await getByTestId("form-tab2");
        await fireEvent.submit(tab2Form, { ...testData });
      });

      // expect snackbar to be in document with error styling and correct message
      await waitFor(() => {
        const snackbar = getByTestId("component-basic-snackbar");
        const errorIcon = getByTestId("ErrorOutlineIcon");
        debug(snackbar);
        const message = getByText(
          "An error occurred while saving your Submission"
        );
        expect(snackbar).toBeInTheDocument();
        expect(message).toBeInTheDocument();
        expect(errorIcon).toBeInTheDocument();
      });
    });
    test("`createSubmission` does not return error to client and displays CAPE tab if createSFOMA fails", async function() {
      // can't figure out how to test if submission errors are saved without mocking component method because nothing is returned to client here
      // but can test to make sure it moves on without error and renders CAPE tab ??
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      addSubmissionSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
        );
      createSFOMAError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SF_OMA_FAILURE" })
        );
      const updateSubmissionSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput,
          addSubmission: addSubmissionSuccess,
          updateSubmission: updateSubmissionSuccess
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            paymentRequired: false
          },
          currentSubmission: {
            submission_errors: ""
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          createSFOMA: createSFOMAError
        }
      };
      // render app
      const user = userEvent.setup(props);
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        queryByTestId,
        debug
      } = await setup(props);

      // simulate user click 'Next'
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that tab 1 renders
      const tab1Form = getByRole("form");
      await waitFor(() => {
        expect(tab1Form).toBeInTheDocument();
      });

      // simulate submit
      await fireEvent.submit(tab1Form, { ...testData });

      // enter signature and simulate submit tab2
      await waitFor(async () => {
        const sigInput = await getByLabelText("Signature");
        await fireEvent.change(sigInput, { target: { value: "test" } });
        const tab2Form = await getByTestId("form-tab2");
        await fireEvent.submit(tab2Form, { ...testData });
      });

      // expect snackbar NOT to be in document
      await waitFor(() => {
        expect(
          queryByTestId("component-basic-snackbar")
        ).not.toBeInTheDocument();
      });

      // expect cape tab to render
      await waitFor(() => {
        const cape = getByTestId("component-cape");
        expect(cape).toBeInTheDocument();
      });
    });
    test("`createSubmission` handles error if createSFOMA throws", async function() {
      // if sfOMA throws we do return the error to client so can test snackbar message
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      addSubmissionSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
        );
      createSFOMAError = jest.fn().mockImplementation(() =>
        Promise.reject({
          type: "CREATE_SF_OMA_FAILURE",
          message: "sfOMA error"
        })
      );
      const updateSubmissionSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput,
          addSubmission: addSubmissionSuccess,
          updateSubmission: updateSubmissionSuccess
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            paymentRequired: false
          },
          currentSubmission: {
            submission_errors: ""
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          createSFOMA: createSFOMAError
        }
      };
      // render app
      const user = userEvent.setup(props);
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        queryByTestId,
        debug
      } = await setup(props);

      // simulate user click 'Next'
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that tab 1 renders
      const tab1Form = getByRole("form");
      await waitFor(() => {
        expect(tab1Form).toBeInTheDocument();
      });

      // simulate submit
      await fireEvent.submit(tab1Form, { ...testData });

      // enter signature and simulate submit tab2
      await waitFor(async () => {
        const sigInput = await getByLabelText("Signature");
        await fireEvent.change(sigInput, { target: { value: "test" } });
        const tab2Form = await getByTestId("form-tab2");
        await fireEvent.submit(tab2Form, { ...testData });
      });

      // expect snackbar to be in document with error styling and correct message
      await waitFor(() => {
        const snackbar = getByTestId("component-basic-snackbar");
        const errorIcon = getByTestId("ErrorOutlineIcon");
        debug(snackbar);
        const message = getByText("sfOMA error");
        expect(snackbar).toBeInTheDocument();
        expect(message).toBeInTheDocument();
        expect(errorIcon).toBeInTheDocument();
      });
    });
    test("`createSubmission` handles error if updateSubmission throws", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();

      const updateSubmissionError = jest.fn().mockImplementation(() =>
        Promise.reject({
          type: "UPDATE_SUBMISSION_FAILURE",
          message: "updateSubmission error"
        })
      );
      const createSFOMASuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SF_OMA_SUCCESS" })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock,
          addSubmission: addSubmissionSuccess,
          updateSubmission: updateSubmissionError
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            paymentRequired: false
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          createSFOMA: createSFOMASuccess
        }
      };

      // render app
      const user = userEvent.setup(props);
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        queryByTestId,
        debug
      } = await setup(props);

      // simulate user click 'Next'
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that tab 1 renders
      const tab1Form = getByRole("form");
      await waitFor(() => {
        expect(tab1Form).toBeInTheDocument();
      });

      // simulate submit
      await fireEvent.submit(tab1Form, { ...testData });

      // enter signature and simulate submit tab2
      await waitFor(async () => {
        const sigInput = await getByLabelText("Signature");
        await fireEvent.change(sigInput, { target: { value: "test" } });
        const tab2Form = await getByTestId("form-tab2");
        await fireEvent.submit(tab2Form, { ...testData });
      });

      // expect snackbar to be in document with error styling and correct message
      await waitFor(() => {
        const snackbar = getByTestId("component-basic-snackbar");
        const errorIcon = getByTestId("ErrorOutlineIcon");
        debug(snackbar);
        const message = getByText("updateSubmission error");
        expect(snackbar).toBeInTheDocument();
        expect(message).toBeInTheDocument();
        expect(errorIcon).toBeInTheDocument();
      });
    });
  });
});
