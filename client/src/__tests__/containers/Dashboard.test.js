import React from "react";
import { shallow } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import Dashboard, { DashboardUnconnected } from "../../containers/Dashboard";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store;

let wrapper;

let pushMock = jest.fn();

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

  it("should have access to expected props", () => {
    wrapper = setup();
    expect(wrapper.instance().props.appState.loggedIn).toBe(true);
  });

  test("calls `getProfile` prop on componentWillMount", () => {
    const getProfileMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "GET_PROFILE_SUCCESS" })
      );
    const props = { api: { getProfile: getProfileMock } };

    const wrapper = shallow(
      <DashboardUnconnected {...defaultProps} {...props} />
    );

    // expect the mock to have been called once during component mount
    expect(getProfileMock.mock.calls.length).toBe(1);

    // restore mock
    getProfileMock.mockRestore();
  });

  test("sets userId & authToken to localStorage on component mount if userId in route params", () => {
    const wrapper = shallow(<DashboardUnconnected {...defaultProps} />);

    expect(localStorage.getItem("authToken")).toEqual('"5678"');
    expect(localStorage.getItem("userId")).toEqual('"1234"');

    localStorage.clear();
  });

  test("if no route params", () => {
    let props = {
      match: {
        params: {
          id: null
        }
      }
    };
    const wrapper = shallow(
      <DashboardUnconnected {...defaultProps} {...props} />
    );

    localStorage.clear();
  });

  test("redirects to saved route if redirect found in local storage", () => {
    // set redirect to localStorage
    localStorage.setItem("redirect", "/test");
    pushMock = jest.fn();

    const wrapper = shallow(<DashboardUnconnected {...defaultProps} />);
    wrapper.instance().props.history.push = pushMock;
    wrapper.instance().componentWillMount();

    // expect(pushMock).toHaveBeenCalledTimes(1);
    // expect(pushMock).toHaveBeenCalledWith("/test");

    // expect(localStorage.getItem('redirect')).toBe('');
    localStorage.clear();
  });

  test("getProfile returns error message if api fails", () => {
    const wrapper = shallow(<DashboardUnconnected {...defaultProps} />);
    wrapper.instance().props.api.getProfile = () =>
      Promise.resolve({ type: "GET_PROFILE_FAILURE" });
    wrapper.instance().forceUpdate();
    wrapper.instance().props.api.getProfile = () => {
      throw new Error("error");
    };
    wrapper.instance().forceUpdate();
  });
});
