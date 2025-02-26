import React from "react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
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
import { employersPayload, storeFactory } from "../utils/testUtils";
import { AppConnected, AppUnconnected } from "../App";

import SubmissionFormPage1 from "../containers/SubmissionFormPage1";
import SubmissionFormPage2Function from "../containers/SubmissionFormPage2Function";
import FormThankYou from "../components/FormThankYou";
import * as utils from "../utils/index";
import * as formElements from "../components/SubmissionFormElements";
import {
  generateSampleValidate,
  generateSubmissionBody
} from "../../../app/utils/fieldConfigs";
import { I18nextProvider } from "react-i18next";
import i18n from "../translations/i18n";
import { defaultWelcomeInfo } from "../utils/index";
import handlers from "../mocks/handlers";
import { http, HttpResponse } from 'msw'
import { setupServer } from "msw/node";

import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../styles/theme";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store;
let wrapper;

const oldWindowLocation = window.location;
const server = setupServer(...handlers);
window.scrollTo = jest.fn();

const handleInputMock = jest.fn();
const handleInputSPFMock = jest.fn().mockImplementation(() => Promise.resolve({}));
const setActiveLanguageMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve("en"));
let getResponseMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve("token"));

const verifySuccess = jest.fn().mockImplementation(() => {
  conosle.log("verifySuccess Mock");
  return Promise.resolve({ type: "VERIFY_SUCCESS", payload: { score: 0.9 } });
});

const navigate = jest.fn();

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
      ...formValues,
      reCaptchaValue: ""
    },
    allSubmissions: [{ key: "value" }],
    employerObjects: [...employersPayload]
  }
};

const defaultProps = {
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
      ...formValues,
      reCaptchaValue: "token"
    },
    allSubmissions: [{ key: "value" }],
    employerObjects: [...employersPayload],
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
  apiSubmission: {
    handleInput: handleInputMock,
    handleInputSPF: handleInputSPFMock,
    verify: verifySuccess
  },
  apiSF: {
    getSFEmployers: jest
      .fn()
      .mockImplementation(() => Promise.resolve([...employersPayload])),
    getSFContactById: jest.fn().mockImplementation(() => Promise.resolve())
  },
  initialize: jest.fn(),
  i18n: {
    changeLanguage: setActiveLanguageMock
  },
  classes: {},
  addTranslation: jest.fn(),
  recaptcha: {
    getResponse: getResponseMock
  },
  history: {
    location: {
      pathname: "thepath"
    }
  },
  location: {
    search: "?i=1&h=2&b=3&s=4"
  },
  navigate: jest.fn(),
  formValues: {
    reCaptchaValue: "token"
  }
};

store = storeFactory(initialState);

const setup = async (props = {}, route = "/") => {
  const setupProps = {
    ...defaultProps,
    ...props
  };
  // console.log(setupProps.submission.employerObjects);
  return render(
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n} defaultNS={"translation"}>
        <Provider store={store}>
          <MemoryRouter initialEntries={[route]}>
            <AppUnconnected {...setupProps} />
          </MemoryRouter>
        </Provider>
      </I18nextProvider>
    </ThemeProvider>
  );
};

const connectedSetup = async (props = {}, route = "/") => {
  const setupProps = {
    ...defaultProps,
    ...props
  };
  return await render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <AppConnected {...setupProps} />
        </MemoryRouter>
      </Provider>
    </ThemeProvider>
  );
};

