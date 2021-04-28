import React from "react";
import { shallow, mount } from "enzyme";
import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import { Provider } from "react-redux";
import {
  EditUserFormUnconnected,
  EditUserFormConnected
} from "../../components/EditUser";
import * as formElements from "../../components/SubmissionFormElements";

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
      id: "1"
    },
    error: null
  }
};

let handleErrorMock = jest.fn();
const addUserMock = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "ADD_USER_SUCCESS", payload: { email: "string" } })
  );
let updateUserMock = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "UPDATE_USER_SUCCESS",
    payload: { email: "string" }
  })
);
let getUserByEmailMock = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "GET_USER_BY_EMAIL_SUCCESS",
    payload: { email: "string" }
  })
);
const handleDeleteOpenMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "HANDLE_DELETE_OPEN" }));
let handleDeleteCloseMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "HANDLE_DELETE_CLOSE" }));
let deleteUserSuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "DELETE_USER_SUCCESS" }));

const defaultProps = {
  appState: {
    loggedIn: true,
    authToken: "12345",
    userType: "admin"
  },
  apiUser: {
    updateUser: updateUserMock,
    getUserByEmail: getUserByEmailMock,
    handleDeleteOpen: handleDeleteOpenMock,
    handleDeleteClose: handleDeleteCloseMock,
    deleteUser: deleteUserSuccess,
    addUser: addUserMock,
    clearForm: jest.fn()
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
 * Factory function to create a ShallowWrapper for the EditUser component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  store = mockStore(initialState);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<EditUserFormUnconnected {...setupProps} store={store} />);
};

const fakeEvent = {
  preventDefault: () => {}
};

