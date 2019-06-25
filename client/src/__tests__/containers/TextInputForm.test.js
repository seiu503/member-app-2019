import React from "react";
import { shallow, mount } from "enzyme";
import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import {
  TextInputFormConnected,
  TextInputFormUnconnected
} from "../../containers/TextInputForm";
import { getContentById } from "../../store/actions/apiContentActions";

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
  content: {
    form: {
      content_type: "",
      content: ""
    },
    loading: false
  }
};

const defaultProps = {
  type: "",
  appState: {
    loggedIn: true,
    authToken: "12345"
  },
  apiContent: {
    handleInput: () => ({ type: "HANDLE_INPUT" }),
    addContent: () => Promise.resolve({ type: "ADD_CONTENT_SUCCESS" }),
    clearForm: () => ({ type: "CLEAR_FORM" }),
    uploadImage: () => Promise.resolve({ type: "UPLOAD_IMAGE_SUCCESS" }),
    getContentById: () => Promise.resolve({ type: "GET_CONTENT_BY_ID_SUCCESS" })
  },
  content: {
    form: {
      content_type: "",
      content: ""
    },
    loading: false
  },
  classes: { test: "test" },
  history: {
    push: pushMock
  },
  match: {
    params: {
      id: 1
    }
  },
  edit: true
};

/**
 * Factory function to create a ShallowWrapper for the TextInputForm component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  store = mockStore(defaultProps);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<TextInputFormUnconnected {...setupProps} store={store} />);
};

describe("<TextInputForm />", () => {
  it("renders without error", () => {
    wrapper = setup();
    const component = findByTestAttr(wrapper, "component-text-input-form");
    expect(component.length).toBe(1);
  });

  it("renders connected component", () => {
    store = storeFactory(initialState);
    wrapper = mount(<TextInputFormConnected {...defaultProps} store={store} />);
    const component = findByTestAttr(wrapper, "component-text-input-form");
    expect(component.length).toBe(1);
  });

  it("should have access to expected props", () => {
    wrapper = setup();
    expect(wrapper.instance().props.appState.loggedIn).toBe(true);
  });

  test("calls `getContentById` on componentDidMount if props.edit && props.match.params.id", () => {
    let props = {
      match: {
        params: {
          id: 1
        }
      },
      edit: true,
      apiContent: { getContentById: getContentById }
    };
    store = storeFactory(initialState);
    // Create a spy of the dispatch() method for test assertions.
    const dispatchSpy = jest.spyOn(store, "dispatch");
    wrapper = mount(
      <TextInputFormConnected {...defaultProps} {...props} store={store} />
    );

    // expect the spy to have been called
    // extract the action and JSON.stringify both sides to get the
    // assertion to pass, because of the anonymouse function in the
    // getContentById failure payload
    const spyCall = dispatchSpy.mock.calls[0][0];
    expect(JSON.stringify(spyCall)).toEqual(
      JSON.stringify(getContentById("1"))
    );
  });

  test("if no route params, expect getContentById not to be called", () => {
    const getContentByIdMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "GET_CONTENT_BY_ID_SUCCESS" })
      );
    let props = {
      match: {
        params: {
          id: null
        }
      },
      apiContent: { getContentById: getContentByIdMock }
    };
    store = storeFactory(initialState);

    wrapper = mount(
      <TextInputFormConnected {...defaultProps} {...props} store={store} />
    );

    expect(getContentByIdMock.mock.calls.length).toBe(0);
  });
});
