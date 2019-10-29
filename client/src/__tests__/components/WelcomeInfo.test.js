import React from "react";
import { shallow, mount } from "enzyme";
import { findByTestAttr, storeFactory } from "../../utils/testUtils";

import WelcomeInfo, {
  WelcomeInfoUnconnected
} from "../../components/WelcomeInfo";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store, wrapper;

const initialState = {
  appState: {
    loading: false
  }
};

const defaultProps = {
  location: {
    search: ""
  },
  apiContent: {
    getContentById: () => Promise.resolve({ type: "GET_CONTENT_BY_ID_SUCCESS" })
  },
  appState: {
    loading: false
  },
  classes: {},
  headline: {
    id: 1,
    text: ""
  },
  image: {
    id: 2,
    url: "blah"
  },
  body: {
    id: 3,
    text: ""
  },
  renderBodyCopy: jest.fn()
};

/**
 * Factory function to create a ShallowWrapper for the WelcomeInfo component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  store = mockStore(defaultProps);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<WelcomeInfoUnconnected {...setupProps} store={store} />);
};

describe("<WelcomeInfo />", () => {
  it("renders without error", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "component-welcome-info");
    expect(component.length).toBe(1);
  });

  it("renders connected component", () => {
    store = storeFactory(initialState);
    wrapper = mount(<WelcomeInfo {...defaultProps} store={store} />);
    const component = findByTestAttr(wrapper, "component-welcome-info");
    expect(component.length).toBe(1);
  });

  it("should have access to expected props", () => {
    wrapper = setup();
    expect(wrapper.instance().props.location.search).toBe("");
  });
});