describe("<EditUser />", () => {
  beforeEach(() => {
    handleErrorMock = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("render", () => {
    it("renders without error", () => {
      wrapper = setup();
      const component = findByTestAttr(wrapper, "component-edit-user-form");
      expect(component.length).toBe(1);
    });

    it("renders connected component", () => {
      store = storeFactory(initialState);
      let props = {
        user: {
          currentUser: {
            id: "1"
          }
        }
      };

      wrapper = shallow(
        <EditUserFormConnected {...defaultProps} store={store} />
      )
        .dive()
        .dive();

      wrapper.instance().props.user.currentUser.id = "1";
      wrapper.update();
      const component = findByTestAttr(wrapper, "component-edit-user-form");
      expect(component.length).toBe(1);
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

    it("should have access to expected props", () => {
      wrapper = setup();
      expect(wrapper.instance().props.appState.loggedIn).toBe(true);
    });
  });

  describe("componentDidMount", () => {
    beforeEach(() => {
      handleErrorMock = jest.fn();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it("findUserByEmail handles error if api call fails", () => {
      const getUserByEmailError = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "GET_USER_BY_EMAIL_FAILURE",
          payload: { message: "Error message" }
        })
      );
      formElements.handleError = handleErrorMock;
      const props = {
        apiUser: {
          getUserByEmail: getUserByEmailError
        }
      };
      wrapper = setup(props);
      wrapper.instance().findUserByEmail(fakeEvent);
      return getUserByEmailError()
        .then(() => {
          expect(handleErrorMock.mock.calls[0][0]).toBe("Error message");
        })
        .catch(err => console.log(err));
    });

    it("findUserByEmail handles error if api call throws", () => {
      const getUserByEmailError = jest
        .fn()
        .mockImplementation(() => Promise.reject("Error message"));
      formElements.handleError = handleErrorMock;
      const props = {
        apiUser: {
          getUserByEmail: getUserByEmailError
        }
      };
      wrapper = setup(props);
      wrapper.instance().findUserByEmail(fakeEvent);
      return getUserByEmailError()
        .then(() => {
          console.log(handleErrorMock.mock.calls);
          expect(handleErrorMock.mock.calls[0][0]).toBe("Error message");
        })
        .catch(err => console.log(err));
    });
  });

  describe("deleteUser", () => {
    beforeEach(() => {
      handleErrorMock = jest.fn();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it("calls deleteUser api prop and redirects to dashboard on success", async () => {
      deleteUserSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "DELETE_USER_SUCCESS" })
        );
      let props = {
        apiUser: {
          deleteUser: deleteUserSuccess
        }
      };

      wrapper = setup(props);
      await wrapper.instance().deleteUser({ id: 1 });
      expect(deleteUserSuccess.mock.calls.length).toBe(1);
      await deleteUserSuccess().catch(err => console.log(err));
      expect(pushMock.mock.calls.length).toBe(1);
    });
    it("handles error if deleteUser api prop fails", async () => {
      formElements.handleError = handleErrorMock;
      const deleteUserError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "DELETE_USER_FAILURE" })
        );
      const props = {
        apiUser: {
          deleteUser: deleteUserError
        }
      };
      wrapper = setup(props);
      wrapper.instance().deleteUser({ id: 1 });
      await deleteUserError();
      expect(handleErrorMock.mock.calls.length).toBe(1);
    });
    it("handles error if deleteUser api prop throws", async () => {
      formElements.handleError = handleErrorMock;
      const deleteUserError = jest.fn().mockImplementation(() =>
        Promise.reject({
          type: "DELETE_USER_FAILURE",
          payload: { message: "Error message" }
        })
      );
      const props = {
        apiUser: {
          deleteUser: deleteUserError
        }
      };
      wrapper = setup(props);
      wrapper
        .instance()
        .deleteUser({ id: 1 })
        .catch(err => console.log(err));
      await deleteUserError().catch(err => console.log(err));
      expect(handleErrorMock.mock.calls.length).toBe(1);
    });
  });

  describe("submit", () => {
    beforeEach(() => {
      handleErrorMock = jest.fn();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    test("calls `updateUser` on submit", () => {
      updateUserMock = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "UPDATE_USER_SUCCESS",
          payload: { email: "string" }
        })
      );
      let props = {
        apiUser: {
          ...defaultProps.apiUser,
          addUser: addUserMock,
          updateUser: updateUserMock
        },
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

      wrapper = setup(props);

      wrapper.instance().submit(fakeEvent);
      expect(updateUserMock.mock.calls.length).toBe(1);
    });
    test("`submit` handles error if `updateUser` fails", () => {
      const updateUserErrorMock = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "UPDATE_USER_FAILURE",
          payload: { message: "An error occurred while trying to update user" }
        })
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
      formElements.handleError = handleErrorMock;
      wrapper = shallow(
        <EditUserFormUnconnected {...defaultProps} {...props} />
      );

      wrapper.instance().submit(fakeEvent);
      return updateUserErrorMock()
        .then(() => {
          console.log(handleErrorMock.mock.calls[0]);
          expect(handleErrorMock.mock.calls[0][0]).toBe(
            "An error occurred while trying to update user"
          );
        })
        .catch(err => console.log(err));
    });

    test("`submit` handles error if `updateUser` throws", () => {
      const updateUserErrorMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject("An error occurred while trying to update user")
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
      formElements.handleError = handleErrorMock;
      wrapper = shallow(
        <EditUserFormUnconnected {...defaultProps} {...props} />
      );

      wrapper.instance().submit(fakeEvent);
      return updateUserErrorMock()
        .then(() => {
          console.log(handleErrorMock.mock.calls[0]);
          expect(handleErrorMock.mock.calls[0][0]).toBe(
            "An error occurred while trying to update user"
          );
        })
        .catch(err => console.log(err));
    });

    test("`submit` calls `updateUser`", () => {
      const updateUserMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_USER_SUCCESS", payload: {} })
        );
      let props = {
        apiUser: { updateUser: updateUserMock, clearForm: jest.fn() },
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
      wrapper = setup(props);

      wrapper.instance().submit(fakeEvent);
      expect(updateUserMock.mock.calls.length).toBe(1);
    });

    test("if no currentUser calls `findUserByEmail` on submit ", () => {
      getUserByEmailMock = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "GET_USER_BY_EMAIL_SUCCESS",
          payload: { email: "string" }
        })
      );
      let props = {
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
        },
        apiUser: {
          getUserByEmail: getUserByEmailMock
        }
      };

      wrapper = setup(props);

      wrapper
        .instance()
        .findUserByEmail(fakeEvent)
        .catch(err => console.log(err));

      expect(getUserByEmailMock.mock.calls.length).toBe(1);
    });

    test("if no currentUser `submit` returns error if `findUserByEmail` fails", () => {
      const getUserByEmailErrorMock = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "GET_USER_BY_EMAIL_FAILURE",
          payload: { message: "An error occurred while trying to find user" }
        })
      );
      formElements.handleError = handleErrorMock;
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
      wrapper = shallow(
        <EditUserFormUnconnected {...defaultProps} {...props} />
      );

      wrapper
        .instance()
        .findUserByEmail(fakeEvent)
        .catch(err => {
          console.log(err);
        });
      return getUserByEmailErrorMock()
        .then(() => {
          expect(handleErrorMock.mock.calls[0][0]).toBe(
            "An error occurred while trying to find user"
          );
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("if no currentUser `submit` calls findUserByEmail", () => {
      const getUserByEmailMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_USER_BY_EMAIL_SUCCESS", payload: {} })
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
      wrapper = shallow(
        <EditUserFormUnconnected {...defaultProps} {...props} />
      );

      wrapper.instance().findUserByEmail(fakeEvent);
      expect(getUserByEmailMock.mock.calls.length).toBe(1);
    });
  });

  describe("misc methods", () => {
    it("handleDeleteDialogOpen calls `handleDeleteDialogOpen` prop", () => {
      wrapper = setup();
      wrapper.instance().handleDeleteDialogOpen({ id: 1 });
      expect(handleDeleteOpenMock.mock.calls.length).toBe(1);
    });
    it("dialogAction calls `deleteUser` and `handleDeleteClose` prop", () => {
      deleteUserSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "DELETE_USER_SUCCESS" })
        );
      handleDeleteCloseMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "HANDLE_DELETE_CLOSE" })
        );
      const props = {
        apiUser: {
          handleDeleteClose: handleDeleteCloseMock,
          deleteUser: deleteUserSuccess
        }
      };
      wrapper = setup(props);
      wrapper.instance().dialogAction();
      expect(handleDeleteCloseMock.mock.calls.length).toBe(1);
    });
  });
});
