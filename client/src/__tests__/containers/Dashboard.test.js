import React from "react";
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
    getProfile: () => Promise.resolve({ type: "GET_PROFILE_SUCCESS" })
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
  it("renders without error", () => {
    wrapper = setup();
    const component = findByTestAttr(wrapper, "component-dashboard");
    expect(component.length).toBe(1);
  });

  it("renders connected component", () => {
    store = storeFactory(initialState);
    wrapper = mount(<DashboardConnected {...defaultProps} store={store} />);
    const component = findByTestAttr(wrapper, "component-dashboard");
    expect(component.length).toBe(1);
  });

  it("should have access to expected props", () => {
    wrapper = setup();
    expect(wrapper.instance().props.appState.loggedIn).toBe(true);
  });

  test("calls `getProfile` prop on componentDidMount", () => {
    const getProfileMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "GET_PROFILE_SUCCESS" })
      );
    const props = { api: { getProfile: getProfileMock } };

    wrapper = shallow(<DashboardUnconnected {...defaultProps} {...props} />);
    wrapper.instance().componentDidMount();

    // expect the mock to have been called once during component mount
    expect(getProfileMock.mock.calls.length).toBe(1);

    // restore mock
    getProfileMock.mockRestore();
  });

  test("sets userId & authToken to localStorage on component mount if userId in route params", () => {
    wrapper = shallow(<DashboardUnconnected {...defaultProps} />);

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
      },
      api: { getProfile: getProfile }
    };
    localStorage.setItem("userId", "1234");
    localStorage.setItem("authToken", "5678");
    store = storeFactory(initialState);
    // Create a spy of the dispatch() method for test assertions.
    const dispatchSpy = jest.spyOn(store, "dispatch");
    wrapper = mount(
      <DashboardConnected {...defaultProps} {...props} store={store} />
    );

    // expect the spy to have been called with the values from localStorage
    // we have to extract the action and JSON.stringify both sides to get the
    // assertion to pass, because of the anonymouse function in the getProfile
    // failure payload
    const spyCall = dispatchSpy.mock.calls[0][0];
    expect(JSON.stringify(spyCall)).toEqual(
      JSON.stringify(getProfile("5678", "1234"))
    );

    localStorage.clear();
  });

  test("redirects to saved route if redirect found in local storage", () => {
    // set redirect to localStorage
    localStorage.setItem("redirect", "/test");
    pushMock = jest.fn();

    wrapper = shallow(<DashboardUnconnected {...defaultProps} />);
    wrapper.instance().props.history.push = pushMock;
    wrapper.instance().componentDidMount();

    // expect(pushMock).toHaveBeenCalledTimes(1);
    // expect(pushMock).toHaveBeenCalledWith("/test");

    // expect(localStorage.getItem('redirect')).toBe('');
    localStorage.clear();
  });

  test("getProfile returns error message if api call fails", () => {
    const props = {
      api: {
        getProfile: () => Promise.resolve({ type: "GET_PROFILE_FAILURE" })
      }
    };
    wrapper = mount(
      <DashboardConnected {...defaultProps} {...props} store={store} />
    );
  });

  test("getProfile throws error if api call fails", () => {
    const props = {
      api: {
        getProfile: () => {
          throw new Error("error");
        }
      }
    };
    wrapper = mount(
      <DashboardConnected {...defaultProps} {...props} store={store} />
    );
  });
});
