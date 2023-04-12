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

  test("renders a menu button", () => {
    const { getByTestId } = setup({ loggedIn: true });
    const component = getByTestId("menu-button");
    expect(component).toBeInTheDocument();
  });

  test("renders a menu", () => {
    const { getByTestId } = setup();
    const component = getByTestId("menu");
    expect(component).toBeInTheDocument();
  });

  // test("if `loggedId` = true, renders admin menu links", () => {
  //   const wrapper = setup({ appState: { loggedIn: true } });
  //   const component = findByTestAttr(wrapper, "admin-menu-links");
  //   expect(component.length).toBe(1);
  // });

  // test("if `loggedId` = false, does not render admin menu links", () => {
  //   const wrapper = setup({ appState: { loggedIn: false } });
  //   const component = findByTestAttr(wrapper, "admin-menu-links");
  //   expect(component.length).toBe(0);
  // });

  test("clicking skiplink calls `skipToMain` method", () => {
    // create a mock function so we can see whether it's called on click
    utils.skip = jest.fn();
    const wrapper = setup();

    // simulate click
    const skipLink = findByTestAttr(wrapper, "skiplink-button");
    skipLink.simulate("click");

    // expect the mock to have been called once
    expect(utils.skip.mock.calls.length).toBe(1);

    // restore mock
    utils.skip.mockRestore();
  });

  test("clicking mobile menu button calls `handleClick` function", () => {
    const wrapper = setup({});
    const menuButton = findByTestAttr(wrapper, "menu-button");

    // mock handleClick function
    wrapper.instance().handleClick = jest.fn();

    // mock event and simulate click
    const mockedEvent = { currentTarget: {} };
    menuButton.simulate("click", mockedEvent);

    // expect the handleClick function to have been called
    expect(wrapper.instance().handleClick).toBeCalled();
  });

  test("clicking mobile menu item calls `handleClose` function", () => {
    const wrapper = setup();
    const menuItem = findByTestAttr(wrapper, "mobile-link")
      .first()
      .dive();

    // mock handleClose function
    const handleCloseMock = jest.fn();
    menuItem.setProps({ handleClose: handleCloseMock });

    // simulate click
    menuItem.simulate("click");

    // expect the handleClose mock to have been called once
    expect(handleCloseMock.mock.calls.length).toBe(1);

    // restore mock
    handleCloseMock.mockRestore();
  });

  test("clicking mobile menu item redirects to correct link", () => {
    const wrapper = setup();
    const menuItem = findByTestAttr(wrapper, "mobile-link")
      .first()
      .dive();
    menuItem.setProps({ link: "home" });

    // mock `history.push()`
    const pushMock = jest.fn();
    wrapper.setProps({ history: { push: pushMock } });

    // simulate click
    menuItem.simulate("click");

    // expect the `history.push` mock to have been called with correct link
    expect(pushMock.mock.calls.length).toBe(1);
    expect(pushMock.mock.calls[0]).toEqual(["/home"]);

    // restore mock
    pushMock.mockRestore();
  });

  test("`handleClick` sets anchorEl to current target", () => {
    const wrapper = setup();
    wrapper.setState({ anchorEl: null });

    // call instance method with mocked event
    const mockedEvent = { currentTarget: { nodeName: "button" } };
    wrapper.instance().handleClick(mockedEvent);

    expect(wrapper.instance().state.anchorEl).toStrictEqual(
      mockedEvent.currentTarget
    );
  });

  test("`handleClose` sets anchorEl to null", () => {
    const wrapper = setup();
    wrapper.setState({ anchorEl: { nodeName: "button" } });

    // call instance method
    wrapper.instance().handleClose();

    expect(wrapper.instance().state.anchorEl).toBe(null);
  });
});
