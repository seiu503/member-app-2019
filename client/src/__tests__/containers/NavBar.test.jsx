import React from "react";
import { MemoryRouter } from "react-router-dom";
import '@testing-library/jest-dom';
import { within } from "@testing-library/dom";
import {
  fireEvent,
  render,
  screen,
  cleanup,
  waitFor
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import { NavBar } from "../../containers/NavBar";
import * as utils from "../../utils";
const theme = createTheme(adaptV4Theme);
import {
  I18nextProvider,
  useTranslation,
  withTranslation
} from "react-i18next";
import i18n from "../../translations/i18n";

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

const setup = (props = {}, route = "/") => {
  const setupProps = {
    ...defaultProps,
    ...props
  };
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>
        <I18nextProvider i18n={i18n} defaultNS={"translation"}>
          <NavBar {...setupProps} />
        </I18nextProvider>
      </MemoryRouter>
    </ThemeProvider>
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
    const { getByTestId, getByAltText } = setup();
    const component = getByTestId("logo-link");
    expect(component).toBeInTheDocument();
    const image = getByAltText("SEIU 503");
    expect(image).toBeInTheDocument();
  });

  test("renders a title", () => {
    const { getByTestId } = setup();
    const component = getByTestId("title");
    expect(component).toBeInTheDocument();
  });

  test(' "/?cape=true" path should render CAPE headline', async () => {
    const { queryByTestId } = await setup(
      { location: { search: "?cape=true&lang=en" } },
      "/?cape=true&lang=en"
    );
    const capehead = await queryByTestId("capeBanner");
    await waitFor(() => expect(capehead).toBeInTheDocument());
  });

  test("clicking skiplink calls `skipToMain` method", async () => {
    // create a mock function so we can see whether it's called on click
    utils.skip = jest.fn();

    // set up unwrapped component with handleSubmitMock as handleSubmit prop
    const user = userEvent.setup();
    const { getByTestId } = setup();

    // simulate click
    await waitFor(async() => {
      await userEvent.click(getByTestId("skiplink-button"));

      // expect the mock to have been called once
      expect(utils.skip).toHaveBeenCalled();
    });

    // restore mock
    utils.skip.mockRestore();
  });
});
