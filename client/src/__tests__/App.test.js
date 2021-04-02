import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { shallow, mount } from "enzyme";
import { findByTestAttr, storeFactory } from "../utils/testUtils";
import { AppConnected, AppUnconnected } from "../App";
import "jest-canvas-mock";

import SubmissionFormPage1 from "../containers/SubmissionFormPage1";
import SubmissionFormPage2 from "../containers/SubmissionFormPage2";
import Dashboard from "../containers/Dashboard";
import NotFound from "../components/NotFound";
import NoAccess from "../components/NoAccess";
import FormThankYou from "../components/FormThankYou";
import Login from "../components/Login";
import UserForm from "../containers/UserForm";
import * as utils from "../utils/index";
import ContentLibrary from "../containers/ContentLibrary";
import TextInputForm from "../containers/TextInputForm";
import Logout from "../containers/Logout";
import * as formElements from "../components/SubmissionFormElements";
import { defaultWelcomeInfo } from "../utils/index";

// this import is here only to get coverage for the theme file
import { theme } from "../styles/theme";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store;
let wrapper;

const oldWindowLocation = window.location;

const initialState = {
  appState: {
    loggedIn: false,
    authToken: "",
    userType: ""
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

const initialStateLoggedIn = {
  appState: {
    loggedIn: true,
    authToken: "1234",
    userType: "admin"
  },
  profile: {
    profile: {
      id: "1"
    }
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

const initialStateViewUser = {
  appState: {
    loggedIn: true,
    authToken: "1234",
    userType: "view"
  },
  profile: {
    profile: {
      id: "1"
    }
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

let validateTokenMock = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "VALIDATE_TOKEN_SUCCESS", payload: {} })
  );
let getProfileMock = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_PROFILE_SUCCESS", payload: {} })
  );
const getProfileFailure = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_PROFILE_FAILURE", payload: {} })
  );

let getResponseMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve("token"));
const handleInputMock = jest.fn();
const setActiveLanguageMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve("en"));
let getContentByIdSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_CONTENT_BY_ID_SUCCESS" })
  );

const pushMock = jest.fn();

const defaultProps = {
  appState: {
    loggedIn: true,
    authToken: "12345",
    userType: "admin"
  },
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
    },
    allSubmissions: [{ key: "value" }]
  },
  apiProfile: {
    validateToken: validateTokenMock,
    getProfile: getProfileMock
  },
  apiContent: {
    getContentById: getContentByIdSuccess
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

const setup = async (props = {}) => {
  store = mockStore(defaultProps);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<AppUnconnected {...setupProps} store={store} />);
};

const unconnectedSetup = async () => {
  const setupProps = { ...defaultProps };
  return shallow(<AppUnconnected {...setupProps} />);
};

const routeSetup = async route => {
  return mount(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <AppConnected {...defaultProps} />
      </MemoryRouter>
    </Provider>
  );
};

// const routeSetupWithMui = route => {
//   return mount(
//     <Provider store={store}>
//       <MemoryRouter initialEntries={[route]}>
//         <MuiThemeProvider theme={{
//             primary: {
//               main: "#fff"
//             }
//           }}>
//           <AppConnected {...defaultProps} />
//         </MuiThemeProvider>
//       </MemoryRouter>
//     </Provider>
//   );
// };

