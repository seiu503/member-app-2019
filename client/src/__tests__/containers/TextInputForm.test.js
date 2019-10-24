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
import * as Notifier from "../../containers/Notifier";

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

const unconnectedSetup = () => {
  const setupProps = { ...defaultProps };
  return shallow(<TextInputFormUnconnected {...setupProps} />);
};

const fakeEvent = {
  preventDefault: () => {}
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

  test("if `getContentById` fails, openSnackbar should be called with error message", () => {
    let props = {
      match: {
        params: {
          id: 1
        }
      },
      edit: true,
      apiContent: { getContentById: getContentById }
    };

    wrapper = unconnectedSetup();

    // assign mock to openSnackbar
    Notifier.openSnackbar = jest.fn();

    // assign error mock to getContentById
    const getContentByIdErrorMock = () => {
      return Promise.resolve({ type: "GET_CONTENT_BY_ID_FAILURE" });
    };

    wrapper.instance().props.apiContent.getContentById = getContentByIdErrorMock;

    wrapper.instance().componentDidMount();
    return getContentByIdErrorMock()
      .then(() => {
        expect(Notifier.openSnackbar.mock.calls.length).toBe(1);
      })
      .catch(err => console.log(err));
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

    wrapper.instance().submit(fakeEvent);
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

  test("`submit` returns error if `addContent` fails", () => {
    const addContentErrorMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "ADD_CONTENT_FAILURE" }).catch(err =>
          console.log(err)
        )
      );
    let props = {
      edit: false,
      apiContent: { addContent: addContentErrorMock },
      content: {
        form: {
          content_type: "headline",
          content: "test"
        }
      }
    };
    Notifier.openSnackbar = jest.fn();
    wrapper = shallow(
      <TextInputFormUnconnected {...defaultProps} {...props} />
    );

    wrapper.instance().submit(fakeEvent);
    return addContentErrorMock().then(() => {
      expect(Notifier.openSnackbar).toHaveBeenCalledWith(
        "error",
        "An error occurred while trying to save your content."
      );
    });
  });

  test("`submit` returns success message if `addContent` succeeds", () => {
    const addContentMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "ADD_CONTENT_SUCCESS" }).catch(err =>
          console.log(err)
        )
      );
    let props = {
      edit: false,
      apiContent: { addContent: addContentMock },
      content: {
        form: {
          content_type: "headline",
          content: "test"
        }
      }
    };
    Notifier.openSnackbar = jest.fn();
    wrapper = shallow(
      <TextInputFormUnconnected {...defaultProps} {...props} />
    );

    wrapper.instance().submit(fakeEvent);
    return addContentMock().then(() => {
      expect(Notifier.openSnackbar).toHaveBeenCalledWith(
        "success",
        "Saved headline."
      );
    });
  });

  test("`submit` returns error if `updateContent` fails", () => {
    const updateContentErrorMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "UPDATE_CONTENT_FAILURE" }).catch(err =>
          console.log(err)
        )
      );
    let props = {
      edit: true,
      apiContent: { updateContent: updateContentErrorMock },
      content: {
        form: {
          content_type: "headline",
          content: "test"
        }
      }
    };
    Notifier.openSnackbar = jest.fn();
    wrapper = shallow(
      <TextInputFormUnconnected {...defaultProps} {...props} />
    );

    wrapper.instance().submit(fakeEvent);
    return updateContentErrorMock().then(() => {
      expect(Notifier.openSnackbar).toHaveBeenCalledWith(
        "error",
        "An error occurred while trying to update your content."
      );
    });
  });

  test("`submit` returns error if props.edit and !match.params.id", () => {
    let props = {
      edit: true,
      content: {
        form: {
          content_type: "headline",
          content: "test"
        }
      },
      match: {
        params: {
          id: null
        }
      }
    };
    Notifier.openSnackbar = jest.fn();
    wrapper = shallow(
      <TextInputFormUnconnected {...defaultProps} {...props} />
    );

    wrapper.instance().submit(fakeEvent);
    expect(Notifier.openSnackbar).toHaveBeenCalledWith(
      "error",
      "An error occurred while trying to save your content."
    );
  });

  test("`submit` returns success message if `updateContent` succeeds", () => {
    const updateContentMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "UPDATE_CONTENT_SUCCESS" }).catch(err =>
          console.log(err)
        )
      );
    let props = {
      edit: true,
      apiContent: { updateContent: updateContentMock },
      content: {
        form: {
          content_type: "headline",
          content: "test"
        }
      }
    };
    Notifier.openSnackbar = jest.fn();
    wrapper = shallow(
      <TextInputFormUnconnected {...defaultProps} {...props} />
    );

    wrapper.instance().submit(fakeEvent);
    return updateContentMock().then(() => {
      expect(Notifier.openSnackbar).toHaveBeenCalledWith(
        "success",
        "Updated headline."
      );
    });
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

    wrapper.instance().submit(fakeEvent);
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

  test("`handeOpen` opens modal", () => {
    wrapper = shallow(<TextInputFormUnconnected {...defaultProps} />);
    wrapper.instance().handleOpen();
    expect(wrapper.instance().state.open).toBe(true);
  });

  test("`handeClose` closes modal, clears form, and redirects to '/content'", () => {
    wrapper = shallow(<TextInputFormUnconnected {...defaultProps} />);
    const clearFormMock = jest.fn();
    const pushMock = jest.fn();
    wrapper.instance().props.apiContent.clearForm = clearFormMock;
    wrapper.instance().props.history.push = pushMock;

    // set state to open to test that handleClose closes it
    wrapper.instance().setState({ open: true });

    // then call handleClose
    wrapper.instance().handleClose();

    expect(wrapper.instance().state.open).toBe(false);
    expect(clearFormMock.mock.calls.length).toBe(1);
    expect(pushMock).toHaveBeenCalledWith("/content");

    clearFormMock.mockRestore();
    pushMock.mockRestore();
  });

  test("`handeSave` saves files to state, closes modal, and calls `handleUpload`", () => {
    wrapper = shallow(<TextInputFormUnconnected {...defaultProps} />);
    const handleUploadMock = jest.fn();
    wrapper.instance().handleUpload = handleUploadMock;

    const files = [{ test: "testFile" }];

    wrapper.instance().handleSave(files);

    expect(wrapper.instance().state.open).toBe(false);
    expect(wrapper.instance().state.files).toEqual(files);
    expect(handleUploadMock.mock.calls.length).toBe(1);
    expect(handleUploadMock).toHaveBeenCalledWith(files[0]);

    handleUploadMock.mockRestore();
  });

  test("`onDropRejected` opens Snackbar with appropriate error message(s)", () => {
    wrapper = shallow(<TextInputFormUnconnected {...defaultProps} />);
    // assign mock to openSnackbar
    Notifier.openSnackbar = jest.fn();

    const rejected = [{ size: 300000000, type: "image/psd" }];

    wrapper.instance().onDropRejected(rejected);

    expect(Notifier.openSnackbar).toHaveBeenCalledWith(
      "error",
      "File too large. File size limit 2MB. Invalid file type. Accepted file types are .jpeg, .jpg, .png, and .gif."
    );

    Notifier.openSnackbar.mockRestore();
  });

  test("on success, `handleUpload` clears form, calls `uploadImage`, redirects to `library`, and opens Snackbar with success message", () => {
    wrapper = shallow(<TextInputFormUnconnected {...defaultProps} />);

    Notifier.openSnackbar = jest.fn();
    const getAllContentMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "GET_ALL_CONTENT_SUCCESS" }).catch(err =>
          console.log(err)
        )
      );
    const uploadImageMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "UPLOAD_IMAGE_SUCCESS" }).catch(err =>
          console.log(err)
        )
      );
    const pushMock = jest.fn();
    const clearFormMock = jest.fn();

    wrapper.instance().props.apiContent.getAllContent = getAllContentMock;
    wrapper.instance().props.apiContent.uploadImage = uploadImageMock;
    wrapper.instance().props.apiContent.clearForm = clearFormMock;
    wrapper.instance().props.history.push = pushMock;

    const testFile = { size: 100, type: "image/jpg", name: "testname.jpg" };

    wrapper.instance().handleUpload(testFile);
    expect(uploadImageMock.mock.calls.length).toBe(1);

    return uploadImageMock()
      .then(() => {
        expect(Notifier.openSnackbar).toHaveBeenCalledWith(
          "success",
          "testname Saved."
        );
        expect(clearFormMock.mock.calls.length).toBe(1);
        expect(pushMock).toHaveBeenCalledWith("/content");
        Notifier.openSnackbar.mockRestore();
        clearFormMock.mockRestore();
        pushMock.mockRestore();
        uploadImageMock.mockRestore();
        getAllContentMock.mockRestore();
      })
      .catch(err => console.log(err));
  });

  test("on error, `handleUpload` opens Snackbar with error message", () => {
    wrapper = shallow(<TextInputFormUnconnected {...defaultProps} />);

    Notifier.openSnackbar = jest.fn();
    const uploadImageErrorMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "UPLOAD_IMAGE_FAILURE" }).catch(err =>
          console.log(err)
        )
      );

    wrapper.instance().props.apiContent.uploadImage = uploadImageErrorMock;

    const testFile = { size: 100, type: "image/jpg", name: "testname.jpg" };

    wrapper.instance().handleUpload(testFile);

    return uploadImageErrorMock()
      .then(() => {
        expect(Notifier.openSnackbar).toHaveBeenCalledWith(
          "error",
          "An error occurred while trying to upload your image."
        );
        uploadImageErrorMock.mockRestore();
      })
      .catch(err => console.log(err));
  });
});
