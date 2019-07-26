import React from "react";
import { shallow, mount } from "enzyme";
import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import queryString from "query-string";
import { defaultWelcomeInfo } from "../../utils/index";

import WelcomeInfo, {
  WelcomeInfoUnconnected
} from "../../components/WelcomeInfo";
import { getContentById } from "../../store/actions/apiContentActions";
import * as Notifier from "../../containers/Notifier";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store;
let wrapper;

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
  classes: {}
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

const unconnectedSetup = () => {
  const setupProps = { ...defaultProps };
  return shallow(<WelcomeInfoUnconnected {...setupProps} />);
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

  test("calls `getContentById` on componentDidMount for each id in props.location.search", () => {
    let props = {
      location: {
        search: "h=1&b=2&i=3"
      },
      apiContent: { getContentById: getContentById }
    };
    store = storeFactory(initialState);
    // Create a spy of the dispatch() method for test assertions.
    const dispatchSpy = jest.spyOn(store, "dispatch");
    wrapper = mount(<WelcomeInfo {...defaultProps} {...props} store={store} />);
    const spyCall1 = dispatchSpy.mock.calls[0][0];
    const spyCall2 = dispatchSpy.mock.calls[1][0];
    const spyCall3 = dispatchSpy.mock.calls[2][0];
    expect(JSON.stringify(spyCall1)).toEqual(
      JSON.stringify(getContentById("1"))
    );
    expect(JSON.stringify(spyCall2)).toEqual(
      JSON.stringify(getContentById("3"))
    );
    expect(JSON.stringify(spyCall3)).toEqual(
      JSON.stringify(getContentById("2"))
    );
  });

  test("if `getContentById` fails, openSnackbar should be called with error message", () => {
    let props = {
      location: {
        search: "h=1&b=2&i=3"
      },
      apiContent: { getContentById: getContentById }
    };

    wrapper = unconnectedSetup();

    // assign mock to openSnackbar
    Notifier.openSnackbar = jest.fn();

    // assign error mock to getContentById
    const getContentByIdErrorMock = () => {
      return Promise.reject({ type: "GET_CONTENT_BY_ID_FAILURE" });
    };

    wrapper.instance().props.apiContent.getContentById = getContentByIdErrorMock;

    wrapper.instance().componentDidMount();
    return getContentByIdErrorMock()
      .then(() => {
        expect(Notifier.openSnackbar.mock.calls.length).toBe(1);
      })
      .catch(err => console.log(err));
  });

  it("has generic content if no ids in query", () => {
    wrapper = unconnectedSetup();
    expect(wrapper.instance().state.headline).toEqual(
      defaultWelcomeInfo.headline
    );
    expect(wrapper.instance().state.body).toEqual(defaultWelcomeInfo.body);
  });
});
