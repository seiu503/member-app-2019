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
    error: null
  }
};

const clearFormMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "CLEAR_FORM" }));
let handleInputMock = jest.fn();

const defaultProps = {
  appState: {
    loggedIn: true,
    authToken: "12345",
    userType: "admin"
  },
  apiUser: {
    handleInput: handleInputMock,
    addUser: () => Promise.resolve({ type: "ADD_USER_SUCCESS" }),
    clearForm: clearFormMock
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

store = storeFactory(initialState);
const setup = props => {
  const setUpProps = { ...defaultProps, ...props };
  return render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <CreateUserFormUnconnected {...setUpProps} {...props} />
      </Provider>
    </ThemeProvider>
  );
};

const fakeEvent = {
  preventDefault: () => {}
};

describe("<CreateUser />", () => {
  it("renders without error", () => {
    const { getByTestId } = setup({ classes: {} });
    const component = getByTestId("component-create-user-form");
    expect(component).toBeInTheDocument();
  });

  test("calls `clearForm` on componentDidMount", async () => {
    let props = {
      apiUser: { clearForm: clearFormMock }
    };
    const { getByTestId } = setup({ classes: {}, ...props });
    const component = await getByTestId("component-create-user-form");
    expect(clearFormMock).toHaveBeenCalled();
  });

  test("calls `handleInput` when input onChange", async () => {
    let props = {
      apiUser: { handleInput: handleInputMock, clearForm: clearFormMock },
      user: {
        form: {
          email: "",
          name: "",
          type: ""
        }
      }
    };

    const { getByLabelText } = setup({ classes: {}, ...props });
    let event = {
      preventDefault() {},
      target: {
        name: "email",
        value: "fake@email.com"
      }
    };
    const user = userEvent.setup();
    const component = getByLabelText("email").querySelector("input");
    await user.type(component, "fake@email.com");
    expect(handleInputMock).toHaveBeenCalled();
  });

  // test("calls `addUser` on submit", () => {
  //   let props = {
  //     apiUser: { addUser: addUser },
  //     user: {
  //       form: {
  //         email: "fake@test.com",
  //         name: "Test User",
  //         type: "view"
  //       }
  //     }
  //   };

  //   store = storeFactory(initialState);
  //   // Create a spy of the dispatch() method for test assertions.
  //   const dispatchSpy = jest.spyOn(store, "dispatch");
  //   wrapper = shallow(
  //     <CreateUserFormConnected {...defaultProps} {...props} store={store} />
  //   )
  //     .dive()
  //     .dive();

  //   wrapper.instance().submit(fakeEvent);
  //   const spyCall = dispatchSpy.mock.calls[0][0];
  //   const { email, name, type } = wrapper.instance().props.user.form;
  //   const { authToken, userType } = wrapper.instance().props.appState;
  //   const body = {
  //     name,
  //     email,
  //     type,
  //     requestingUserType: userType
  //   };
  //   expect(JSON.stringify(spyCall)).toEqual(
  //     JSON.stringify(addUser(authToken, body))
  //   );
  // });

  // test("`submit` returns error if `addUser` fails", () => {
  //   const addUserErrorMock = jest
  //     .fn()
  //     .mockImplementation(() =>
  //       Promise.resolve({ type: "ADD_USER_FAILURE" }).catch(err =>
  //         console.log(err)
  //       )
  //     );
  //   let props = {
  //     apiUser: { addUser: addUserErrorMock },
  //     user: {
  //       form: {
  //         email: "fake@test.com",
  //         name: "Test User",
  //         type: "view"
  //       }
  //     }
  //   };
  //   Notifier.openSnackbar = jest.fn();
  //   wrapper = shallow(
  //     <CreateUserFormUnconnected {...defaultProps} {...props} />
  //   );

  //   wrapper.instance().submit(fakeEvent);
  //   return addUserErrorMock().then(() => {
  //     expect(Notifier.openSnackbar).toHaveBeenCalledWith(
  //       "error",
  //       "An error occurred while trying to create new user"
  //     );
  //   });
  // });

  // test("`submit` returns success message if `addUser` succeeds", () => {
  //   const addUserMock = jest
  //     .fn()
  //     .mockImplementation(() =>
  //       Promise.resolve({ type: "ADD_USER_SUCCESS" }).catch(err =>
  //         console.log(err)
  //       )
  //     );
  //   let props = {
  //     edit: false,
  //     apiUser: { addUser: addUserMock },
  //     user: {
  //       form: {
  //         email: "fake@test.com",
  //         name: "Test User",
  //         type: "view"
  //       }
  //     }
  //   };
  //   Notifier.openSnackbar = jest.fn();
  //   wrapper = shallow(
  //     <CreateUserFormUnconnected {...defaultProps} {...props} />
  //   );

  //   wrapper.instance().submit(fakeEvent);
  //   return addUserMock().then(() => {
  //     expect(Notifier.openSnackbar).toHaveBeenCalledWith(
  //       "success",
  //       "User Created Successfully!"
  //     );
  //   });
  // });
});
