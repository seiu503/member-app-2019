import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { within } from "@testing-library/dom";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import { NavBar } from "../../containers/NavBar";
import * as utils from "../../utils";
const theme = createTheme(adaptV4Theme);

const main_ref = {
  current: {
    classList: {
      contains: jest.fn(),
      remove: jest.fn(),
      add: jest.fn()
    }
  }
};

const defaultProps = {
  classes: {},
  appState: {
    loggedIn: true
  },
  profile: {
    profile: {
      name: "Emma Goldman",
      avatar_url: "http://www.example.com/avatar.png"
    }
  },
  location: {
    pathname: "/"
  },
  history: {
    push: jest.fn()
  },
  main_ref: { ...main_ref }
};

const setup = (props = {}) => {
  const setupProps = {
    ...defaultProps,
    ...props
  };
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <NavBar {...setupProps} />
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe("<NavBar />", () => {
  it("renders without error", () => {
    const { getByTestId } = setup();
    const component = getByTestId("component-navbar");
    expect(component).toBeInTheDocument();
  });

  test("renders a skiplink", () => {
    const { getByTestId } = setup();
    const component = getByTestId("skiplink-button");
    expect(component).toBeInTheDocument();
  });

  test("renders a logo link and logo image", () => {
    const { getByTestId, getByRole } = setup();
    const component = getByTestId("logo-link");
    expect(component).toBeInTheDocument();
    const image = getByRole("img");
    expect(image).toBeInTheDocument();
  });

  test("renders a title", () => {
    const { getByTestId } = setup();
    const component = getByTestId("title");
    expect(component).toBeInTheDocument();
  });

  test("clicking skiplink calls `skipToMain` method", async () => {
    // create a mock function so we can see whether it's called on click
    utils.skip = jest.fn();

    // set up unwrapped component with handleSubmitMock as handleSubmit prop
    const user = userEvent.setup();
    const { getByTestId } = setup();

    // simulate click
    await userEvent.click(getByTestId("skiplink-button"));

    // expect the mock to have been called once
    expect(utils.skip).toHaveBeenCalled();

    // restore mock
    utils.skip.mockRestore();
  });
});
