import React from "react";
import { BrowserRouter } from "react-router-dom";
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
import * as formElements from "../../components/SubmissionFormElements";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../../styles/theme";
import {
  generateSampleValidate,
  generateSubmissionBody
} from "../../../../app/utils/fieldConfigs";
import { I18nextProvider } from "react-i18next";
import i18n from "../../translations/i18n";
import handlers from "../../mocks/handlers";
let pushMock = jest.fn(),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  handleErrorMock = jest.fn(),
  executeMock = jest.fn().mockImplementation(() => Promise.resolve());

const testData = generateSampleValidate();
const server = setupServer(...handlers);

import { AppUnconnected } from "../../App";
import { SubmissionFormPage1Container } from "../../containers/SubmissionFormPage1";

let updateSFContactSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_CONTACT_SUCCESS", payload: {} })
  );

let updateSFContactError = jest.fn().mockImplementation(() =>
  Promise.reject({
    type: "UPDATE_SF_CONTACT_FAILURE",
    payload: {},
    message: "updateSFContactError"
  })
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

const initialState = {
  appState: {
    loading: false
  },
  submission: {
    salesforceId: "123",
    formPage1: {
      reCaptchaValue: "token",
      ...formValues
    },
    allSubmissions: [{ key: "value" }],
    employerObjects: [...employersPayload],
    formPage2: {},
    cape: {
      monthlyOptions: []
    }
  }
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
    salesforceId: "123"
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
    updateSFContact: updateSFContactSuccess,
    createSFContact: createSFContactSuccess,
    lookupSFContact: lookupSFContactSuccess
  },
  apiSubmission: {
    handleInput: handleInputMock,
    clearForm: clearFormMock,
    setCAPEOptions: jest.fn(),
    addSubmission: () => Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" }),
    verify: jest.fn().mockImplementation(() =>
      Promise.resolve({
        type: "VERIFY_SUCCESS",
        payload: {
          score: 0.9
        }
      })
    )
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
  i18n: {
    changeLanguage: jest.fn()
  },
  headline: { id: 1 },
  body: { id: 1 },
  renderHeadline: jest.fn(),
  renderBodyCopy: jest.fn(),
  tab: 0,
  t: text => text,
  handleError: handleErrorMock,
  updateSFContact: jest.fn().mockImplementation(() => Promise.resolve())
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

  describe("updateSFContact", () => {
    test("`updateSFContact` calls updateSFContact prop function", async function() {
      let updateSFContactSuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "UPDATE_SF_CONTACT_SUCCESS",
          payload: { id: 1 }
        })
      );
      let props = {
        ...defaultProps,
        submission: {
          ...defaultProps.submission,
          salesforceId: 1
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          updateSFContact: updateSFContactSuccess
        }
      };
      // render app
      const user = userEvent.setup();
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

      // simulate submit tab1
      await waitFor(async () => {
        const submitButton = getByTestId("button-submit");
        await userEvent.click(submitButton);
      });

      // expect snackbar NOT to be in document
      await waitFor(async () => {
        await expect(
          queryByTestId("component-basic-snackbar")
        ).not.toBeInTheDocument();
        await expect(updateSFContactSuccess).toHaveBeenCalled();
      });
    });

    test("`updateSFContact` handles error if prop function fails", async function() {
      let updateSFContactError = jest
        .fn()
        .mockImplementation(() => Promise.reject("updateSFContactError"));
      let props = {
        ...defaultProps,
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          updateSFContact: updateSFContactError
        }
      };
      // render app
      const user = userEvent.setup();
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

      // simulate submit tab1
      await waitFor(async () => {
        const submitButton = getByTestId("button-submit");
        await userEvent.click(submitButton);
      });

      // expect snackbar to be in document with error styling and correct message
      await waitFor(() => {
        const snackbar = getByTestId("component-basic-snackbar");
        const errorIcon = getByTestId("ErrorOutlineIcon");
        const message = getByText("updateSFContactError");
        expect(snackbar).toBeInTheDocument();
        expect(message).toBeInTheDocument();
        expect(errorIcon).toBeInTheDocument();
      });
    });

    test("`saveSubmissionErrors` calls updateSubmission prop", async function() {
      const updateSubmissionSuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "UPDATE_SUBMISSION_SUCCESS",
          payload: { id: 1 }
        })
      );
      let props = {
        ...defaultProps,
        submission: {
          ...defaultProps.submission,
          salesforceId: 1,
          currentSubmission: {
            submission_errors: "blah"
          }
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          updateSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "UPDATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          createSFOMA: jest.fn().mockImplementation(() =>
            Promise.reject({
              message: "createSFOMAError"
            })
          )
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          updateSubmission: updateSubmissionSuccess
        }
      };
      // render app
      const user = userEvent.setup();
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

      // expect updateSubmissionSuccess to have been called
      await waitFor(async () => {
        await expect(updateSubmissionSuccess).toHaveBeenCalled();
      });
    });

    test("`saveSubmissionErrors` handles error if updateSubmission fails", async function() {
      let updateSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SUBMISSION_FAILURE" })
        );
      let props = {
        ...defaultProps,
        submission: {
          ...defaultProps.submission,
          salesforceId: 1,
          currentSubmission: {
            submission_errors: null
          }
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          updateSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "UPDATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          createSFOMA: jest.fn().mockImplementation(() =>
            Promise.reject({
              message: "createSFOMAError"
            })
          )
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          updateSubmission: updateSubmissionError
        }
      };
      // render app
      const user = userEvent.setup();
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        queryByText,
        queryByTestId,
        debug
      } = await setup(props);

      // simulate user click 'Next'
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

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

      // expect correct snackbar error
      await waitFor(async () => {
        const snackbar = await queryByTestId("component-basic-snackbar");
        await expect(snackbar).toBeInTheDocument();
        debug(snackbar);
        const message = await getByText(
          "Sorry, something went wrong. Please try again."
        );
        await expect(message).toBeInTheDocument();
      });
    });

    test("`saveSubmissionErrors` handles error if updateSubmission throws", async function() {
      let updateSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ message: "updateSubmissionError" })
        );
      let props = {
        ...defaultProps,
        submission: {
          ...defaultProps.submission,
          salesforceId: 1,
          currentSubmission: {
            submission_errors: null
          }
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          updateSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "UPDATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          createSFOMA: jest.fn().mockImplementation(() =>
            Promise.reject({
              message: "createSFOMAError"
            })
          )
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          updateSubmission: updateSubmissionError
        }
      };
      // render app
      const user = userEvent.setup();
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        queryByText,
        queryByTestId,
        debug
      } = await setup(props);

      // simulate user click 'Next'
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

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

      // expect correct snackbar error
      await waitFor(async () => {
        await expect(
          queryByTestId("component-basic-snackbar")
        ).toBeInTheDocument();
        const message = await getByText("updateSubmissionError");
        await expect(message).toBeInTheDocument();
      });
    });
  });
});
