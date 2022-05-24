import React from "react";
import "@testing-library/jest-dom/extend-expect";
import {
  fireEvent,
  render,
  screen,
  cleanup,
  waitFor
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTheme } from "@mui/material/styles";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/styles";
import { EditUserFormUnconnected } from "../../components/EditUser";
import * as formElements from "../../components/SubmissionFormElements";

import { storeFactory } from "../../utils/testUtils";

const theme = createTheme();
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

store = storeFactory(initialState);
const setup = props => {
  const setUpProps = { ...defaultProps, ...props };
  return render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <EditUserFormUnconnected {...setUpProps} {...props} />
      </Provider>
    </ThemeProvider>
  );
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
    cleanup();
  });

  describe("render", () => {
    it("renders without error", () => {
      const { getByTestId } = setup({ classes: {} });
      const component = getByTestId("component-edit-user-form");
      expect(component).toBeInTheDocument();
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
      const { getByTestId } = setup({ ...props });
      const component = getByTestId("component-edit-user-find");
      expect(component).toBeInTheDocument();
    });
  });

  describe("findUserByEmail", () => {
    beforeEach(() => {
      handleErrorMock = jest.fn();
    });
    afterEach(() => {
      jest.restoreAllMocks();
      cleanup();
    });
    const getUserByEmailError = jest.fn().mockImplementation(() =>
      Promise.resolve({
        type: "GET_USER_BY_EMAIL_FAILURE",
        payload: { message: "Error message" }
      })
    );
    formElements.handleError = handleErrorMock;
    const suiteProps = {
      apiUser: {
        getUserByEmail: getUserByEmailError
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
    it("findUserByEmail handles error if api call fails", () => {
      const { getByTestId } = setup({ ...suiteProps });
      const component = getByTestId("user-find-form");
      fireEvent.submit(component);
      const asyncCheck = setTimeout(() => {
        expect(handleErrorMock).toHaveBeenCalled();
      }, 0);
      global.clearTimeout(asyncCheck);
    });

    it("findUserByEmail handles error if api call throws", async () => {
      const getUserByEmailError = jest
        .fn()
        .mockImplementation(() => Promise.reject("Error message"));
      formElements.handleError = handleErrorMock;
      const testProps = {
        apiUser: {
          getUserByEmail: getUserByEmailError
        }
      };
      formElements.handleError = handleErrorMock;
      const { getByTestId } = setup({ ...suiteProps, ...testProps });
      const component = getByTestId("user-find-form");
      fireEvent.submit(component);

      const asyncCheck = setTimeout(() => {
        expect(handleErrorMock).toHaveBeenCalled();
      }, 0);
      global.clearTimeout(asyncCheck);
    });
  });

  describe("deleteUser", () => {
    beforeEach(() => {
      handleErrorMock = jest.fn();
    });
    afterEach(() => {
      jest.restoreAllMocks();
      cleanup();
    });
    const suiteProps = {
      user: {
        deleteDialogOpen: true,
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
    it("calls deleteUser api prop and redirects to dashboard on success", async () => {
      deleteUserSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "DELETE_USER_SUCCESS" })
        );
      let testProps = {
        apiUser: {
          deleteUser: deleteUserSuccess,
          handleDeleteClose: handleDeleteCloseMock
        }
      };
      const { getByText } = setup({ ...suiteProps, ...testProps });
      const component = getByText("Delete");
      fireEvent.click(component);
      const asyncCheck = setTimeout(() => {
        expect(deleteUserSuccess).toHaveBeenCalled();
        expect(pushMock).toHaveBeenCalled();
      }, 0);
      global.clearTimeout(asyncCheck);
    });
    it("handles error if deleteUser api prop fails", async () => {
      formElements.handleError = handleErrorMock;
      const deleteUserError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "DELETE_USER_FAILURE" })
        );
      let testProps = {
        apiUser: {
          deleteUser: deleteUserError,
          handleDeleteClose: handleDeleteCloseMock
        }
      };
      const { getByText } = setup({ ...suiteProps, ...testProps });
      const component = getByText("Delete");
      fireEvent.click(component);
      const asyncCheck = setTimeout(() => {
        expect(handleErrorMock).toHaveBeenCalled();
      }, 0);
      global.clearTimeout(asyncCheck);
    });
    it("handles error if deleteUser api prop throws", async () => {
      formElements.handleError = handleErrorMock;
      const deleteUserError = jest.fn().mockImplementation(() =>
        Promise.reject({
          type: "DELETE_USER_FAILURE",
          payload: { message: "Error message" }
        })
      );
      let testProps = {
        apiUser: {
          deleteUser: deleteUserError,
          handleDeleteClose: handleDeleteCloseMock
        }
      };
      const { getByText } = setup({ ...suiteProps, ...testProps });
      const component = getByText("Delete");
      fireEvent.click(component);
      const asyncCheck = setTimeout(() => {
        expect(handleErrorMock).toHaveBeenCalled();
      }, 0);
      global.clearTimeout(asyncCheck);
    });
  });

  // describe("submit", () => {
  //   beforeEach(() => {
  //     handleErrorMock = jest.fn();
  //   });
  //   afterEach(() => {
  //     jest.restoreAllMocks();
  //   });
  //   test("calls `updateUser` on submit", () => {
  //     updateUserMock = jest.fn().mockImplementation(() =>
  //       Promise.resolve({
  //         type: "UPDATE_USER_SUCCESS",
  //         payload: { email: "string" }
  //       })
  //     );
  //     let props = {
  //       apiUser: {
  //         ...defaultProps.apiUser,
  //         addUser: addUserMock,
  //         updateUser: updateUserMock
  //       },
  //       user: {
  //         form: {
  //           email: "UPDATEDfake@test.com",
  //           name: "UPDATED Test User",
  //           type: "view"
  //         },
  //         currentUser: {
  //           email: "fake@test.com",
  //           name: "Test User",
  //           type: "view",
  //           id: "123456789",
  //           created_at: new Date("July 7 2019"),
  //           updated_at: new Date("July 7 2019")
  //         }
  //       }
  //     };

  //     store = storeFactory(initialState);

  //     wrapper = setup(props);

  //     wrapper.instance().submit(fakeEvent);
  //     expect(updateUserMock.mock.calls.length).toBe(1);
  //   });
  //   test("`submit` handles error if `updateUser` fails", () => {
  //     const updateUserErrorMock = jest.fn().mockImplementation(() =>
  //       Promise.resolve({
  //         type: "UPDATE_USER_FAILURE",
  //         payload: { message: "An error occurred while trying to update user" }
  //       })
  //     );
  //     let props = {
  //       apiUser: { updateUser: updateUserErrorMock },
  //       user: {
  //         form: {
  //           email: "UPDATEDfake@test.com",
  //           name: "UPDATED Test User",
  //           type: "view"
  //         },
  //         currentUser: {
  //           email: "fake@test.com",
  //           name: "Test User",
  //           type: "view",
  //           id: "123456789",
  //           created_at: new Date("July 7 2019"),
  //           updated_at: new Date("July 7 2019")
  //         }
  //       }
  //     };
  //     formElements.handleError = handleErrorMock;
  //     wrapper = shallow(
  //       <EditUserFormUnconnected {...defaultProps} {...props} />
  //     );

  //     wrapper.instance().submit(fakeEvent);
  //     return updateUserErrorMock()
  //       .then(() => {
  //         console.log(handleErrorMock.mock.calls[0]);
  //         expect(handleErrorMock.mock.calls[0][0]).toBe(
  //           "An error occurred while trying to update user"
  //         );
  //       })
  //       .catch(err => console.log(err));
  //   });

  //   test("`submit` handles error if `updateUser` throws", () => {
  //     const updateUserErrorMock = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.reject("An error occurred while trying to update user")
  //       );
  //     let props = {
  //       apiUser: { updateUser: updateUserErrorMock },
  //       user: {
  //         form: {
  //           email: "UPDATEDfake@test.com",
  //           name: "UPDATED Test User",
  //           type: "view"
  //         },
  //         currentUser: {
  //           email: "fake@test.com",
  //           name: "Test User",
  //           type: "view",
  //           id: "123456789",
  //           created_at: new Date("July 7 2019"),
  //           updated_at: new Date("July 7 2019")
  //         }
  //       }
  //     };
  //     formElements.handleError = handleErrorMock;
  //     wrapper = shallow(
  //       <EditUserFormUnconnected {...defaultProps} {...props} />
  //     );

  //     wrapper.instance().submit(fakeEvent);
  //     return updateUserErrorMock()
  //       .then(() => {
  //         console.log(handleErrorMock.mock.calls[0]);
  //         expect(handleErrorMock.mock.calls[0][0]).toBe(
  //           "An error occurred while trying to update user"
  //         );
  //       })
  //       .catch(err => console.log(err));
  //   });

  //   test("`submit` calls `updateUser`", () => {
  //     const updateUserMock = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "UPDATE_USER_SUCCESS", payload: {} })
  //       );
  //     let props = {
  //       apiUser: { updateUser: updateUserMock, clearForm: jest.fn() },
  //       user: {
  //         form: {
  //           email: "UPDATEDfake@test.com",
  //           name: "UPDATED Test User",
  //           type: "view"
  //         },
  //         currentUser: {
  //           email: "fake@test.com",
  //           name: "Test User",
  //           type: "view",
  //           id: "123456789",
  //           created_at: new Date("July 7 2019"),
  //           updated_at: new Date("July 7 2019")
  //         }
  //       }
  //     };
  //     wrapper = setup(props);

  //     wrapper.instance().submit(fakeEvent);
  //     expect(updateUserMock.mock.calls.length).toBe(1);
  //   });

  //   test("if no currentUser calls `findUserByEmail` on submit ", () => {
  //     getUserByEmailMock = jest.fn().mockImplementation(() =>
  //       Promise.resolve({
  //         type: "GET_USER_BY_EMAIL_SUCCESS",
  //         payload: { email: "string" }
  //       })
  //     );
  //     let props = {
  //       user: {
  //         form: {
  //           email: "",
  //           name: "",
  //           type: "",
  //           existingUserEmail: "fake@test.com"
  //         },
  //         currentUser: {
  //           email: "",
  //           name: "",
  //           type: "",
  //           id: "",
  //           created_at: "",
  //           updated_at: ""
  //         }
  //       },
  //       apiUser: {
  //         getUserByEmail: getUserByEmailMock
  //       }
  //     };

  //     wrapper = setup(props);

  //     wrapper
  //       .instance()
  //       .findUserByEmail(fakeEvent)
  //       .catch(err => console.log(err));

  //     expect(getUserByEmailMock.mock.calls.length).toBe(1);
  //   });

  //   test("if no currentUser `submit` returns error if `findUserByEmail` fails", () => {
  //     const getUserByEmailErrorMock = jest.fn().mockImplementation(() =>
  //       Promise.resolve({
  //         type: "GET_USER_BY_EMAIL_FAILURE",
  //         payload: { message: "An error occurred while trying to find user" }
  //       })
  //     );
  //     formElements.handleError = handleErrorMock;
  //     let props = {
  //       apiUser: { getUserByEmail: getUserByEmailErrorMock },
  //       user: {
  //         form: {
  //           email: "",
  //           name: "",
  //           type: "",
  //           existingUserEmail: ""
  //         },
  //         currentUser: {
  //           email: "",
  //           name: "",
  //           type: "",
  //           id: "",
  //           created_at: "",
  //           updated_at: ""
  //         }
  //       }
  //     };
  //     wrapper = shallow(
  //       <EditUserFormUnconnected {...defaultProps} {...props} />
  //     );

  //     wrapper
  //       .instance()
  //       .findUserByEmail(fakeEvent)
  //       .catch(err => {
  //         console.log(err);
  //       });
  //     return getUserByEmailErrorMock()
  //       .then(() => {
  //         expect(handleErrorMock.mock.calls[0][0]).toBe(
  //           "An error occurred while trying to find user"
  //         );
  //       })
  //       .catch(err => {
  //         console.log(err);
  //       });
  //   });

  //   test("if no currentUser `submit` calls findUserByEmail", () => {
  //     const getUserByEmailMock = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "GET_USER_BY_EMAIL_SUCCESS", payload: {} })
  //       );
  //     let props = {
  //       apiUser: { getUserByEmail: getUserByEmailMock },
  //       user: {
  //         form: {
  //           email: "",
  //           name: "",
  //           type: "",
  //           existingUserEmail: "fake@test.com"
  //         },
  //         currentUser: {
  //           email: "",
  //           name: "",
  //           type: "",
  //           id: "",
  //           created_at: "",
  //           updated_at: ""
  //         }
  //       }
  //     };
  //     wrapper = shallow(
  //       <EditUserFormUnconnected {...defaultProps} {...props} />
  //     );

  //     wrapper.instance().findUserByEmail(fakeEvent);
  //     expect(getUserByEmailMock.mock.calls.length).toBe(1);
  //   });
  // });

  // describe("misc methods", () => {
  //   it("handleDeleteDialogOpen calls `handleDeleteDialogOpen` prop", () => {
  //     wrapper = setup();
  //     wrapper.instance().handleDeleteDialogOpen({ id: 1 });
  //     expect(handleDeleteOpenMock.mock.calls.length).toBe(1);
  //   });
  //   it("dialogAction calls `deleteUser` and `handleDeleteClose` prop", () => {
  //     deleteUserSuccess = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "DELETE_USER_SUCCESS" })
  //       );
  //     handleDeleteCloseMock = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "HANDLE_DELETE_CLOSE" })
  //       );
  //     const props = {
  //       apiUser: {
  //         handleDeleteClose: handleDeleteCloseMock,
  //         deleteUser: deleteUserSuccess
  //       }
  //     };
  //     wrapper = setup(props);
  //     wrapper.instance().dialogAction();
  //     expect(handleDeleteCloseMock.mock.calls.length).toBe(1);
  //   });
  // });
});
