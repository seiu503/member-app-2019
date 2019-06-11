import React from "react";
import { shallow } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import { Logout } from "../../containers/Logout";

const defaultProps = {
  actions: {
    logout: jest.fn()
  },
  classes: {}
};

jest.useFakeTimers();

/**
 * Factory function to create a ShallowWrapper for the Logout component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  return shallow(<Logout {...setupProps} />);
};

describe("<Logout />", () => {
  afterAll(() => {
    localStorage.__STORE__ = {};
    localStorage.mockClear();
  });

  it("renders without error", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "component-logout");
    expect(component.length).toBe(1);
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
  });

  test("clears localStorage on component mount", () => {
    const wrapper = shallow(<Logout {...defaultProps} />);
    wrapper.instance().componentDidMount();

    // this is the second test that calls componentDidMount so
    // localStorage.clear will have been called twice
    expect(localStorage.clear).toHaveBeenCalledTimes(2);
    expect(localStorage.__STORE__).toEqual({});
  });

  test("redirects to home route 1 second after component mount", () => {
    window.location.assign = jest.fn();
    const wrapper = shallow(<Logout {...defaultProps} />);

    // run lifecycle method
    wrapper.instance().componentDidMount();
    // simulate setTimeout
    jest.runAllTimers();

    // this is the third test that calls componentDidMount so
    // setTimeout will have been called 3 times
    expect(setTimeout).toHaveBeenCalledTimes(3);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    expect(window.location.assign).toBeCalledWith("/");
  });
});