describe("<App />", () => {
  it("renders unconnected component", async () => {
    wrapper = await setup();
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

  it("should have access to expected props", async () => {
    wrapper = await setup();
    expect(wrapper.instance().props.appState.loggedIn).toBe(true);
  });
  describe("componentDidMount", () => {
    beforeEach(() => {
      validateTokenMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "VALIDATE_TOKEN_SUCCESS", payload: {} })
        );
      getProfileMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_PROFILE_SUCCESS", payload: {} })
        );
      getContentByIdSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_CONTENT_BY_ID_SUCCESS" })
        );
    });
    afterEach(() => {
      getContentByIdSuccess.mockClear();
      jest.restoreAllMocks();
    });
    it("if !loggedIn, componentDidMount calls `validateToken` on componentDidMount if userId & authToken found in localStorage", async () => {
      localStorage.setItem("userId", "1234");
      localStorage.setItem("authToken", "5678");
      store = storeFactory(initialState);
      const props = {
        appState: {
          loggedIn: false
        },
        match: null,
        apiProfile: {
          validateToken: validateTokenMock,
          getProfile: getProfileMock
        },
        actions: {
          setLoggedIn: jest.fn()
        },
        apiContent: {
          getContentById: getContentByIdSuccess
        }
      };
      wrapper = await setup(props);
      wrapper
        .instance()
        .componentDidMount()
        .then(() => {
          expect(validateTokenMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(`app.test.js > 269`);
          console.log(err);
        });
    });
    it("componentDidMount redirects to redirect url if redirect path found in localStorage", async () => {
      localStorage.setItem("userId", "1234");
      localStorage.setItem("authToken", "5678");
      localStorage.setItem("redirect", "redirectpath");
      store = storeFactory(initialState);
      const props = {
        appState: {
          loggedIn: false
        },
        match: null,
        apiProfile: {
          validateToken: validateTokenMock,
          getProfile: getProfileMock
        },
        apiContent: {
          getContentById: getContentByIdSuccess
        },
        actions: {
          setLoggedIn: jest.fn()
        }
      };
      wrapper = await setup(props);
      wrapper
        .instance()
        .componentDidMount()
        .then(async () => {
          await validateTokenMock();
          await getProfileMock();
          expect(pushMock).toHaveBeenCalledWith("redirectpath");
          await pushMock();
          expect(localStorage).not.toHaveProperty("redirect");
        })
        .catch(err => console.log(err));
    });
    it("`componentDidMount` checks url parameters for h, b, i, lang", async () => {
      const setActiveLanguageMock = jest.fn();
      const props = {
        setActiveLanguage: setActiveLanguageMock,
        match: {
          params: {
            id: undefined
          }
        },
        location: {
          search: "&lang=en"
        },
        appState: {
          loggedIn: false
        },
        apiProfile: {
          validateToken: validateTokenMock,
          getProfile: getProfileMock
        }
      };
      window.localStorage.setItem("userId", "undefined");
      wrapper = await setup(props);
      wrapper
        .instance()
        .componentDidMount()
        .then(async () => {
          await validateTokenMock();
          window.localStorage.getItem = jest
            .fn()
            .mockImplementation(() => "undefined");
          expect(setActiveLanguageMock).toHaveBeenCalled();
        })
        .catch(err => console.log(err));
    });
    it("`componentDidMount` edge case branches: getProfileFailure", async () => {
      const setActiveLanguageMock = jest.fn();
      const props = {
        setActiveLanguage: setActiveLanguageMock,
        match: {
          params: {
            id: undefined
          }
        },
        location: {
          search: "&lang=en"
        },
        appState: {
          loggedIn: false
        },
        apiProfile: {
          getProfile: getProfileFailure,
          validateToken: validateTokenMock
        }
      };
      window.localStorage.setItem("userId", "1234");
      window.localStorage.setItem("authToken", "5678");
      wrapper = await setup(props);
      wrapper
        .instance()
        .componentDidMount()
        .then(async () => {
          await validateTokenMock();
          window.localStorage.getItem = jest
            .fn()
            .mockImplementation(() => "undefined");
          expect(setActiveLanguageMock).toHaveBeenCalled();
        })
        .catch(err => console.log(err));
    });
    it("`componentDidMount` edge case branches: match.params.id", async () => {
      const setActiveLanguageMock = jest.fn();
      const props = {
        setActiveLanguage: setActiveLanguageMock,
        match: {
          params: {
            id: 1234
          }
        },
        location: {
          search: "&lang=en"
        },
        appState: {
          loggedIn: false
        },
        apiProfile: {
          validateToken: validateTokenMock,
          getProfile: getProfileMock
        }
      };
      window.localStorage.setItem("userId", "undefined");
      wrapper = await setup(props);
      wrapper
        .instance()
        .componentDidMount()
        .then(async () => {
          await validateTokenMock();
          window.localStorage.getItem = jest
            .fn()
            .mockImplementation(() => "undefined");
          expect(setActiveLanguageMock).toHaveBeenCalled();
        })
        .catch(err => console.log(err));
    });
    it("if !loggedIn, componentDidMount console logs error if `validateToken` throws", async () => {
      localStorage.setItem("userId", "1234");
      localStorage.setItem("authToken", "5678");
      const validateTokenErrorMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "VALIDATE_TOKEN_FAILURE" })
        );
      wrapper = await unconnectedSetup();
      wrapper.instance().props.appState.loggedIn = false;
      wrapper.instance().props.apiProfile.validateToken = validateTokenErrorMock;
      const consoleLogMock = jest.fn();
      const consoleLogOriginal = console.log;
      console.log = consoleLogMock;
      wrapper
        .instance()
        .componentDidMount()
        .then(async () => {
          return validateTokenErrorMock()
            .then(() => {
              expect(consoleLogMock.mock.calls.length).toBe(1);
              consoleLogMock.mockRestore();
              console.log = consoleLogOriginal;
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    });
    it("if `validateToken` fails, componentDidMount clears localStorage", async () => {
      window.localStorage.setItem("userId", "1234");
      window.localStorage.setItem("authToken", "5678");

      wrapper = await unconnectedSetup();
      const validateTokenErrorMock = jest.fn().mockImplementation(() => {
        return Promise.resolve({ type: "VALIDATE_TOKEN_FAILURE" });
      });
      wrapper.instance().props.appState.loggedIn = false;
      wrapper.instance().props.apiProfile.validateToken = validateTokenErrorMock;
      wrapper
        .instance()
        .componentDidMount()
        .then(async () => {
          return validateTokenErrorMock()
            .then(() => {
              expect(window.localStorage).not.toHaveProperty("userId");
              expect(window.localStorage).not.toHaveProperty("authToken");
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    });
    it("componentDidMount checks for browser language on componentDidMount", async () => {
      utils.detectDefaultLanguage = jest.fn();
      const props = {
        setActiveLanguage: setActiveLanguageMock
      };
      wrapper = await unconnectedSetup(props);
      wrapper.instance().props.appState.loggedIn = false;
      wrapper
        .instance()
        .componentDidMount()
        .then(async () => {
          await utils.detectDefaultLanguage();
          expect(setActiveLanguageMock).toHaveBeenCalled();
        })
        .catch(err => console.log(err));
    });
    it("componentDidMount calls `getContentById` for each id in props.location.search", async () => {
      wrapper = await setup();
      wrapper
        .instance()
        .componentDidMount()
        .then(async () => {
          expect(getContentByIdSuccess).toHaveBeenCalledWith("1");
          expect(getContentByIdSuccess.mock.calls.length).toBe(3);
        })
        .catch(err => console.log(err));
    });

    describe("switch", () => {
      test("headline", async () => {
        let getContentMockHeadline = () =>
          Promise.resolve({
            type: "GET_CONTENT_BY_ID_SUCCESS",
            payload: {
              id: 1,
              content_type: "headline",
              content: "fake headline"
            }
          });
        const props = {
          appState: {
            loggedIn: true
          },
          location: {
            search: "h=1"
          },
          apiContent: {
            getContentById: getContentMockHeadline
          }
        };

        wrapper = await setup(props);
        wrapper.instance().componentDidMount();
        await getContentMockHeadline().then(() => {
          expect(wrapper.state().headline.text).toEqual("fake headline");
        });
      });
      test("body", async () => {
        let getContentMockBody = () =>
          Promise.resolve({
            type: "GET_CONTENT_BY_ID_SUCCESS",
            payload: {
              id: 2,
              content_type: "bodyCopy",
              content: "fake body"
            }
          });
        const props = {
          appState: {
            loggedIn: true
          },
          location: {
            search: "b=2"
          },
          apiContent: {
            getContentById: getContentMockBody
          }
        };
        wrapper = await setup(props);
        wrapper.instance().componentDidMount();
        await getContentMockBody().then(() => {
          expect(wrapper.state().body.text).toEqual("fake body");
        });
      });
      test("image", async () => {
        let getContentMockImage = () =>
          Promise.resolve({
            type: "GET_CONTENT_BY_ID_SUCCESS",
            payload: {
              id: 3,
              content_type: "image",
              content: "fake image"
            }
          });
        const props = {
          appState: {
            loggedIn: true
          },
          location: {
            search: "i=3"
          },
          apiContent: {
            getContentById: getContentMockImage
          }
        };
        wrapper = await setup(props);
        wrapper.instance().componentDidMount();
        await getContentMockImage().then(() => {
          expect(wrapper.state().image.url).toEqual("fake image");
        });
      });
      test("break", async () => {
        let getContentMockImage = () =>
          Promise.resolve({
            type: "GET_CONTENT_BY_ID_SUCCESS",
            payload: {
              id: null,
              content_type: "break",
              content: "bad news"
            }
          });
        const props = {
          location: {
            search: "i=3"
          },
          apiContent: {
            getContentById: getContentMockImage
          }
        };
        wrapper = await setup(props);
        let originalState = wrapper.state();
        wrapper.instance().componentDidMount();
        return getContentMockImage().then(() => {
          expect(wrapper.state()).toEqual(originalState);
        });
      });
    });

    test("componentDidMount handles error if `getContentById` fails", async () => {
      const getContentByIdErrorMock = () => {
        return Promise.reject({ type: "GET_CONTENT_BY_ID_FAILURE" });
      };
      formElements.handleError = jest.fn();
      const props = {
        location: {
          search: "h=1&b=2&i=3"
        },
        apiContent: { getContentById: getContentByIdErrorMock }
      };

      wrapper = await setup(props);

      wrapper.instance().componentDidMount();
      return getContentByIdErrorMock()
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });
    });

    it("renders generic content if no ids in query", async () => {
      wrapper = await setup();
      expect(wrapper.instance().state.headline.text).toEqual(
        defaultWelcomeInfo.headline
      );
      expect(wrapper.instance().state.body.text).toEqual(
        defaultWelcomeInfo.body
      );
    });
  });
  describe("Misc methods", () => {
    it("onResolved calls recaptcha.getResponse and saves recaptcha token to redux store", async () => {
      wrapper = await unconnectedSetup();
      getResponseMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve("token"));
      wrapper.instance().recaptcha = {
        getResponse: getResponseMock
      };
      await wrapper.update();
      await wrapper.instance().onResolved();
      expect(getResponseMock.mock.calls.length).toBe(1);
      await getResponseMock().then(() => {
        expect(handleInputMock).toHaveBeenCalledWith({
          target: { name: "reCaptchaValue", value: "token" }
        });
      });
    });
    it("setRedirect saves redirect url to localStorage", async () => {
      const props = {
        history: {
          location: {
            pathname: "testpath"
          }
        }
      };
      wrapper = await setup(props);
      wrapper.instance().setRedirect();
      expect(window.localStorage.getItem("redirect")).toBe("testpath");
    });
    it("renderBodyCopy renders paragraphs matching provided body id", async () => {
      wrapper = await setup();
      const result = wrapper.instance().renderBodyCopy(0);
      expect(result.props.children.props.children.length).toBe(3);
      expect(result.props.children.props.children[0].key).toBe("bodyCopy0_1");
      const result1 = wrapper.instance().renderBodyCopy(100);
      expect(result1.props.children.props.children[0].key).toBe("0");
    });
  });

  describe("Unprotected route tests", () => {
    beforeEach(() => {
      store = storeFactory(initialState);
    });
    test("invalid path should render NotFound component", async () => {
      wrapper = await routeSetup("/random");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(NotFound)).toHaveLength(1);
    });
    test(' "/" path should render SubmissionForm component', async () => {
      wrapper = await routeSetup("/");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(1);
    });
    test(' "/thankyou" path should render ThankYou component', async () => {
      wrapper = await routeSetup("/thankyou");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(FormThankYou)).toHaveLength(1);
    });
    test(' "/page2?cId={cId}&aId={aid}" path should render SubmissionFormPage2 component', async () => {
      wrapper = await routeSetup("/page2?cId=12345678&aId=123456");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(SubmissionFormPage2)).toHaveLength(1);
    });
    test(' "/page2" path should not render SubmissionFormPage2 component without an id in route parameters', async () => {
      wrapper = await routeSetup("/page2");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(1);
      expect(wrapper.find(SubmissionFormPage2)).toHaveLength(0);
    });
    // test(' "/logout" path should render Logout component', () => {
    //   wrapper = routeSetup('/logout');
    //   expect(wrapper.find(SubmissionForm)).toHaveLength(0);
    //   expect(wrapper.find(Logout)).toHaveLength(1);
    // });
  });
  describe("Protected route tests: admin", () => {
    beforeAll(() => {
      delete window.location;

      window.location = Object.defineProperties(
        {},
        {
          ...Object.getOwnPropertyDescriptors(oldWindowLocation),
          assign: {
            configurable: true,
            value: jest.fn()
          }
        }
      );
    });
    afterAll(() => {
      window.location = oldWindowLocation;
    });

    beforeEach(() => {
      store = storeFactory(initialStateLoggedIn);
      window.location.assign.mockReset();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    test(' "/admin" path should render Dashboard component', async () => {
      wrapper = await routeSetup("/admin");
      await wrapper.update();
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(Dashboard)).toHaveLength(1);
    });
    // test(' "/content" path should render ContentLibrary component', () => {
    //   // wrapper = mount(<Provider store={store}>
    //   //       <MemoryRouter initialEntries={[ '/library' ]}>
    //   //         <MuiThemeProvider theme={theme}>
    //   //           <AppConnected {...defaultProps} />
    //   //         </MuiThemeProvider>
    //   //       </MemoryRouter>
    //   //     </Provider>
    //   // );
    //   // wrapper = routeSetupWithMui("/content");
    //   expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
    //   expect(wrapper.find(ContentLibrary)).toHaveLength(1);
    // });
    test(' "/new" path should render TextInputForm component', async () => {
      wrapper = await routeSetup("/new");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(TextInputForm)).toHaveLength(1);
    });
    test(' "/edit" path should render TextInputForm component', async () => {
      wrapper = await routeSetup("/edit/1234");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(TextInputForm)).toHaveLength(1);
    });
    test(' "/page2?cId={cId}" path should render SubmissionFormPage2 component', async () => {
      wrapper = await routeSetup("/page2?cId=12345678");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(SubmissionFormPage2)).toHaveLength(1);
    });
    test(' "/page2" path should not render SubmissionFormPage2 component without an id in route parameters', async () => {
      wrapper = await routeSetup("/page2");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(1);
      expect(wrapper.find(SubmissionFormPage2)).toHaveLength(0);
    });
    test(' "/logout" path should render Logout component', async () => {
      wrapper = await routeSetup("/logout");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(Logout)).toHaveLength(1);
    });
    test(' "/login" path should render Login component', async () => {
      wrapper = await routeSetup("/login");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(Login)).toHaveLength(1);
    });
    test(' "/users" path should render UserForm component', async () => {
      wrapper = await routeSetup("/users");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(UserForm)).toHaveLength(1);
    });
  });
  describe("Protected route tests: view", () => {
    beforeEach(() => {
      store = storeFactory(initialStateViewUser);
    });
    test(' "/content" path should render NoAccess component', async () => {
      wrapper = await routeSetup("/content");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(ContentLibrary)).toHaveLength(0);
      expect(wrapper.find(NoAccess)).toHaveLength(1);
    });
    test(' "/new" path should render NoAccess component', async () => {
      wrapper = await routeSetup("/new");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(TextInputForm)).toHaveLength(0);
      expect(wrapper.find(NoAccess)).toHaveLength(1);
    });
    test(' "/edit" path should render NoAccess component', async () => {
      wrapper = await routeSetup("/edit/1234");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(TextInputForm)).toHaveLength(0);
      expect(wrapper.find(NoAccess)).toHaveLength(1);
    });
    test(' "/users" path should render NoAccess component', async () => {
      wrapper = await routeSetup("/users");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(UserForm)).toHaveLength(0);
      expect(wrapper.find(NoAccess)).toHaveLength(1);
    });
  });
});
