import React from "react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { shallow, mount } from "enzyme";
import { findByTestAttr, storeFactory } from "../utils/testUtils";
import { AppConnected, AppUnconnected } from "../App";
import { validateToken } from "../store/actions/apiProfileActions";

import SubmissionFormPage1 from "../containers/SubmissionFormPage1";
import Dashboard from "../containers/Dashboard";
import NotFound from "../components/NotFound";
// import ContentLibrary from "../containers/ContentLibrary";
import TextInputForm from "../containers/TextInputForm";
// import Logout from "../containers/Logout";

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
  classes: {}
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
          "http://localhost:3001/api/user/1234"
    )[0];
    expect(JSON.parse(JSON.stringify(spyCall))).toEqual(
      JSON.parse(JSON.stringify(validateToken("5678", "1234")))
    );
  });

  it("if `validateToken` fails, clear localStorage", () => {
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
    test(' "/edit" path should render TextInputForm component', () => {
      wrapper = routeSetup("/edit/1234");
      expect(wrapper.find(SubmissionFormPage1)).toHaveLength(0);
      expect(wrapper.find(TextInputForm)).toHaveLength(1);
    });
    // test(' "/logout" path should render Logout component', () => {
    //   wrapper = routeSetup('/logout');
    //   expect(wrapper.find(SubmissionForm)).toHaveLength(0);
    //   expect(wrapper.find(Logout)).toHaveLength(1);
    // });
  });
});
