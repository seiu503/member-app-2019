import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "@testing-library/jest-dom/extend-expect";
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

formElements.employerTypeMap = {
  PNP: "Non-Profit",
  Retirees: "Retired",
  State: "State Agency",
  "Nursing Homes": "Nursing Home",
  "State Homecare": "State Homecare or Personal Support",
  "Higher Ed": "Higher Education",
  "Local Gov": "Local Government (City, County, School District)",
  AFH: "Adult Foster Home",
  "Child Care": "Child Care",
  "Private Homecare": "Private Homecare Agency",
  "Community Members": "Community Member",
  "COMMUNITY MEMBERS": "Community Member",
  "SEIU LOCAL 503 OPEU": "",
  // "SEIU LOCAL 503 OPEU": "SEIU 503 Staff"
  // removing staff from picklist options
  test: "TEST"
};

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
      .mockImplementation(() => Promise.resolve([...employersPayload]))
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

  // it("should have access to expected props", async () => {
  //   wrapper = await setup();
  //   expect(wrapper.instance().props.appState.loggedIn).toBe(true);
  // });
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
    it("onResolved calls recaptcha.getResponse and saves recaptcha token to redux store", async () => {
      getResponseMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve("token"));

      const props = {
        recaptcha: {
          current: {
            getResponseMock
          }
        },
        formValues: {
          ...generateSubmissionBody
        }
      };

      // mock window.scrollTo
      window.scrollTo = jest.fn();

      // simulate user click 'Next'
      const user = userEvent.setup();
      const { getByTestId, getByRole } = await setup({ ...props });
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton, { delay: 0.5 });

      // check that tab 1 renders
      const tab1Form = getByRole("form");
      await waitFor(() => {
        expect(tab1Form).toBeInTheDocument();
      });

      // const handleSubmit = jest.fn();
      // tab1Form.onsubmit = handleSubmit;

      // simulate submit with default formValues
      // const submitButton = getByTestId("button-submit");
      // console.log(submitButton);
      await waitFor(() => {
        // userEvent.click(submitButton, { delay: 0.5 });
        fireEvent.submit(tab1Form);
        expect(handleSubmit).toHaveBeenCalled();
      });

      // expect the mock to have been called once
      // await waitFor(() => {
      //   expect(getResponseMock).toHaveBeenCalled();
      // });
      // await getResponseMock().then(() => {
      //   expect(handleInputMock).toHaveBeenCalledWith({
      //     target: { name: "reCaptchaValue", value: "token" }
      //   });

      // // restore mock
      // getResponseMock.mockRestore();
    });
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
    // it("renderBodyCopy renders paragraphs matching provided body id", async () => {
    //   wrapper = await setup();
    //   const result = wrapper.instance().renderBodyCopy(0);
    //   expect(result.props.children.props.children.length).toBe(3);
    //   expect(result.props.children.props.children[0].key).toBe("bodyCopy0_1");
    //   const result1 = wrapper.instance().renderBodyCopy(100);
    //   expect(result1.props.children.props.children[0].key).toBe("0");
    // });
  });

  // describe("Unprotected route tests", () => {
  //   beforeEach(() => {
  //     store = storeFactory(initialState);
  //   });
  //   test("invalid path should render NotFound component", async () => {
  //     wrapper = await routeSetup("/random");
  //     expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
  //     expect(wrapper.find(NotFound)).toHaveLength(1);
  //   });
  //   test(' "/" path should render SubmissionForm component', async () => {
  //     wrapper = await routeSetup("/");
  //     expect(wrapper.find(SubmissionFormPage1)).toHaveLength(1);
  //   });
  //   test(' "/thankyou" path should render ThankYou component', async () => {
  //     wrapper = await routeSetup("/thankyou");
  //     expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
  //     expect(wrapper.find(FormThankYou)).toHaveLength(1);
  //   });
  //   test(' "/page2?cId={cId}&aId={aid}" path should render SubmissionFormPage2 component', async () => {
  //     wrapper = await routeSetup("/page2?cId=12345678&aId=123456");
  //     expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
  //     expect(wrapper.find(SubmissionFormPage2)).toHaveLength(1);
  //   });
  //   test(' "/page2" path should not render SubmissionFormPage2 component without an id in route parameters', async () => {
  //     wrapper = await routeSetup("/page2");
  //     expect(wrapper.find(SubmissionFormPage1)).toHaveLength(1);
  //     expect(wrapper.find(SubmissionFormPage2)).toHaveLength(0);
  //   });
  //   // test(' "/logout" path should render Logout component', () => {
  //   //   wrapper = routeSetup('/logout');
  //   //   expect(wrapper.find(SubmissionForm)).toHaveLength(0);
  //   //   expect(wrapper.find(Logout)).toHaveLength(1);
  //   // });
});
// });
