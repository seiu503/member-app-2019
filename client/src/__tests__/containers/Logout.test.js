import React from "react";
import { shallow } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import { Logout, mapDispatchToProps } from "../../containers/Logout";
import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();
let store;

const defaultProps = {
  actions: {
    logout: () => ({ type: "LOGOUT" })
  },
  classes: { test: "test" }
};

// mock setTimeout
jest.useFakeTimers();

/**
 * Factory function to create a ShallowWrapper for the Logout component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  store = mockStore(defaultProps);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<Logout {...setupProps} store={store} />);
};

describe("<Logout />", () => {
  // localStorage is being mocked by the npm package `jest-localstorage-mock`
  // which is required in src/setupTests.js
  afterAll(() => {
    // clear the localStorage object and the mock functions after these tests
    localStorage.__STORE__ = {};
    localStorage.mockClear();
  });

  it("renders without error", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "component-logout");
    expect(component.length).toBe(1);
  });

  it("has access to `logout` prop", () => {
    const wrapper = setup();
    expect(typeof wrapper.instance().props.actions.logout).toBe("function");
  });

  it("has access to `classes` prop", () => {
    const wrapper = setup();
    expect(typeof wrapper.instance().props.classes).toBe("object");
  });

  it("should receive correct props from redux store", () => {
    const wrapper = setup();
    expect(wrapper.instance().props.classes.test).toBe("test");
  });

  it("should dispatch redux `logout` action", () => {
    // test that the component events dispatch the expected actions
    const wrapper = setup();
    const logout = wrapper.instance().props.actions.logout;
    store.dispatch(logout());

    const actions = store.getActions();
    expect(actions).toEqual([{ type: "LOGOUT" }]);
    const dispatch = jest.fn();
    mapDispatchToProps(dispatch);
  });

  test("renders a message", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "message");
    expect(component.length).toBe(1);
  });

  test("calls `logout` prop on component mount", () => {
    // create a mock function so we can see whether it's called on component mount
    const logoutMock = jest.fn();
    const props = { actions: { logout: logoutMock }, classes: {} };

    // set up unconnected component with logoutMock as logout prop
    const wrapper = shallow(<Logout {...props} />);

    // run lifecycle method
    wrapper.instance().componentDidMount();

    // expect the mock to have been called once
    expect(logoutMock.mock.calls.length).toBe(1);

    // restore mock
    logoutMock.mockRestore();
  });

  test("clears localStorage on component mount", () => {
    // clear mock since componentDidMount is called in other tests
    localStorage.clear.mockReset();
    const wrapper = shallow(<Logout {...defaultProps} />);
    wrapper.instance().componentDidMount();

    expect(localStorage.clear).toHaveBeenCalledTimes(1);
    expect(localStorage.__STORE__).toEqual({});

    // restore mock
    localStorage.clear.mockRestore();
  });

  test("redirects to home route 1 second after component mount", () => {
    window.location.assign = jest.fn();
    const wrapper = shallow(<Logout {...defaultProps} />);

    // clear mock since componentDidMount is called in other tests
    setTimeout.mockReset();

    // run lifecycle method
    wrapper.instance().componentDidMount();
    // simulate setTimeout
    jest.runAllTimers();

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    expect(window.location.assign).toBeCalledWith("/");

    // restore mocks
    window.location.assign.mockRestore();
    setTimeout.mockRestore();
  });
});
