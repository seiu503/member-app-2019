import React from "react";
import { shallow, mount } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import Notifier from "../../containers/Notifier";

describe("<Notifier />", () => {
  it("renders without error", () => {
    const wrapper = shallow(<Notifier />);
    const component = findByTestAttr(wrapper, "component-notifier");
    expect(component.length).toBe(1);
  });

  test("renders custom snackbar content component", () => {
    const wrapper = shallow(<Notifier />);
    const component = findByTestAttr(
      wrapper,
      "custom-snackbar-content-wrapper"
    );
    expect(component.length).toBe(1);
  });

  test("renders a message span with correct message if `open` = true", () => {
    const wrapper = mount(<Notifier />);
    wrapper.setState({ open: true, message: "Everything OK!" }, () => {
      const component = findByTestAttr(wrapper, "message-span");
      expect(component.length).toBe(1);
      expect(component.text()).toBe("Everything OK!");
    });
  });

  test("does not render a message span if `open` = false", () => {
    const wrapper = mount(<Notifier />);
    wrapper.setState({ open: false }, () => {
      const component = findByTestAttr(wrapper, "message-span");
      expect(component.length).toBe(0);
    });
  });

  test("`openSnackbar` sets correct state for open, variant, and message", () => {
    const wrapper = mount(<Notifier />);
    // call method
    wrapper.instance().openSnackbar("success", "Everything OK!");
    expect(wrapper.state("open")).toBe(true);
    expect(wrapper.state("variant")).toBe("success");
    expect(wrapper.state("message")).toBe("Everything OK!");
  });

  test("`handleSnackbarClose` sets correct state for open, variant, and message", () => {
    const wrapper = mount(<Notifier />);
    // call method
    wrapper.instance().handleSnackbarClose();
    expect(wrapper.state("open")).toBe(false);
    expect(wrapper.state("variant")).toBe("info");
    expect(wrapper.state("message")).toBe("");
  });
});

// tests for exported openSnackbar function should go in integration tests
