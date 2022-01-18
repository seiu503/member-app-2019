import React from "react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { shallow, mount } from "enzyme";
import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import {
  DashboardConnected,
  DashboardUnconnected
} from "../../containers/Dashboard";
import { getProfile } from "../../store/actions/apiProfileActions";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store;

let wrapper;

let pushMock = jest.fn();
let getProfileMock = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_PROFILE_SUCCESS", payload: {} })
  );

const initialState = {
  appState: {
    loggedIn: false,
    authToken: ""
  },
  profile: {
    profile: {
      _id: "",
      name: "",
      avatar_url: ""
    },
    error: "",
    loading: false
  }
};

const defaultProps = {
  appState: {
    loggedIn: true,
    authToken: "12345"
  },
  actions: {
    setLoggedIn: () => ({ type: "SET_LOGGED_IN" }),
    setSpinner: () => ({ type: "SET_SPINNER" })
  },
  api: {
    getProfile: getProfileMock
  },
  profile: {
    profile: {
      _id: "1234",
      name: "Emma Goldman",
      avatar_url: "http://www.example.com/avatar.png"
    },
    error: "",
    loading: false
  },
  match: {
    params: {
      id: "1234",
      token: "5678"
    }
  },
  classes: { test: "test" },
  history: {
    push: pushMock
  }
};

/**
 * Factory function to create a ShallowWrapper for the Dashboard component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  store = mockStore(defaultProps);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<DashboardUnconnected {...setupProps} store={store} />);
};

describe("<Dashboard />", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("renders without error", () => {
    wrapper = setup();
    const component = findByTestAttr(wrapper, "component-dashboard");
    expect(component.length).toBe(1);
  });

  it("renders noAccess component if not logged in", () => {
    wrapper = setup({
      appState: {
        loggedIn: false,
        authToken: undefined
      }
    });
    const component = findByTestAttr(wrapper, "component-no-access");
    // expect(component.length).toBe(1);
  });

  it("should have access to expected props", () => {
    wrapper = setup();
    expect(wrapper.instance().props.appState.loggedIn).toBe(true);
  });

  test("calls `getProfile` prop on componentDidMount", () => {
    wrapper = setup();
    wrapper
      .instance()
      .componentDidMount()
      .then(() => {
        // expect the mock to have been called once during component mount
        expect(getProfileMock.mock.calls.length).toBe(1);
      });
  });

  test("sets userId & authToken to localStorage on component mount if userId in route params", () => {
    wrapper = setup();
    wrapper.instance().componentDidMount();
    expect(localStorage.getItem("authToken")).toEqual("5678");
    expect(localStorage.getItem("userId")).toEqual("1234");

    localStorage.clear();
  });

  test("if no route params, expect getProfile to be called with value from localStorage", () => {
    let props = {
      match: {
        params: {
          id: null
        }
      }
    };
    localStorage.setItem("userId", "1234");
    localStorage.setItem("authToken", "5678");
    wrapper = setup(props);
    wrapper.instance().componentDidMount();
    expect(getProfileMock).toHaveBeenCalledWith("5678", "1234");

    localStorage.clear();
  });

  test("redirects to saved route if redirect found in local storage", async () => {
    // set redirect to localStorage
    localStorage.setItem("redirect", "/test");
    wrapper = setup();

    wrapper
      .instance()
      .componentDidMount()
      .then(() => {
        getProfileMock()
          .then(() => {
            expect(pushMock).toHaveBeenCalledWith("/test");
            expect(localStorage.getItem("redirect")).toBe(null);
            localStorage.clear();
          })
          .catch(err => {
            console.log(err);
            localStorage.clear();
          });
      });
  });

  test("getProfile returns error message if api call fails", () => {
    const getProfileError = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "GET_PROFILE_FAILURE" })
      );
    const props = {
      api: {
        getProfile: getProfileError
      }
    };
    wrapper = setup(props);
    wrapper.instance().componentDidMount();

    // expect the mock to have been called once during component mount
    expect(getProfileError.mock.calls.length).toBe(1);
  });

  test("getProfile throws error if api call fails", () => {
    const getProfileError = jest
      .fn()
      .mockImplementation(() =>
        Promise.reject({ type: "GET_PROFILE_FAILURE" })
      );
    const props = {
      api: {
        getProfile: getProfileError
      }
    };
    wrapper = setup(props);
    wrapper.instance().componentDidMount();

    // expect the mock to have been called once during component mount
    expect(getProfileError.mock.calls.length).toBe(1);
  });
});
