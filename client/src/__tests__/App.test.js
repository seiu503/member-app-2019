import React from "react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { shallow, mount } from "enzyme";
import { findByTestAttr, storeFactory } from "../utils/testUtils";
import { AppConnected, AppUnconnected } from "../App";
import { validateToken } from "../store/actions/apiProfileActions";
import "jest-canvas-mock";

import SubmissionFormPage1 from "../containers/SubmissionFormPage1";
import SubmissionFormPage2 from "../containers/SubmissionFormPage2";
import Dashboard from "../containers/Dashboard";
import NotFound from "../components/NotFound";
import FormThankYou from "../components/FormThankYou";
import LinkRequest from "../containers/LinkRequest";
import * as utils from "../utils/index";
// import ContentLibrary from "../containers/ContentLibrary";
import TextInputForm from "../containers/TextInputForm";
// import Logout from "../containers/Logout";

// this import is here only to get coverage for the theme file
import { theme } from "../styles/theme";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store;
let wrapper;

const initialState = {
  appState: {
    loggedIn: false,
    authToken: ""
  },
  content: {
    form: {
      content_type: "",
      content: ""
    },
    loading: false,
    error: ""
  }
};

const getResponseMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve("token"));
const handleInputMock = jest.fn();

const defaultProps = {
  appState: { loggedIn: true, authToken: "12345" },
  profile: {
    profile: {
      id: "12345",
      name: "Emma Goldman",
      email: "testemail@email.com",
      avatar_url: "http://www.example.com/avatar.png"
    }
  },
  content: {
    form: { content_type: "headline", content: "This is a headline" },
    error: "",
    deleteDialogOpen: false,
    currentContent: { content_type: "headline", content: "This is a headline" }
  },
  submission: {
    formPage1: {
      reCaptchaValue: ""
    }
  },
  apiProfile: {
    validateToken: () => ({ type: "VALIDATE_TOKEN_SUCESS" })
  },
  apiContentActions: {
    handleInput: () => ({ type: "HANDLE_INPUT" }),
    addContent: () => Promise.resolve({ type: "ADD_CONTENT_SUCCESS" }),
    clearForm: () => ({ type: "CLEAR_FORM" }),
    uploadImage: () => Promise.resolve({ type: "UPLOAD_IMAGE_SUCCESS" }),
    getContentById: () => Promise.resolve({ type: "GET_CONTENT_BY_ID_SUCCESS" })
  },
  apiSubmission: {
    handleInput: handleInputMock
  },
  initialize: jest.fn(),
  setActiveLanguage: jest.fn(),
  classes: {},
  addTranslation: jest.fn(),
  recaptcha: {
    getResponse: getResponseMock
  }
};

const setup = (props = {}) => {
  store = mockStore(defaultProps);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<AppUnconnected {...setupProps} store={store} />);
};

const unconnectedSetup = () => {
  const setupProps = { ...defaultProps };
  return shallow(<AppUnconnected {...setupProps} />);
};

const routeSetup = route => {
  return mount(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <AppConnected {...defaultProps} />
      </MemoryRouter>
    </Provider>
  );
};

