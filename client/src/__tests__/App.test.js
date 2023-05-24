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

import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../styles/theme";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store;
let wrapper;

const oldWindowLocation = window.location;

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
      reCaptchaValue: ""
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
    it("componentDidMount checks for browser language on componentDidMount", async () => {
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
  });
  describe("Misc methods", () => {
    // can't get this one to work (4/19/2023), come back to it later if needed for coverage
    // it("onResolved calls recaptcha.getResponse and saves recaptcha token to redux store", async () => {
    //   getResponseMock = jest
    //     .fn()
    //     .mockImplementation(() => Promise.resolve("token"));

    //   const props = {
    //     recaptcha: {
    //       current: {
    //         getResponseMock
    //       }
    //     },
    //     formValues: {
    //       ...generateSubmissionBody
    //     }
    //   };

    //   // mock window.scrollTo
    //   window.scrollTo = jest.fn();

    //   // simulate user click 'Next'
    //   const user = userEvent.setup();
    //   const { getByTestId, getByRole, debug } = await setup({ ...props });
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
    //     expect(getResponseMock).toHaveBeenCalled();
    //   });

    //   // restore mock
    //   getResponseMock.mockRestore();
    // });

    // setRedirect appears unused 4/19/2023, delete later
    // it("setRedirect saves redirect url to localStorage", async () => {
    //   const props = {
    //     history: {
    //       location: {
    //         pathname: "testpath"
    //       }
    //     }
    //   };
    //   wrapper = await setup(props);
    //   wrapper.instance().setRedirect();
    //   expect(window.localStorage.getItem("redirect")).toBe("testpath");
    // });
    it("renderBodyCopy renders paragraphs matching provided body id (default copy)", async () => {
      const { getByTestId } = await setup();
      const component = getByTestId("body");
      expect(component.children.length).toBe(3);
      const par0 = getByTestId("bodyCopy0_1");
      expect(par0).toBeInTheDocument();
    });
    //this functionality may be removed, check coverage later
    // it("renderBodyCopy renders paragraphs matching provided body id (custom copy)", async () => {
    // const testProps = {
    //   location: {
    //     search: "?b=100"
    //   },
    //   body: {
    //     text: '',
    //     id: 100
    //   },
    // }
    // const { getByTestId } = await setup(testProps);
    // const component = getByTestId("body");
    // const par0 = getByTestId("0");
    // expect(par0).toBeInTheDocument();
    // });
  });

  describe("Unprotected route tests", () => {
    beforeEach(() => {
      store = storeFactory(initialState);
    });
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
        {},
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
