import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

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
import { I18nextProvider } from "react-i18next";
import i18n from "../../translations/i18n";
let navigate = jest.fn(),
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

const formValues = {
  firstName: "firstName",
  lastName: "lastName",
  homeEmail: "test@test.com",
  homeStreet: "homeStreet",
  homeCity: "homeCity",
  homeZip: "12345",
  homeState: "homeState",
  signature: "signature",
  employerType: "employerType",
  employerName: "employerName",
  mobilePhone: "1234567890",
  mm: "01",
  dd: "01",
  yyyy: "1999",
  preferredLanguage: "English",
  textAuthOptOut: false,
  termsAgree: true,
  MOECheckbox: true
};

const defaultProps = {
  submission: {
    error: null,
    loading: false,
    formPage1: {
      reCaptchaValue: "token",
      ...formValues
    },
    cape: {},
    payment: {},
    submissionId: 1
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
    createSFContact: () =>
      Promise.resolve({ type: "CREATE_SF_CONTACT_SUCCESS" })
  },
  apiSubmission: {
    // handleInput: handleInputMock,
    handleInput,
    clearForm: clearFormMock,
    setCAPEOptions: jest.fn(),
    addSubmission: () => Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
  },
  history: {},
  navigate,
  recaptcha: {
    execute: executeMock
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
  createSubmission: createSubmissionSuccess,
  setActiveLanguage: jest.fn(),
  i18n: {
    changeLanguage: jest.fn()
  },
  t: text => text
};

const initialState = {
  appState: {
    loading: false
  },
  submission: {
    formPage1: {
      reCaptchaValue: "token",
      ...formValues
    },
    allSubmissions: [{ key: "value" }],
    employerObjects: [...employersPayload],
    cape: {
      monthlyOptions: []
    }
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
        <I18nextProvider i18n={i18n} defaultNS={"translation"}>
          <BrowserRouter>
            <AppUnconnected {...setupProps} />
          </BrowserRouter>
        </I18nextProvider>
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
      addSubmissionError = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "ADD_SUBMISSION_FAILURE",
          message: "addSubmissionError"
        })
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
          },
          error: "addSubmissionError",
          currentSubmission: {}
        },
        apiSF: {
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          lookupSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          createSFOMA: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_OMA_SUCCESS",
              payload: { id: 1 }
            })
          )
        }
      };

      let generateSubmissionBodyMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));

      // render app
      const user = await userEvent.setup();
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        debug
      } = await setup(props);

      // simulate user click 'Next'
      const nextButton = await getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that tab 1 renders
      const tab1Form = await getByRole("form");
      await waitFor(() => {
        expect(tab1Form).toBeInTheDocument();
      });

      // simulate submit tab1
      await waitFor(async () => {
        const submitButton = await getByTestId("button-submit");
        await userEvent.click(submitButton);
      });

      // simulate submit tab2
      await waitFor(async () => {
        const submitButton = await getByTestId("button-submit-tab2");
        await userEvent.click(submitButton);
      });

      // expect snackbar to be in document with error styling and correct message
      await waitFor(async () => {
        const snackbar = await getByTestId("component-basic-snackbar");
        const errorIcon = await getByTestId("ErrorOutlineIcon");
        const message = await getByText("addSubmissionError");
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
          message: "addSubmissionError"
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
        },
        apiSF: {
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          lookupSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          createSFOMA: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_OMA_SUCCESS",
              payload: { id: 1 }
            })
          )
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

      // simulate submit tab1
      await waitFor(async () => {
        const submitButton = getByTestId("button-submit");
        await userEvent.click(submitButton);
      });

      // simulate submit tab2
      await waitFor(async () => {
        const submitButton = getByTestId("button-submit-tab2");
        await userEvent.click(submitButton);
      });

      // expect snackbar to be in document with error styling and correct message
      await waitFor(() => {
        const snackbar = getByTestId("component-basic-snackbar");
        const errorIcon = getByTestId("ErrorOutlineIcon");
        const message = getByText("addSubmissionError");
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
      createSFOMAError = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_OMA_FAILURE",
          message: "createSFOMAError"
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
          submissionId: "456",
          formPage1: {
            paymentRequired: false
          },
          // error: "createSFOMAError",
          currentSubmission: {
            submission_errors: ""
          }
        },
        apiSF: {
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          lookupSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
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

      // simulate submit tab1
      await waitFor(async () => {
        const submitButton = getByTestId("button-submit");
        await userEvent.click(submitButton);
      });

      // simulate submit tab2
      await waitFor(async () => {
        const submitButton = getByTestId("button-submit-tab2");
        await userEvent.click(submitButton);
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
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          lookupSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
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

      // simulate submit tab1
      await waitFor(async () => {
        const submitButton = getByTestId("button-submit");
        await userEvent.click(submitButton);
      });

      // simulate submit tab2
      await waitFor(async () => {
        const submitButton = getByTestId("button-submit-tab2");
        await userEvent.click(submitButton);
      });

      // expect snackbar to be in document with error styling and correct message
      await waitFor(() => {
        const snackbar = getByTestId("component-basic-snackbar");
        const errorIcon = getByTestId("ErrorOutlineIcon");
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
          addSubmission: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "ADD_SUBMISSION_SUCCESS",
              payload: { id: 1 }
            })
          ),
          updateSubmission: updateSubmissionError
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            paymentRequired: false
          }
        },
        apiSF: {
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          lookupSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          createSFOMA: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_OMA_SUCCESS",
              payload: { id: 1 }
            })
          )
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

      // simulate submit tab1
      await waitFor(async () => {
        const submitButton = getByTestId("button-submit");
        await userEvent.click(submitButton);
      });

      // simulate submit tab2
      await waitFor(async () => {
        const submitButton = getByTestId("button-submit-tab2");
        await userEvent.click(submitButton);
      });

      // expect snackbar to be in document with error styling and correct message
      await waitFor(() => {
        const snackbar = getByTestId("component-basic-snackbar");
        const errorIcon = getByTestId("ErrorOutlineIcon");
        const message = getByText("updateSubmission error");
        expect(snackbar).toBeInTheDocument();
        expect(message).toBeInTheDocument();
        expect(errorIcon).toBeInTheDocument();
      });
    });
  });
});
