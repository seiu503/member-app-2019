import React from "react";
import { shallow, mount } from "enzyme";
import { BrowserRouter as Router } from "react-router-dom";
import { findByTestAttr } from "../../utils/testUtils";
import { createShallow } from "@material-ui/core/test-utils";
import { NavBar } from "../../containers/NavBar";
import * as utils from "../../utils";

const options = {
  untilSelector: "ListItemText"
};
const muiShallow = createShallow(options);

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
    loggedIn: false
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

/**
 * Factory function to create a ShallowWrapper for the NavBar component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  return shallow(<NavBar {...setupProps} />);
};

describe("<NavBar />", () => {
  it("renders without error", () => {
    const wrapper = setup();
    // console.log(wrapper.debug());
    const component = findByTestAttr(wrapper, "component-navbar");
    expect(component.length).toBe(1);
  });

  test("renders a skiplink", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "skiplink");
    expect(component.length).toBe(1);
    expect(component.text()).toBe("Skip to content ›");
  });

  test("renders a logo link and logo image", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "logo-link");
    expect(component.length).toBe(1);
    const image = component.find("img");
    expect(image.length).toBe(1);
  });

  test("renders a title", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "title");
    expect(component.length).toBe(1);
  });

  test("renders a menu button", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "menu-button");
    expect(component.length).toBe(1);
  });

  test("renders a menu", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "menu");
    expect(component.length).toBe(1);
  });

  test("renders menu links", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "menu-links");
    expect(component.length).toBe(1);
  });

  test("renders mobile menu items", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "mobile-link");
    expect(component.length).toBeGreaterThan(0);
  });

  test("renders standard menu items", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "standard-menu-link");
    expect(component.length).toBeGreaterThan(0);
  });

  test("if `loggedId` = true, renders admin menu links", () => {
    const wrapper = setup({ appState: { loggedIn: true } });
    const component = findByTestAttr(wrapper, "admin-menu-links");
    expect(component.length).toBe(1);
  });

  test("if `loggedId` = false, does not render admin menu links", () => {
    const wrapper = setup({ appState: { loggedIn: false } });
    const component = findByTestAttr(wrapper, "admin-menu-links");
    expect(component.length).toBe(0);
  });

  test("clicking skiplink calls `skip` function", () => {
    // create a mock function so we can see whether it's called on click
    utils.skip = jest.fn();
    const wrapper = setup();

    // simulate click
    const skipLink = findByTestAttr(wrapper, "skiplink");
    skipLink.simulate("click");

    // expect the mock to have been called once
    expect(utils.skip.mock.calls.length).toBe(1);

    // restore mock
    utils.skip.mockRestore();
  });

  test("clicking mobile menu item calls `handleClose` function", () => {
    const wrapper = setup();
    const menuItem = findByTestAttr(wrapper, "mobile-link").dive();

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
    const menuItem = findByTestAttr(wrapper, "mobile-link").dive();
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

  test("clicking standard menu item redirects to correct link", () => {
    const wrapper = setup();
    const menuItem = findByTestAttr(wrapper, "standard-menu-link").dive();

    // link isn't passed as a prop to this element but
    // the same link variable is used to set the button text
    // so we can extract the text from the button to test whether it
    // redirects to the right route
    const link = menuItem.text();

    // mock `history.push()`
    const pushMock = jest.fn();
    wrapper.setProps({ history: { push: pushMock } });

    // simulate click
    menuItem.simulate("click");

    // expect the `history.push` mock to have been called with correct link
    expect(pushMock.mock.calls.length).toBe(1);
    expect(pushMock.mock.calls[0]).toEqual([`/${link}`]);

    // restore mock
    pushMock.mockRestore();
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

// handle in integration tests: handleClick blurs main content area
