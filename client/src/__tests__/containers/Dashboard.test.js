import React from "react";
import { shallow } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import Dashboard, { DashboardUnconnected } from "../../containers/Dashboard";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store;

let getProfileMock,
  setLoggedInMock,
  setSpinnerMock,
  getProfileErrorMock,
  wrapper;

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
    push: jest.fn()
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
  // beforeEach(() => {
  //   wrapper = setup();
  //   getProfileMock = jest
  //     .fn()
  //     .mockImplementation(() =>
  //       Promise.resolve({ type: "GET_PROFILE_SUCCESS" })
  //     );
  //   getProfileErrorMock = jest.fn().mockImplementation(() => {
  //     wrapper.instance().props.profile.error =
  //       "An error occurred while fetching the profile.";
  //     wrapper.instance().forceUpdate();
  //     return Promise.resolve({ type: "GET_PROFILE_FAILURE" });
  //   });
  //   wrapper.instance().props.api.getProfile = getProfileMock;
  // });
  // afterEach(() => {
  //   getProfileMock.mockRestore();
  //   getProfileErrorMock.mockRestore();
  //   wrapper.instance().props.profile.error = "";
  //   localStorage.clear();
  // });

  it("renders without error", () => {
    wrapper = setup();
    const component = findByTestAttr(wrapper, "component-dashboard");
    expect(component.length).toBe(1);
  });

  it("should have access to expected props", () => {
    wrapper = setup();
    expect(wrapper.instance().props.appState.loggedIn).toBe(true);
  });

  test("calls `getProfile` prop on component mount", () => {
    const getProfileMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "GET_PROFILE_SUCCESS" })
      );
    const props = { api: { getProfile: getProfileMock } };

    const wrapper = shallow(
      <DashboardUnconnected {...defaultProps} {...props} />
    );

    // run lifecycle method
    wrapper.instance().componentDidMount();

    // expect the mock to have been called once
    expect(getProfileMock.mock.calls.length).toBe(1);

    // restore mock
    getProfileMock.mockRestore();
  });

  test("sets userId & authToken to localStorage on component mount if userId in route params", () => {
    // clear mock
    localStorage.set.mockReset();
    const wrapper = shallow(<DashboardUnconnected {...defaultProps} />);
    wrapper.instance().componentDidMount();

    expect(localStorage.set).toHaveBeenCalledTimes(1);
    expect(localStorage.__STORE__).toEqual({
      userId: "1234",
      authToken: "5678"
    });

    // restore mock
    localStorage.set.mockRestore();
  });
});
