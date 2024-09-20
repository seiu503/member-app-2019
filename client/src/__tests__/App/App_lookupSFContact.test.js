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
import handlers from "../../mocks/handlers";
import { I18nextProvider } from "react-i18next";
import i18n from "../../translations/i18n";
let pushMock = jest.fn(),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  handleErrorMock = jest.fn(),
  executeMock = jest.fn().mockImplementation(() => Promise.resolve());

const testData = generateSampleValidate();
const server = setupServer(...handlers);

import { AppUnconnected } from "../../App";

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
    employerObjects: { ...employersPayload }
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

  describe("lookupSFContact", () => {
    test("`lookupSFContact` calls lookupSFContact prop if required fields populated", async function() {
      // just test that with this set of props, it doesn't error and advances to next tab
      let props = {
        submission: {
          salesforceId: null,
          formPage1: { ...defaultProps.formPage1 },
          cape: {
            monthlyOptions: []
          }
        },
        apiSF: {
          createSFOMA: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_OMA_SUCCESS",
              payload: { id: 1 }
            })
          ),
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
          )
        }
      };
      // render app
      const user = userEvent.setup();
      const {
        getByTestId,
        queryByTestId,
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
    test("`lookupSFContact` handles error if lookupSFContact prop throws", async function() {
      // also tests snackbar close behavior
      lookupSFContactError = jest.fn().mockImplementation(() =>
        Promise.reject({
          type: "LOOKUP_SF_CONTACT_FAILURE",
          payload: {},
          message: "lookupSFContactError"
        })
      );
      let props = {
        submission: {
          salesforceId: null,
          formPage1: {
            prefillEmployerId: "123"
          }
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: lookupSFContactError,
          createSFOMA: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_OMA_SUCCESS",
              payload: { id: 1 }
            })
          ),
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
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
        queryByTestId,
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

      // expect snackbar to be in document with error styling and correct message
      await waitFor(() => {
        const snackbar = getByTestId("component-basic-snackbar");
        const errorIcon = getByTestId("ErrorOutlineIcon");
        const message = getByText("lookupSFContactError");
        expect(snackbar).toBeInTheDocument();
        expect(message).toBeInTheDocument();
        expect(errorIcon).toBeInTheDocument();
      });

      // simulate user click on close button
      const closeButton = getByRole("button", {
        name: /close/i
      });
      await userEvent.click(closeButton);

      // expect snackbar to close
      await waitFor(async () => {
        const snackbar = queryByTestId("component-basic-snackbar");
        expect(snackbar).not.toBeInTheDocument();
      });
    });

    test("`lookupSFContact` calls createSFContact if lookupSFContact finds no match", async function() {
      // just test that with this set of props, it doesn't error and advances to next tab
      let props = {
        submission: {
          salesforceId: null,
          formPage1: {
            ...defaultProps.formPage1,
            prefillEmployerId: null
          }
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { salesforce_id: null }
            })
          ),
          createSFOMA: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_OMA_SUCCESS",
              payload: { id: 1 }
            })
          ),
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          )
        }
      };
      // render app
      const user = userEvent.setup(props);
      const {
        getByTestId,
        queryByTestId,
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

      // expect snackbar NOT to be in document
      await waitFor(() => {
        expect(
          queryByTestId("component-basic-snackbar")
        ).not.toBeInTheDocument();
      });

      // expect tab2 to render
      await waitFor(() => {
        const tab2Form = getByTestId("form-tab2");
        expect(tab2Form).toBeInTheDocument();
      });
    });
    test("`lookupSFContact` handles error if createSFContact throws", async function() {
      formElements.handleError = jest.fn();
      let props = {
        submission: {
          salesforceId: null,
          formPage1: {
            ...defaultProps.formPage1,
            prefillEmployerId: null
          }
        },
        apiSF: {
          ...defaultProps.apiSF,
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.reject({
              type: "CREATE_SF_CONTACT_FAILURE",
              message: "createSFContactError"
            })
          ),
          lookupSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { salesforce_id: null }
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

      // expect snackbar to be in document with error styling and correct message
      await waitFor(() => {
        const snackbar = getByTestId("component-basic-snackbar");
        const errorIcon = getByTestId("ErrorOutlineIcon");
        const message = getByText("createSFContactError");
        expect(snackbar).toBeInTheDocument();
        expect(message).toBeInTheDocument();
        expect(errorIcon).toBeInTheDocument();
      });
    });
  });
});
