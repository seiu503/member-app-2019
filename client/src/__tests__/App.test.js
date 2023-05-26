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
import { employersPayload, storeFactory } from "../utils/testUtils";
import { AppConnected, AppUnconnected } from "../App";
import "jest-canvas-mock";

import SubmissionFormPage1 from "../containers/SubmissionFormPage1";
import SubmissionFormPage2 from "../containers/SubmissionFormPage2";
import FormThankYou from "../components/FormThankYou";
import * as utils from "../utils/index";
import * as formElements from "../components/SubmissionFormElements";
import {
  generateSampleValidate,
  generateSubmissionBody
} from "../../../app/utils/fieldConfigs";
import { defaultWelcomeInfo } from "../utils/index";
import handlers from "../mocks/handlers";
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

const handleInputMock = jest.fn();
const setActiveLanguageMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve("en"));
let getResponseMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve("token"));

const pushMock = jest.fn();

const initialState = {
  appState: {
    loading: false
  },
  submission: {
    formPage1: {
      reCaptchaValue: ""
    },
    allSubmissions: [{ key: "value" }],
    employerObjects: [...employersPayload]
  }
};

const defaultProps = {
  appState: {
    loading: false
  },
  submission: {
    formPage1: {
      reCaptchaValue: "token"
    },
    allSubmissions: [{ key: "value" }],
    employerObjects: [...employersPayload]
  },
  apiSubmission: {
    handleInput: handleInputMock
  },
  apiSF: {
    getSFEmployers: jest
      .fn()
      .mockImplementation(() => Promise.resolve([...employersPayload])),
    getSFContactById: jest.fn().mockImplementation(() => Promise.resolve())
  },
  initialize: jest.fn(),
  setActiveLanguage: setActiveLanguageMock,
  classes: {},
  addTranslation: jest.fn(),
  recaptcha: {
    getResponse: getResponseMock
  },
  history: {
    location: {
      pathname: "thepath"
    },
    push: pushMock
  },
  location: {
    search: "?i=1&h=2&b=3&s=4"
  },
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
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <AppUnconnected {...setupProps} />
        </MemoryRouter>
      </Provider>
    </ThemeProvider>
  );
};

const connectedSetup = async (props = {}, route = "/") => {
  const setupProps = {
    ...defaultProps,
    ...props
  };
  return render(
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
  it("renders unconnected component", async () => {
    const { getByTestId } = await setup();
    const component = getByTestId("component-app");
    expect(component).toBeInTheDocument();
  });

  it("renders connected component", async () => {
    const { getByTestId } = await connectedSetup();
    const component = getByTestId("component-app");
    expect(component).toBeInTheDocument();
  });

  describe("componentDidMount", () => {
    it("componentDidMount checks for browser language", async () => {
      // add mock function to props
      utils.detectDefaultLanguage = jest.fn();
      const props = {
        setActiveLanguage: setActiveLanguageMock
      };

      // simulate component render / cDM
      const { getByTestId } = await setup();

      // expect the mock to have been called once
      expect(setActiveLanguageMock).toHaveBeenCalled();

      // restore mock
      setActiveLanguageMock.mockRestore();
    });
    it("componentDidMount checks for language in query string", async () => {
      // add mock function to props
      utils.detectDefaultLanguage = jest.fn();
      const props = {
        setActiveLanguage: setActiveLanguageMock,
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
    it("click on Snackbar close button closes Snackbar", async () => {
      const props = {
        ...defaultProps,
        apiSF: {
          ...defaultProps.apiSF,
          getSFEmployers: jest
            .fn()
            .mockImplementation(() => Promise.resolve([...employersPayload])),
          getSFContactById: jest
            .fn()
            .mockImplementation(() => Promise.resolve())
        }
      };
      window.scrollTo = jest.fn();
      // render app
      const user = userEvent.setup();
      const {
        getByTestId,
        getByRole,
        getByText,
        debug,
        queryByTestId
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
      await fireEvent.submit(tab1Form);
      // recaptcha will error, triggering snackbar

      // expect snackbar to be in the document
      await waitFor(async () => {
        const snackbar = getByTestId("component-basic-snackbar");
        expect(snackbar).toBeInTheDocument();
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

    // it("onResolved calls recaptcha.getResponse and saves recaptcha token to redux store", async () => {
    //   getResponseMock = jest
    //     .fn()
    //     .mockImplementation(() => Promise.resolve("token"));

    //   const props = {
    //     ...defaultProps,
    //     // this doesn't work because recaptcha is not a prop, would havel to mock the whole module
    //     recaptcha: {
    //       current: {
    //         getResponse: getResponseMock,
    //         execute: jest.fn().mockImplementation(() => {
    //           console.log('executeMock');
    //           return Promise.resolve("token");
    //           })
    //         }
    //     },
    //     submission: {
    //       ...defaultProps.submission,
    //       formPage1: {
    //         ...defaultProps.submission.formPage1,
    //         reCaptchaValue: 'token'
    //         }
    //     },
    //     formValues: {
    //       ...generateSubmissionBody,
    //       reCaptchaValue: 'token'
    //     },
    //     apiSubmission: {
    //       ...defaultProps.apiSubmission,
    //       handleInput: jest.fn()
    //     }
    //   };

    //   // mock window.scrollTo
    //   window.scrollTo = jest.fn();

    //   // simulate user click 'Next'
    //   const user = userEvent.setup();
    //   const { getByTestId, getByRole, debug } = await setup(props);
    //   const nextButton = getByTestId("button-next");
    //   await userEvent.click(nextButton, { delay: 0.5 });

    //   // check that tab 1 renders
    //   const tab1Form = getByRole("form");
    //   await waitFor(() => {
    //     expect(tab1Form).toBeInTheDocument();
    //   });

    //   // simulate submit with default formValues
    //   await waitFor(() => {
    //     fireEvent.submit(tab1Form);
    //   });

    //   expect(getResponseMock).toHaveBeenCalled();

    //   // restore mock
    //   getResponseMock.mockRestore();
    // });

    it("renderBodyCopy renders paragraphs matching provided body id (default copy)", async () => {
      const { getByTestId } = await setup();
      const component = getByTestId("body");
      expect(component.children.length).toBe(3);
      const par0 = getByTestId("bodyCopy0_1");
      expect(par0).toBeInTheDocument();
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
      const { queryByTestId } = await setup({}, "/");
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
    test(' "/page2" path should not render SubmissionFormPage2 component without an id in route parameters', async () => {
      const { queryByTestId } = await setup({}, "/page2");
      const subm1 = queryByTestId("component-submissionformpage1");
      const subm2 = queryByTestId("component-submissionformpage2");
      expect(subm1).toBeInTheDocument();
      expect(subm2).not.toBeInTheDocument();
    });
  });
});
