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

// keep a copy of the window object to restore
// it at the end of the tests
const oldWindowLocation = window.location;
// create mock function for window.location
let windowLocationAssignMock = jest.fn();

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
  beforeAll(() => {
    delete window.location;

    window.location = Object.defineProperties(
      {},
      {
        ...Object.getOwnPropertyDescriptors(oldWindowLocation),
        assign: {
          configurable: true,
          value: windowLocationAssignMock
        }
      }
    );
  });

  afterAll(() => {
    localStorage.clear();
    // restore `window.location` to the `jsdom` `Location` object
    window.location = oldWindowLocation;
  });

  beforeEach(() => {
    window.location.assign.mockReset();
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

  test("calls `logout` prop on componentDidMount", () => {
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

  test("clears localStorage on componentDidMount", () => {
    localStorage.setItem("test", "testData");
    const wrapper = shallow(<Logout {...defaultProps} />);
    wrapper.instance().componentDidMount();

    expect(localStorage.length).toEqual(0);
  });

  test("redirects to home route 1 second after component mount", async () => {
    const wrapper = shallow(<Logout {...defaultProps} />);

    // clear mock since componentDidMount is called in other tests
    window.location = Object.defineProperties(
      {},
      {
        ...Object.getOwnPropertyDescriptors(oldWindowLocation),
        assign: {
          configurable: true,
          value: windowLocationAssignMock
        }
      }
    );

    // run lifecycle method
    wrapper.instance().componentDidMount();
    // simulate setTimeout
    await jest.runAllTimers();

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);

    setTimeout.mockRestore();
    setTimeout(() => {
      expect(windowLocationAssignMock).toBeCalledWith("/");
    }, 1000);
  });
});
