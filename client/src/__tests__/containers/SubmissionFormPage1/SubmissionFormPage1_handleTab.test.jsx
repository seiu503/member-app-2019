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
import { employersPayload, storeFactory } from "../../../utils/testUtils";
import { setupServer } from "msw/node";
import * as formElements from "../../../components/SubmissionFormElements";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../../../styles/theme";
import {
  generatePage2Validate,
  generateSubmissionBody
} from "../../../../../app/utils/fieldConfigs";
import handlers from "../../../mocks/handlers";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../translations/i18n";
let navigate = jest.fn(),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  handleInputSPFMock = jest.fn().mockImplementation(() => Promise.resolve({})),
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

let refreshRecaptchaMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));

let createSubmissionSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "CREATE_SUBMISSION_SUCCESS" })
  );

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

const changeTabMock = jest.fn().mockImplementation(() => Promise.resolve());

const defaultProps = {
  submission: {
    error: null,
    loading: false,
    formPage1: {
      signature: ""
    },
    cape: {},
    payment: {},
    p4cReturnValues: {
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
      legalLanguage: ""
    }
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
    handleInputSPF: handleInputSPFMock,
    clearForm: clearFormMock,
    setCAPEOptions: jest.fn(),
    addSubmission: () => Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" }),
    updateSubmission: () =>
      Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
  },
  history: {},
  navigate,
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
  createSubmission: createSubmissionSuccess,
  changeTab: changeTabMock,
  actions: {
    setTab: jest.fn(),
    setSpinner: jest.fn(),
    setSPF: jest.fn(),
    setEmbed: jest.fn(),
    setUserSelectedLanguage: jest.fn(),
    setSnackbar: jest.fn(),
    setOpen: jest.fn(),
    setCapeOpen: jest.fn(),
    setLegalLanguage: jest.fn(),
    setDisplayCapePaymentFields: jest.fn()
  },
  appState: {
    loggedIn: false,
    authToken: "",
    loading: false,
    userType: "",
    tab: undefined,
    spf: false,
    userSelectedLanguage: "",
    embed: false,
    headline: {
      text: "",
      id: 0
    },
    body: {
      text: "",
      id: 0
    },
    image: {},
    snackbar: {
      open: false,
      variant: "info",
      message: null
    },
    open: false,
    capeOpen: false,
    legalLanguage: "",
    displayCapePaymentFields: false
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
          <BrowserRouter>
            <SubmissionFormPage1Container {...setupProps} />
          </BrowserRouter>
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

  describe("handleTab", () => {
    test("`handleTab` calls saveLegalLanguage if newValue === 2", async function() {
      let saveLegalLanguageMock = jest.fn();
      createSubmissionSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SUBMISSION_SUCCESS" })
        );
      let props = {
        formValues: {
          signature: "test",
          directPayAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        createSubmission: createSubmissionSuccess,
        tab: 1
      };

      // render form
      const user = userEvent.setup(props);
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        debug
      } = await setup(props);

      const tab2Form = getByTestId("form-tab2");

      // simulate submit tab2
      await waitFor(async () => {
        await fireEvent.submit(tab2Form);
      });

      // expect changeTabMock to have been called with 2
      await waitFor(() => {
        expect(changeTabMock).toHaveBeenCalledWith(2);
      });
    });

    test("`handleTab` called with 1 calls handleTab1", async () => {
      createSubmissionSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SUBMISSION_SUCCESS" })
        );
      let props = {
        formValues: {
          signature: "test",
          directPayAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        submission: {
          ...defaultProps.submission,
          formPage1: {
            ...defaultProps.submission.formPage1,
            reCaptchaValue: "token"
          }
        },
        createSubmission: createSubmissionSuccess,
        tab: 0,
        updateSFContact: updateSFContactSuccess,
        createSFContact: jest.fn().mockImplementation(() =>
          Promise.resolve({
            type: "CREATE_SF_CONTACT_SUCCESS",
            payload: { salesforce_id: "123" }
          })
        ),
        lookupSFContact: jest.fn().mockImplementation(() =>
          Promise.resolve({
            type: "LOOKUP_SF_CONTACT_SUCCESS",
            payload: { salesforce_id: "123" }
          })
        ),
        apiSubmission: {
          ...defaultProps.apiSubmission,
          verify: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "VERIFY_SUCCESS",
              payload: {
                score: 0.9
              }
            })
          )
        }
      };
      // render form
      const user = userEvent.setup(props);
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        debug
      } = await setup(props);

      const tab1Form = getByTestId("form-tab1");

      // simulate submit tab1
      await waitFor(async () => {
        await fireEvent.submit(tab1Form);
      });

      // expect changeTabMock to have been called with 1
      await waitFor(() => {
        expect(changeTabMock).toHaveBeenCalledWith(1);
      });
    });

    test("`handleTab` handles error if handleTab1 fails (updateSFContact throws)", async () => {
      createSubmissionSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SUBMISSION_SUCCESS" })
        );
      handleErrorMock = jest.fn(() => console.log("handleErrorMock"));
      let props = {
        handleError: handleErrorMock,
        formValues: {
          signature: "test",
          directPayAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        submission: {
          ...defaultProps.submission,
          salesforceId: "1",
          formPage1: {
            ...defaultProps.submission.formPage1,
            reCaptchaValue: "token"
          }
        },
        createSubmission: createSubmissionSuccess,
        tab: 0,
        updateSFContact: jest
          .fn()
          .mockImplementation(() => Promise.reject("updateSFContactError")),
        createSFContact: jest.fn().mockImplementation(() =>
          Promise.resolve({
            type: "CREATE_SF_CONTACT_SUCCESS",
            payload: { salesforce_id: "123" }
          })
        ),
        lookupSFContact: jest.fn().mockImplementation(() =>
          Promise.resolve({
            type: "LOOKUP_SF_CONTACT_SUCCESS",
            payload: { salesforce_id: "123" }
          })
        ),
        apiSubmission: {
          ...defaultProps.apiSubmission,
          verify: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "VERIFY_SUCCESS",
              payload: {
                score: 0.9
              }
            })
          )
        }
      };
      // render form
      const user = userEvent.setup(props);
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        debug
      } = await setup(props);

      const tab1Form = getByTestId("form-tab1");

      // simulate submit tab1
      await waitFor(async () => {
        await fireEvent.submit(tab1Form);
      });

      // expect handleErrorMock to have been called with ???
      await waitFor(() => {
        expect(handleErrorMock).toHaveBeenCalledWith("updateSFContactError");
      });
    });

    test("`handleTab` handles error if handleTab2 fails (updateSFContact throws)", async () => {
      handleErrorMock = jest.fn(() => console.log("handleErrorMock"));
      let props = {
        handleError: handleErrorMock,
        t: text => text,
        formValues: {
          signature: "test",
          directPayAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        submission: {
          ...defaultProps.submission,
          salesforceId: "1",
          formPage1: {
            ...defaultProps.submission.formPage1,
            reCaptchaValue: "token"
          }
        },
        createSubmission: jest
          .fn()
          .mockImplementation(() => Promise.reject("createSubmissionError")),
        tab: 0,
        updateSFContact: jest
          .fn()
          .mockImplementation(() => Promise.reject("updateSFContactError")),
        createSFContact: jest.fn().mockImplementation(() =>
          Promise.resolve({
            type: "CREATE_SF_CONTACT_SUCCESS",
            payload: { salesforce_id: "123" }
          })
        ),
        lookupSFContact: jest.fn().mockImplementation(() =>
          Promise.resolve({
            type: "LOOKUP_SF_CONTACT_SUCCESS",
            payload: { salesforce_id: "123" }
          })
        ),
        apiSubmission: {
          ...defaultProps.apiSubmission,
          verify: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "VERIFY_SUCCESS",
              payload: {
                score: 0.9
              }
            })
          )
        }
      };
      // render form
      const user = userEvent.setup(props);
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        debug
      } = await setup(props);

      const tab1Form = getByTestId("form-tab1");

      // simulate submit tab1
      await waitFor(async () => {
        await fireEvent.submit(tab1Form);
      });

      // expect handleErrorMock to have been called with updateSFContactError
      await waitFor(() => {
        expect(handleErrorMock).toHaveBeenCalledWith("updateSFContactError");
      });
    });
  });
});
