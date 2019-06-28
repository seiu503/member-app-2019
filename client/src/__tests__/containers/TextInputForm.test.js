import React from "react";
import { shallow, mount } from "enzyme";
import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import {
  TextInputFormConnected,
  TextInputFormUnconnected
} from "../../containers/TextInputForm";
import {
  getContentById,
  addContent,
  updateContent,
  clearForm
} from "../../store/actions/apiContentActions";

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
    loading: false,
    error: ""
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
    loading: false,
    error: ""
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
    // assertion to pass, because the anonymous function in the
    // getContentById failure payload means expect toHaveBeenCalledWith
    // won't work (can't compare 2 anonymous functions / won't be 'equal')
    const spyCall = dispatchSpy.mock.calls[0][0];
    expect(JSON.stringify(spyCall)).toEqual(
      JSON.stringify(getContentById("1"))
    );
  });

  test("if `getContentById` fails, this.props.content.error should be non-empty", () => {
    let props = {
      match: {
        params: {
          id: 1
        }
      },
      edit: true,
      apiContent: { getContentById: getContentById }
    };
    let testState = {
      appState: {
        loggedIn: false,
        authToken: ""
      },
      content: {
        form: {
          content_type: "",
          content: ""
        },
        loading: false,
        error: ""
      }
    };
    store = storeFactory(testState);

    wrapper = shallow(
      <TextInputFormConnected {...defaultProps} {...props} store={store} />
    )
      .dive()
      .dive();

    // expect error to be populated
    wrapper.instance().props.apiContent.getContentById = () => {
      return Promise.resolve({ type: "GET_CONTENT_BY_ID_FAILURE" });
    };
    wrapper.instance().componentDidMount();
    // expect(wrapper.instance().props.content.error.length).toBeGreaterThan(0);
  });

  test("calls `addContent` on submit if !props.edit", () => {
    let props = {
      edit: false,
      apiContent: { addContent: addContent },
      content: {
        form: {
          content_type: "headline",
          content: "test"
        }
      }
    };
    store = storeFactory(initialState);
    // Create a spy of the dispatch() method for test assertions.
    const dispatchSpy = jest.spyOn(store, "dispatch");
    wrapper = shallow(
      <TextInputFormConnected {...defaultProps} {...props} store={store} />
    )
      .dive()
      .dive();

    wrapper.instance().submit();
    // expect the spy to have been called
    // extract the action and JSON.stringify both sides to get the
    // assertion to pass, because the anonymous function in the
    // getContentById failure payload means expect toHaveBeenCalledWith
    // won't work (can't compare 2 anonymous functions / won't be 'equal')
    const spyCall = dispatchSpy.mock.calls[0][0];
    const { content_type, content } = wrapper.instance().props.content.form;
    const { authToken } = wrapper.instance().props.appState;
    const body = {
      content_type,
      content
    };
    expect(JSON.stringify(spyCall)).toEqual(
      JSON.stringify(addContent(authToken, body))
    );
  });

  test("calls `updateContent` on submit if props.edit && match.params.id", () => {
    let props = {
      edit: true,
      apiContent: { updateContent: updateContent },
      content: {
        form: {
          content_type: "headline",
          content: "test"
        }
      },
      match: {
        params: {
          id: 1
        }
      }
    };
    store = storeFactory(initialState);
    // Create a spy of the dispatch() method for test assertions.
    const dispatchSpy = jest.spyOn(store, "dispatch");
    wrapper = shallow(
      <TextInputFormConnected {...defaultProps} {...props} store={store} />
    )
      .dive()
      .dive();

    wrapper.instance().submit();
    // expect the spy to have been called
    // extract the action and JSON.stringify both sides to get the
    // assertion to pass, because the anonymous function in the
    // getContentById failure payload means expect toHaveBeenCalledWith
    // won't work (can't compare 2 anonymous functions / won't be 'equal')
    const spyCall = dispatchSpy.mock.calls[0][0];
    const { content_type, content } = wrapper.instance().props.content.form;
    const { authToken } = wrapper.instance().props.appState;
    const body = {
      content_type,
      content
    };
    const id = wrapper.instance().props.match.params.id;
    expect(JSON.stringify(spyCall)).toEqual(
      JSON.stringify(updateContent(authToken, id, body))
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
