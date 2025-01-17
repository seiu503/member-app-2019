import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { act } from 'react-dom/test-utils';

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
import { setupServer } from "msw/node";
import { AppUnconnected, AppConnected } from "../../App";
import * as App from "../../App";
import * as formElements from "../../components/SubmissionFormElements";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../../styles/theme";
import {
  I18nextProvider,
  useTranslation,
  withTranslation
} from "react-i18next";
import i18n from "../../translations/i18n";
import {
  generateSampleValidate,
  generateSubmissionBody
} from "../../../../app/utils/fieldConfigs";
import handlers from "../../mocks/handlers";
let navigate = jest.fn(),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  handleInputSPFMock = jest.fn().mockImplementation(() => Promise.resolve({})),
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

let refreshRecaptchaMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));

let verifyMock = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "VERIFY_SUCCESS",
    payload: {
      score: 0.9
    }
  })
);

const server = setupServer(...handlers);

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
  submission: {
    formPage1: {
      reCaptchaValue: "token",
      ...formValues
    },
    p4cReturnValues: {},
    allSubmissions: [{ key: "value" }],
    employerObjects: [...employersPayload]
  }
};

const defaultProps = {
  apiSubmission: {
    verify: jest.fn().mockImplementation(() =>
      Promise.resolve({
        type: "VERIFY_SUCCESS",
        payload: {
          score: 0.9
        }
      })
    ),
    handleInput: handleInputMock,
    handleInputSPF: handleInputSPFMock,
    clearForm: clearFormMock,
    setCAPEOptions: jest.fn(),
    addSubmission: () => Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
  },
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
    },
    salesforceId: "123",
    formPage1: {
      prefillEmployerId: "1",
      reCaptchaValue: "token",
      ...formValues
    }
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
  apiProfile: {},
  initialize: jest.fn(),
  addTranslation: jest.fn(),
  profile: {},
  initialValues: {
    onlineCampaignSource: null
  },
  formValues: {
    directPayAuth: true,
    employerName: "homecare",
    paymentType: "card",
    employerType: "retired",
    preferredLanguage: "English"
  },
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
    createSFContact: createSFContactError,
    lookupSFContact: lookupSFContactSuccess,
    createSFContact: createSFContactError
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
  i18n: {
    changeLanguage: jest.fn()
  },
  t: text => text
};

const store = storeFactory(initialState);

// jest.mock('react-i18next');

const setup = async (props = {}, route = "/") => {
  const setupProps = {
    ...defaultProps,
    ...props
  };
  console.log(setupProps.submission.employerObjects);
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

  beforeEach(() => {
    // i18n.init();
    // useTranslation.mockReturnValue({ t: key => key });
    // withTranslation.mockReturnValue({ t: key => key });
  });

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe("createSFContact", () => {
    test("`createSFContact` handles error if prop function fails", async function() {
      // test for presence of snackbar component with variant = error
      const props = {
        ...defaultProps,
        apiSF: {
          ...defaultProps.apiSF,
          createSFContact: jest
            .fn()
            .mockImplementation(() => Promise.reject("createSFContactError"))
        }
      };

      // render app
      const user = await userEvent.setup();
      const {
        getByTestId,
        getByRole,
        getByText,
        getByLabelText,
        debug
      } = await setup(props);

      // simulate user click 'Next'
      await waitFor(() => {
        const nextButton = getByTestId("button-next");
        userEvent.click(nextButton);
      });

      // check that tab 1 renders
      await waitFor(() => {
        const tab1Form = getByRole("form");
        expect(tab1Form).toBeInTheDocument();
      });

      // simulate submit tab1
      await waitFor(() => {
        const submitButton = getByTestId("button-submit");
        userEvent.click(submitButton);
      });

      // expect snackbar to be in the document with correct error message
      await waitFor( async () => {
        const snackbar = await getByTestId("component-basic-snackbar");
        const errorIcon = await getByTestId("ErrorOutlineIcon");
        const message = await getByText("createSFContactError");
        await expect(snackbar).toBeInTheDocument();
        expect(errorIcon).toBeInTheDocument();
        expect(message).toBeInTheDocument();
      });
    });
  });
});