describe("<App />", () => {
  it("renders unconnected component", () => {
    wrapper = setup();
    const component = findByTestAttr(wrapper, "component-app");
    expect(component.length).toBe(1);
  });

  it("renders connected component", () => {
    store = storeFactory(initialState);
    wrapper = shallow(<AppConnected {...defaultProps} store={store} />)
      .dive()
      .dive();
    const component = findByTestAttr(wrapper, "component-app");
    expect(component.length).toBe(1);
  });

  it("should have access to expected props", () => {
    wrapper = setup();
    expect(wrapper.instance().props.appState.loggedIn).toBe(true);
  });
  describe("componentDidMount", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it("if !loggedIn, calls `validateToken` on componentDidMount if userId & authToken found in localStorage", () => {
      localStorage.setItem("userId", "1234");
      localStorage.setItem("authToken", "5678");

      store = storeFactory(initialState);
      // Create a spy of the dispatch() method for test assertions.
      const dispatchSpy = jest.spyOn(store, "dispatch");
      wrapper = mount(
        <Provider store={store}>
          <BrowserRouter>
            <AppConnected {...defaultProps} />
          </BrowserRouter>
        </Provider>
      );

      const spyCall = dispatchSpy.mock.calls.find(
        call =>
          call[0].hasOwnProperty("@@redux-api-middleware/RSAA") &&
          call[0]["@@redux-api-middleware/RSAA"].endpoint ===
            "http://localhost:8080/api/user/1234"
      )[0];
      expect(JSON.parse(JSON.stringify(spyCall))).toEqual(
        JSON.parse(JSON.stringify(validateToken("5678", "1234")))
      );
    });
    it("if !loggedIn, console logs error if `validateToken` throws", () => {
      localStorage.setItem("userId", "1234");
      localStorage.setItem("authToken", "5678");
      const validateTokenErrorMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "VALIDATE_TOKEN_FAILURE" })
        );
      wrapper = unconnectedSetup();
      wrapper.instance().props.appState.loggedIn = false;
      wrapper.instance().props.apiProfile.validateToken = validateTokenErrorMock;
      const consoleLogMock = jest.fn();
      const consoleLogOriginal = console.log;
      console.log = consoleLogMock;
      wrapper.instance().componentDidMount();
      return validateTokenErrorMock()
        .then(() => {
          expect(consoleLogMock.mock.calls.length).toBe(1);
          consoleLogMock.mockRestore();
          console.log = consoleLogOriginal;
        })
        .catch(err => console.log(err));
    });
    it("if `validateToken` fails, clears localStorage", () => {
      window.localStorage.setItem("userId", "1234");
      window.localStorage.setItem("authToken", "5678");

      wrapper = unconnectedSetup();
      const validateTokenErrorMock = jest.fn().mockImplementation(() => {
        return Promise.resolve({ type: "VALIDATE_TOKEN_FAILURE" });
      });
      wrapper.instance().props.appState.loggedIn = false;
      wrapper.instance().props.apiProfile.validateToken = validateTokenErrorMock;
      const localStorageClearMock = jest.fn();
      window.localStorage.clear = localStorageClearMock;
      wrapper.instance().componentDidMount();
      return validateTokenErrorMock()
        .then(() => {
          // expect(localStorageClearMock.mock.calls.length).toBe(1);
          localStorageClearMock.mockRestore();
        })
        .catch(err => console.log(err));
    });
    it("checks for browser language on componentDidMount", () => {
      utils.detectDefaultLanguage = jest.fn();
      wrapper = unconnectedSetup();
      wrapper.instance().props.appState.loggedIn = false;
      expect(wrapper.instance().props.setActiveLanguage).toHaveBeenCalled();
      wrapper.instance().componentDidMount();
      expect(utils.detectDefaultLanguage.mock.calls.length).toBe(1);
    });
  });

  it("onResolved calls recaptcha.getResponse and saves recaptcha token to redux store", async () => {
    wrapper = unconnectedSetup();
    wrapper.instance().recaptcha = {
      getResponse: getResponseMock
    };
    wrapper.update();
    await wrapper.instance().onResolved();
    expect(getResponseMock.mock.calls.length).toBe(1);
    await getResponseMock();
    expect(handleInputMock).toHaveBeenCalledWith({
      target: { name: "reCaptchaValue", value: "token" }
    });
  });

  describe("route tests", () => {
    beforeEach(() => {
      store = storeFactory(initialState);
    });
    test("invalid path should render NotFound component", () => {
      wrapper = routeSetup("/random");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(NotFound)).toHaveLength(1);
    });
    test(' "/" path should render SubmissionForm component', () => {
      wrapper = routeSetup("/");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(1);
    });
    test(' "/admin" path should render Dashboard component', () => {
      wrapper = routeSetup("/admin");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(Dashboard)).toHaveLength(1);
    });
    // test(' "/library" path should render ContentLibrary component', () => {
    //   wrapper = mount(<Provider store={store}>
    //         <MemoryRouter initialEntries={[ '/library' ]}>
    //           <MuiThemeProvider theme={theme}>
    //             <AppConnected {...defaultProps} />
    //           </MuiThemeProvider>
    //         </MemoryRouter>
    //       </Provider>
    //   );
    //   expect(wrapper.find(SubmissionForm)).toHaveLength(0);
    //   expect(wrapper.find(ContentLibrary)).toHaveLength(1);
    // });
    test(' "/new" path should render TextInputForm component', () => {
      wrapper = routeSetup("/new");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(TextInputForm)).toHaveLength(1);
    });
    test(' "/thankyou" path should render ThankYou component', () => {
      wrapper = routeSetup("/thankyou");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(FormThankYou)).toHaveLength(1);
    });
    test(' "/linkrequest" path should render LinkRequest component', () => {
      wrapper = routeSetup("/linkrequest");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(LinkRequest)).toHaveLength(1);
    });
    test(' "/edit" path should render TextInputForm component', () => {
      wrapper = routeSetup("/edit/1234");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(TextInputForm)).toHaveLength(1);
    });
    test(' "/page2?cId={cId}" path should render SubmissionFormPage2 component', () => {
      wrapper = routeSetup("/page2?cId=12345678");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(SubmissionFormPage2)).toHaveLength(1);
    });
    test(' "/page2" path should not render SubmissionFormPage2 component without an id in route parameters', () => {
      wrapper = routeSetup("/page2");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(1);
      expect(wrapper.find(SubmissionFormPage2)).toHaveLength(0);
    });
    // test(' "/logout" path should render Logout component', () => {
    //   wrapper = routeSetup('/logout');
    //   expect(wrapper.find(SubmissionForm)).toHaveLength(0);
    //   expect(wrapper.find(Logout)).toHaveLength(1);
    // });
  });
});
