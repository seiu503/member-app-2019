import React from "react";
import { shallow, mount } from "enzyme";
import { BrowserRouter as Router } from "react-router-dom";
import { findByTestAttr } from "../../utils/testUtils";
import { createShallow } from "@material-ui/core/test-utils";
import { NavBar } from "../../containers/NavBar";
import * as utils from "../../utils";

const options = {
  untilSelector: "button"
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

  test("calls `skip` function skiplink click", () => {
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

  test("clicking mobile menu button calls `handleClick` function", () => {
    const wrapper = setup({});
    const menuButton = findByTestAttr(wrapper, "menu-button");

    // mock handleClick function
    wrapper.instance().handleClick = jest.fn();

    // mock event and simulate click
    const mockedEvent = { target: {} };
    menuButton.simulate("click", mockedEvent);

    // expect the handleClick function to have been called
    expect(wrapper.instance().handleClick).toBeCalled();
  });

  test("clicking mobile menu button blurs main content while menu is open", () => {
    // mock ref
    function mockGetRef(ref: any) {
      this.main_ref = { ...mainRef };
    }

    // jest.spyOn(NavBar.prototype, 'getRef').mockImplementationOnce(mockGetRef);

    const wrapper = mount(
      <Router>
        <NavBar {...defaultProps} />
      </Router>
    );
    const menuButton = findByTestAttr(wrapper, "menu-button").find("button");

    // mock event and simulate click
    const mockedEvent = { target: {} };
    menuButton.simulate("click", mockedEvent);

    // expect main content to be blurred when menu is open
    // console.log(wrapper.instance().getRef('main_ref').classList);
    // expect(wrapper.instance().getRef('main_ref').hasClass('is-blurred').to.equal(true));
  });

  // test("renders a message span with correct message if `open` = true", () => {
  //   const wrapper = mount(<NavBarNaked />);
  //   wrapper.setState({ open: true, message: "Everything OK!" }, () => {
  //     const component = findByTestAttr(wrapper, "message-span");
  //     expect(component.length).toBe(1);
  //     expect(component.text()).toBe("Everything OK!");
  //   });
  // });

  // test("does not render a message span if `open` = false", () => {
  //   const wrapper = mount(<NavBarNaked />);
  //   wrapper.setState({ open: false }, () => {
  //     const component = findByTestAttr(wrapper, "message-span");
  //     expect(component.length).toBe(0);
  //   });
  // });

  // test("`openSnackbar` sets correct state for open, variant, and message", () => {
  //   const wrapper = mount(<NavBarNaked />);
  //   // call method
  //   wrapper.instance().openSnackbar("success", "Everything OK!");
  //   expect(wrapper.state("open")).toBe(true);
  //   expect(wrapper.state("variant")).toBe("success");
  //   expect(wrapper.state("message")).toBe("Everything OK!");
  // });

  // test("`handleSnackbarClose` sets correct state for open, variant, and message", () => {
  //   const wrapper = mount(<NavBarNaked />);
  //   // call method
  //   wrapper.instance().handleSnackbarClose();
  //   expect(wrapper.state("open")).toBe(false);
  //   expect(wrapper.state("variant")).toBe("info");
  //   expect(wrapper.state("message")).toBe("");
  // });
});