describe("<App />", () => {
  afterAll(() => {
    cleanup();
    jest.restoreAllMocks();
  });
  it("renders unconnected component", async () => {
    const { getByTestId } = await setup();
    const component = await getByTestId("component-app");
    waitFor(() => {
      expect(component).toBeInTheDocument();
    });
  });

  it("renders connected component", async () => {
    const { getByTestId } = await connectedSetup();
    const component = await getByTestId("component-app");
    waitFor(() => {
      expect(component).toBeInTheDocument();
    });
  });

  describe("useEffect (formerly componentDidMount)", () => {
    it("useEffect checks for browser language", async () => {
      // add mock function to props
      utils.detectDefaultLanguage = jest.fn().mockImplementation(() => {
        return {lang: "en", other: false}
      });

      // simulate component render / cDM
      const { getByTestId } = await setup();

      // expect the mock to have been called once
      waitFor(() => {
        expect(setActiveLanguageMock).toHaveBeenCalled();
      });

      // restore mock
      setActiveLanguageMock.mockRestore();
    });
    it("useEffect checks for language in query string", async () => {
      // add mock function to props
      utils.detectDefaultLanguage = jest.fn().mockImplementation(() => {
        return {lang: "en", other: false}
      });
      const props = {
        location: {
          search: "?lang=EN"
        }
      };

      // simulate component render / cDM
      const { getByTestId } = await setup(props);

      // expect the mock to have been called once
      await waitFor(() =>
        expect(setActiveLanguageMock).toHaveBeenCalledWith("EN")
      );

      // restore mock
      setActiveLanguageMock.mockRestore();
    });
  });
  describe("Misc methods", () => {
    // Enable API mocking before tests.
    beforeAll(() => server.listen());

    // Reset any runtime request handlers we may add during the tests.
    afterEach(() => server.resetHandlers());

    // Disable API mocking after the tests are done.
    afterAll(() => server.close());

    it("renderBodyCopy renders paragraphs matching provided body id (default copy)", async () => {
      const { getByTestId } = await setup();
      const component = getByTestId("body");
      await waitFor(() =>
        expect(component.children.length).toBe(3)
        );
      const par0 = getByTestId("bodyCopy0_1");
      await waitFor(() =>
        expect(par0).toBeInTheDocument()
        );
    });
  });

  describe("Unprotected route tests", () => {
    beforeEach(() => {
      store = storeFactory(initialState);
    });

    // Enable API mocking before tests.
    beforeAll(() => server.listen());

    // Reset any runtime request handlers we may add during the tests.
    afterEach(() => server.resetHandlers());

    // Disable API mocking after the tests are done.
    afterAll(() => server.close());
    test("invalid path should render NotFound component", async () => {
      const { queryByTestId } = await setup({}, "/random");
      const subm1 = queryByTestId("component-submissionformpage1");
      const nf = queryByTestId("component-not-found");
      expect(subm1).not.toBeInTheDocument();
      expect(nf).toBeInTheDocument();
    });
    test(' "/" path should render SubmissionForm component', async () => {
      const { queryByTestId } = await setup({}, "/?spf=true");
      const subm1 = queryByTestId("component-submissionformpage1");
      expect(subm1).toBeInTheDocument();
    });
    test(' "/thankyou" path should render ThankYou component', async () => {
      const { queryByTestId } = await setup({}, "/thankyou");
      const subm1 = queryByTestId("component-submissionformpage1");
      const fty = queryByTestId("component-thankyou");
      expect(subm1).not.toBeInTheDocument();
      expect(fty).toBeInTheDocument();
    });
    test(' "/page2?cId={cId}&aId={aid}" path should render SubmissionFormPage2 component', async () => {
      const { queryByTestId } = await setup(
        {
          apiSF: {
            getSFContactById: jest
              .fn()
              .mockImplementation(() => Promise.resolve())
          }
        },
        "/page2?cId=12345678&aId=123456"
      );
      const subm1 = queryByTestId("component-submissionformpage1");
      const subm2 = queryByTestId("component-submissionformpage2");
      expect(subm1).not.toBeInTheDocument();
      expect(subm2).toBeInTheDocument();
    });
    test(' "/page2" path should should redirect to homepage; should not render page 2', async () => {
      const { queryByTestId, debug } = await setup(
        {
          apiSF: {
            getSFContactById: jest
              .fn()
              .mockImplementation(() => Promise.resolve())
          }
        },
        "/page2"
      );
      const subm1 = queryByTestId("component-submissionformpage1");
      const subm2 = queryByTestId("component-submissionformpage2");
      expect(subm1).toBeInTheDocument();
      expect(subm2).not.toBeInTheDocument();
    });
  });
});
