import React from "react";
import { shallow, mount } from "enzyme";
import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import {
  CreateUserFormUnconnected,
  CreateUserFormConnected
} from "../../components/CreateUser";
import {
  addUser,
  clearForm,
  handleInput
} from "../../store/actions/apiUserActions";
import * as Notifier from "../../containers/Notifier";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store;
let wrapper;

let pushMock = jest.fn();

const initialState = {
  appState: {
    loggedIn: false,
    authToken: "",
    userType: ""
  },
  user: {
    form: {
      email: "",
      name: "",
      type: "",
      existingUserEmail: ""
    },
    error: null
  }
};

const defaultProps = {
  appState: {
    loggedIn: true,
    authToken: "12345",
    userType: "admin"
  },
  apiUser: {
    handleInput: () => ({ type: "HANDLE_INPUT" }),
    addUser: () => Promise.resolve({ type: "ADD_USER_SUCCESS" }),
    clearForm: () => ({ type: "CLEAR_FORM" })
  },
  user: {
    deleteDialogOpen: false,
    form: {
      email: "",
      name: "",
      type: "",
      existingUserEmail: ""
    },
    error: null
  },
  classes: { test: "test" },
  history: {
    push: pushMock
  }
};

/**
 * Factory function to create a ShallowWrapper for the TextInputForm component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  store = mockStore(initialState);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<CreateUserFormUnconnected {...setupProps} store={store} />);
};

const unconnectedSetup = () => {
  const setupProps = { ...defaultProps };
  return shallow(<CreateUserFormUnconnected {...setupProps} />);
};

const fakeEvent = {
  preventDefault: () => {}
};

describe("<TextInputForm />", () => {
  it("renders without error", () => {
    wrapper = setup();
    const component = findByTestAttr(wrapper, "component-create-user-form");
    expect(component.length).toBe(1);
  });

  it("renders connected component", () => {
    store = storeFactory(initialState);
    wrapper = mount(
      <CreateUserFormConnected {...defaultProps} store={store} />
    );
    const component = findByTestAttr(wrapper, "component-create-user-form");
    expect(component.length).toBe(1);
  });

  it("should have access to expected props", () => {
    wrapper = setup();
    expect(wrapper.instance().props.appState.loggedIn).toBe(true);
  });

  test("calls `clearForm` on componentDidMount", () => {
    let props = {
      apiUser: { clearForm: clearForm }
    };
    store = storeFactory(initialState);
    // Create a spy of the dispatch() method for test assertions.
    const dispatchSpy = jest.spyOn(store, "dispatch");
    wrapper = mount(
      <CreateUserFormConnected {...defaultProps} {...props} store={store} />
    );

    const spyCall = dispatchSpy.mock.calls[0][0];
    expect(JSON.stringify(spyCall)).toEqual(JSON.stringify(clearForm("1")));
  });

  // this was an attempt to cover lines 116, 128,153 but did not work?
  test("calls `handleInput` when input onChange", () => {
    let props = {
      user: {
        form: {
          email: "",
          name: "",
          type: ""
        }
      }
    };
    let handleInputMock = jest.fn();
    handleInputMock = handleInputMock;
    store = storeFactory(initialState);
    wrapper = shallow(
      <CreateUserFormConnected {...defaultProps} {...props} store={store} />
    )
      .dive()
      .dive();
    wrapper.setProps({
      apiUser: { handleInput: handleInputMock }
    });
    let event = {
      preventDefault() {},
      target: {
        name: "email",
        value: "fake@email.com"
      }
    };
    const component = findByTestAttr(wrapper, "email");
    component.simulate("change", event);
    expect(handleInputMock).toBeCalledWith(event);
  });

  test("calls `addUser` on submit", () => {
    let props = {
      apiUser: { addUser: addUser },
      user: {
        form: {
          email: "fake@test.com",
          name: "Test User",
          type: "view"
        }
      }
    };

    store = storeFactory(initialState);
    // Create a spy of the dispatch() method for test assertions.
    const dispatchSpy = jest.spyOn(store, "dispatch");
    wrapper = shallow(
      <CreateUserFormConnected {...defaultProps} {...props} store={store} />
    )
      .dive()
      .dive();

    wrapper.instance().submit(fakeEvent);
    const spyCall = dispatchSpy.mock.calls[0][0];
    const { email, name, type } = wrapper.instance().props.user.form;
    const { authToken, userType } = wrapper.instance().props.appState;
    const body = {
      name,
      email,
      type,
      requestingUserType: userType
    };
    expect(JSON.stringify(spyCall)).toEqual(
      JSON.stringify(addUser(authToken, body))
    );
  });

  test("`submit` returns error if `addUser` fails", () => {
    const addUserErrorMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "ADD_USER_FAILURE" }).catch(err =>
          console.log(err)
        )
      );
    let props = {
      apiUser: { addUser: addUserErrorMock },
      user: {
        form: {
          email: "fake@test.com",
          name: "Test User",
          type: "view"
        }
      }
    };
    Notifier.openSnackbar = jest.fn();
    wrapper = shallow(
      <CreateUserFormUnconnected {...defaultProps} {...props} />
    );

    wrapper.instance().submit(fakeEvent);
    return addUserErrorMock().then(() => {
      expect(Notifier.openSnackbar).toHaveBeenCalledWith(
        "error",
        "An error occurred while trying to create new user"
      );
    });
  });

  test("`submit` returns success message if `addUser` succeeds", () => {
    const addUserMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "ADD_USER_SUCCESS" }).catch(err =>
          console.log(err)
        )
      );
    let props = {
      edit: false,
      apiUser: { addUser: addUserMock },
      user: {
        form: {
          email: "fake@test.com",
          name: "Test User",
          type: "view"
        }
      }
    };
    Notifier.openSnackbar = jest.fn();
    wrapper = shallow(
      <CreateUserFormUnconnected {...defaultProps} {...props} />
    );

    wrapper.instance().submit(fakeEvent);
    return addUserMock().then(() => {
      expect(Notifier.openSnackbar).toHaveBeenCalledWith(
        "success",
        "User Created Successfully!"
      );
    });
  });
});
