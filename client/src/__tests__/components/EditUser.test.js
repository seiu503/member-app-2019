import React from "react";
import { shallow, mount } from "enzyme";
import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import {
  EditUserFormUnconnected,
  EditUserFormConnected
} from "../../components/EditUser";
import {
  updateUser,
  getUserByEmail,
  handleDeleteDialogOpen,
  deleteUser,
  handleDeleteClose
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
    currentUser: {
      email: "",
      name: "",
      type: "",
      id: ""
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
    updateUser: () => Promise.resolve({ type: "UPDATE_USER_SUCCESS" }),
    getUserByEmail: () =>
      Promise.resolve({ type: "GET_USER_BY_EMAIL_SUCCESS" }),
    handleDeleteDialogOpen: () =>
      Promise.resolve({ type: "HANDLE_DELETE_OPEN" }),
    handleDeleteClose: () => Promise.resolve({ type: "HANDLE_DELETE_CLOSE" }),
    deleteUser: () => Promise.resolve({ type: "DELETE_USER_SUCCESS" })
  },
  user: {
    deleteDialogOpen: false,
    form: {
      email: "",
      name: "",
      type: "",
      existingUserEmail: ""
    },
    currentUser: {
      email: "fake@test.com",
      name: "Test User",
      type: "view",
      id: "123456789",
      created_at: new Date("July 7 2019"),
      updated_at: new Date("July 7 2019")
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
  store = mockStore(defaultProps);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<EditUserFormUnconnected {...setupProps} store={store} />);
};

const fakeEvent = {
  preventDefault: () => {}
};

describe("<TextInputForm />", () => {
  it("renders without error", () => {
    wrapper = setup();
    const component = findByTestAttr(wrapper, "component-edit-user-form");
    expect(component.length).toBe(1);
  });

  it("renders connected component", () => {
    store = storeFactory(defaultProps);
    wrapper = mount(<EditUserFormConnected {...defaultProps} store={store} />);
    const component = findByTestAttr(wrapper, "component-edit-user-form");
    expect(component.length).toBe(1);
  });

  it("should have access to expected props", () => {
    wrapper = setup();
    expect(wrapper.instance().props.appState.loggedIn).toBe(true);
  });

  it("renders user request form if no currentUser", () => {
    let props = {
      user: {
        deleteDialogOpen: false,
        form: {
          email: "",
          name: "",
          type: "",
          existingUserEmail: ""
        },
        currentUser: {
          email: "",
          name: "",
          type: "",
          id: "",
          created_at: "",
          updated_at: ""
        },
        error: null
      }
    };
    wrapper = setup(props);
    const component = findByTestAttr(wrapper, "component-edit-user-find");
    expect(component.length).toBe(1);
  });

  test("calls `updateUser` on submit", () => {
    let props = {
      apiUser: { updateUser: updateUser },
      user: {
        form: {
          email: "UPDATEDfake@test.com",
          name: "UPDATED Test User",
          type: "view"
        },
        currentUser: {
          email: "fake@test.com",
          name: "Test User",
          type: "view",
          id: "123456789",
          created_at: new Date("July 7 2019"),
          updated_at: new Date("July 7 2019")
        }
      }
    };

    store = storeFactory(initialState);
    // Create a spy of the dispatch() method for test assertions.
    const dispatchSpy = jest.spyOn(store, "dispatch");
    wrapper = shallow(
      <EditUserFormConnected {...defaultProps} {...props} store={store} />
    )
      .dive()
      .dive();

    wrapper.instance().submit(fakeEvent);
    const spyCall = dispatchSpy.mock.calls[0][0];
    const { email, name, type } = wrapper.instance().props.user.form;
    const { id } = wrapper.instance().props.user.currentUser;
    const { authToken, userType } = wrapper.instance().props.appState;
    const body = {
      updates: {
        email,
        // name,
        type
      },
      requestingUserType: userType
    };
    expect(JSON.stringify(spyCall)).toEqual(
      JSON.stringify(updateUser(authToken, id, body))
    );
  });

  test("`submit` returns error if `updateUser` fails", () => {
    const updateUserErrorMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "UPDATE_USER_FAILURE" }).catch(err =>
          console.log(err)
        )
      );
    let props = {
      apiUser: { updateUser: updateUserErrorMock },
      user: {
        form: {
          email: "UPDATEDfake@test.com",
          name: "UPDATED Test User",
          type: "view"
        },
        currentUser: {
          email: "fake@test.com",
          name: "Test User",
          type: "view",
          id: "123456789",
          created_at: new Date("July 7 2019"),
          updated_at: new Date("July 7 2019")
        }
      }
    };
    Notifier.openSnackbar = jest.fn();
    wrapper = shallow(<EditUserFormUnconnected {...defaultProps} {...props} />);

    wrapper.instance().submit(fakeEvent);
    return updateUserErrorMock().then(() => {
      expect(Notifier.openSnackbar).toHaveBeenCalledWith(
        "error",
        "An error occurred while trying to update user"
      );
    });
  });

  test("`submit` returns success message if `updateUser` succeeds", () => {
    const updateUserMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "UPDATE_USER_SUCCESS" }).catch(err =>
          console.log(err)
        )
      );
    let props = {
      apiUser: { updateUser: updateUserMock },
      user: {
        form: {
          email: "UPDATEDfake@test.com",
          name: "UPDATED Test User",
          type: "view"
        },
        currentUser: {
          email: "fake@test.com",
          name: "Test User",
          type: "view",
          id: "123456789",
          created_at: new Date("July 7 2019"),
          updated_at: new Date("July 7 2019")
        }
      }
    };
    Notifier.openSnackbar = jest.fn();
    wrapper = shallow(<EditUserFormUnconnected {...defaultProps} {...props} />);

    wrapper.instance().submit(fakeEvent);
    return updateUserMock().then(() => {
      expect(Notifier.openSnackbar).toHaveBeenCalledWith(
        "success",
        "User updated successfully!"
      );
    });
  });
  ////////////////////////////
  ////////////////////////////
  ////////////////////////////
  ////////////////////////////
  ////////////////////////////
  ////////////////////////////
  test("if no currentUser calls `findUserByEmail` on submit ", () => {
    let props = {
      apiUser: { getUserByEmail: getUserByEmail },
      user: {
        form: {
          email: "",
          name: "",
          type: "",
          existingUserEmail: "fake@test.com"
        },
        currentUser: {
          email: "",
          name: "",
          type: "",
          id: "",
          created_at: "",
          updated_at: ""
        }
      }
    };

    store = storeFactory(initialState);
    // Create a spy of the dispatch() method for test assertions.
    const dispatchSpy = jest.spyOn(store, "dispatch");
    wrapper = shallow(
      <EditUserFormConnected {...defaultProps} {...props} store={store} />
    )
      .dive()
      .dive();

    wrapper.instance().findUserByEmail(fakeEvent);
    const spyCall = dispatchSpy.mock.calls[0][0];
    const { existingUserEmail } = wrapper.instance().props.user.form;
    const { userType } = wrapper.instance().props.appState;
    // const body = {
    //   existingUserEmail,
    //   requestingUserType: userType
    // };
    expect(JSON.stringify(spyCall)).toEqual(
      JSON.stringify(getUserByEmail(existingUserEmail, userType))
    );
  });

  test("if no currentUser `submit` returns error if `findUserByEmail` fails", () => {
    const getUserByEmailErrorMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "GET_USER_BY_EMAIL_FAILURE" }).catch(err =>
          console.log(err)
        )
      );
    let props = {
      apiUser: { getUserByEmail: getUserByEmailErrorMock },
      user: {
        form: {
          email: "",
          name: "",
          type: "",
          existingUserEmail: ""
        },
        currentUser: {
          email: "",
          name: "",
          type: "",
          id: "",
          created_at: "",
          updated_at: ""
        }
      }
    };
    Notifier.openSnackbar = jest.fn();
    wrapper = shallow(<EditUserFormUnconnected {...defaultProps} {...props} />);

    wrapper.instance().findUserByEmail(fakeEvent);
    return getUserByEmailErrorMock().then(() => {
      expect(Notifier.openSnackbar).toHaveBeenCalledWith(
        "error",
        "An error occurred while trying to find user"
      );
    });
  });

  test("if no currentUser `submit` returns success message if `findUserByEmail` succeeds", () => {
    const getUserByEmailMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "GET_USER_BY_EMAIL_SUCCESS" }).catch(err =>
          console.log(err)
        )
      );
    let props = {
      apiUser: { getUserByEmail: getUserByEmailMock },
      user: {
        form: {
          email: "",
          name: "",
          type: "",
          existingUserEmail: "fake@test.com"
        },
        currentUser: {
          email: "",
          name: "",
          type: "",
          id: "",
          created_at: "",
          updated_at: ""
        }
      }
    };
    Notifier.openSnackbar = jest.fn();
    wrapper = shallow(<EditUserFormUnconnected {...defaultProps} {...props} />);

    wrapper.instance().findUserByEmail(fakeEvent);
    return getUserByEmailMock().then(() => {
      expect(Notifier.openSnackbar).toHaveBeenCalledWith(
        "success",
        "User found successfully!"
      );
    });
  });
});
