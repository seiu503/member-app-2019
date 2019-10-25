import React from "react";
import { shallow } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import { UserFormUnconnected } from "../../containers/UserForm";
import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();
let store;

const defaultProps = {
  appState: {
    loggedIn: true,
    authToken: "1234",
    loading: false
  },
  classes: { test: "test" },
  history: {
    push: jest.fn()
  }
};

/**
 * Factory function to create a ShallowWrapper for the Logout component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  store = mockStore(defaultProps);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<UserFormUnconnected {...setupProps} store={store} />);
};

describe("<UserForm />", () => {
  afterAll(() => {
    localStorage.clear();
  });

  it("renders without error", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "user-form-container");
    expect(component.length).toBe(1);
  });

  it("has access to `loggedIn` prop", () => {
    const wrapper = setup();
    expect(typeof wrapper.instance().props.appState.loggedIn).toBe("boolean");
  });

  it("has access to `classes` prop", () => {
    const wrapper = setup();
    expect(typeof wrapper.instance().props.classes).toBe("object");
  });

  it("should receive correct props from redux store", () => {
    const wrapper = setup();
    expect(wrapper.instance().props.classes.test).toBe("test");
  });

  it("`handleChange` sets form state", () => {
    const wrapper = setup();
    wrapper.instance().handleChange({ target: { value: "editUser" } });
    expect(wrapper.instance().state.form).toBe("editUser");
  });
});
