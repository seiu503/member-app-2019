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
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/styles";
import { CreateUserFormUnconnected } from "../../components/CreateUser";
import {
  addUser,
  clearForm,
  handleInput
} from "../../store/actions/apiUserActions";
import * as Notifier from "../../containers/Notifier";

import { storeFactory } from "../../utils/testUtils";

const theme = createTheme(adaptV4Theme);
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
const addUserMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "ADD_USER_SUCCESS" }));

const defaultProps = {
  appState: {
    loggedIn: true,
    authToken: "12345",
    userType: "admin"
  },
  apiUser: {
    handleInput: handleInputMock,
    addUser: addUserMock,
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

  test("calls `addUser` on submit", async () => {
    let testProps = {
      user: {
        form: {
          email: "fake@test.com",
          name: "Test User",
          type: "view"
        }
      }
    };

    const { getByTestId, debug } = await setup({ ...testProps });
    const component = getByTestId("user-form");
    fireEvent.submit(component);
    expect(addUserMock).toHaveBeenCalled();
  });

  test("`submit` returns error if `addUser` fails", async () => {
    const addUserErrorMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "ADD_USER_FAILURE" }).catch(err =>
          console.log(err)
        )
      );
    let testProps = {
      apiUser: {
        addUser: addUserErrorMock,
        clearForm: clearFormMock
      },
      user: {
        form: {
          email: "fake@test.com",
          name: "Test User",
          type: "view"
        }
      }
    };
    Notifier.openSnackbar = jest.fn();
    const { getByTestId, debug } = await setup({ ...testProps });
    const component = getByTestId("user-form");
    fireEvent.submit(component);
    expect(addUserErrorMock).toHaveBeenCalled();

    return addUserErrorMock().then(() => {
      expect(Notifier.openSnackbar).toHaveBeenCalledWith(
        "error",
        "An error occurred while trying to create new user"
      );
    });
  });

  test("`submit` returns success message if `addUser` succeeds", async () => {
    let addUserMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "ADD_USER_SUCCESS" }).catch(err =>
          console.log(err)
        )
      );
    let testProps = {
      edit: false,
      apiUser: {
        addUser: addUserMock,
        clearForm: clearFormMock
      },
      user: {
        form: {
          email: "fake@test.com",
          name: "Test User",
          type: "view"
        }
      }
    };
    Notifier.openSnackbar = jest.fn();
    const { getByTestId, debug } = await setup({ ...testProps });
    const component = getByTestId("user-form");
    fireEvent.submit(component);
    expect(addUserMock).toHaveBeenCalled();

    return addUserMock().then(() => {
      expect(Notifier.openSnackbar).toHaveBeenCalledWith(
        "success",
        "User Created Successfully!"
      );
    });
  });
});
