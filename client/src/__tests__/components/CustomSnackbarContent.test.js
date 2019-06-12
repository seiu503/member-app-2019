import React from "react";
import { shallow, mount } from "enzyme";
import { unwrap, createShallow } from "@material-ui/core/test-utils";
import { findByTestAttr } from "../../utils/testUtils";
import CustomSnackbarContent from "../../components/CustomSnackbarContent";

const CustomSnackbarContentNaked = unwrap(CustomSnackbarContent);
const defaultProps = {
  classes: {
    success: "success",
    error: "error",
    info: "info",
    warning: "warning"
  },
  className: "",
  message: "Info",
  onClose: jest.fn(),
  variant: "info"
};
const options = {
  untilSelector: "Typography"
};
const muiShallow = createShallow(options);

/**
 * Factory function to create a ShallowWrapper for CustomSnackbarContent component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  return shallow(<CustomSnackbarContentNaked {...setupProps} />);
};

describe("<CustomSnackbarContent />", () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it("renders without error", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "component-custom-snackbar");
    expect(component.length).toBe(1);
  });

  test("renders a message", () => {
    const wrapper = mount(<CustomSnackbarContentNaked {...defaultProps} />);
    const component = findByTestAttr(wrapper, "message");
    expect(component.length).toBe(1);
    expect(component.text()).toBe("Info");
  });

  test("renders a button", () => {
    const wrapper = mount(<CustomSnackbarContentNaked {...defaultProps} />);
    const component = wrapper.find("button");
    expect(component.length).toBe(1);
  });

  test("renders a close icon", () => {
    const wrapper = mount(<CustomSnackbarContentNaked {...defaultProps} />);
    const component = wrapper.find("CloseIcon");
    expect(component.length).toBe(1);
  });

  describe("`variant` = 'success'", () => {
    const wrapper = mount(
      <CustomSnackbarContentNaked {...defaultProps} variant="success" />
    );
    test("renders a CheckCircleIcon", () => {
      const component = findByTestAttr(wrapper, "message-icon");
      const icon = component.find("CheckCircleIcon");
      expect(icon.length).toBe(1);
    });
    test("has 'success' class", () => {
      const wrapper = muiShallow(
        <CustomSnackbarContentNaked {...defaultProps} variant="success" />
      );
      const component = wrapper.find(".success");
      expect(component.length).toBe(1);
    });
  });

  describe("`variant` = 'error'", () => {
    test("renders an ErrorIcon", () => {
      const wrapper = mount(
        <CustomSnackbarContentNaked {...defaultProps} variant="error" />
      );
      const component = findByTestAttr(wrapper, "message-icon");
      const icon = component.find("ErrorIcon");
      expect(icon.length).toBe(1);
    });
    test("has 'error' class", () => {
      const wrapper = muiShallow(
        <CustomSnackbarContentNaked {...defaultProps} variant="error" />
      );
      const component = wrapper.find(".error");
      expect(component.length).toBe(1);
    });
  });

  describe("`variant` = 'warning'", () => {
    test("renders a WarningIcon", () => {
      const wrapper = mount(
        <CustomSnackbarContentNaked {...defaultProps} variant="warning" />
      );
      const component = findByTestAttr(wrapper, "message-icon");
      const icon = component.find("WarningIcon");
      expect(icon.length).toBe(1);
    });
    test("has 'warning' class", () => {
      const wrapper = muiShallow(
        <CustomSnackbarContentNaked {...defaultProps} variant="warning" />
      );
      const component = wrapper.find(".warning");
      expect(component.length).toBe(1);
    });
  });

  describe("`variant` = 'info'", () => {
    test("renders an InfoIcon", () => {
      const wrapper = mount(
        <CustomSnackbarContentNaked {...defaultProps} variant="info" />
      );
      const component = findByTestAttr(wrapper, "message-icon");
      const icon = component.find("InfoIcon");
      expect(icon.length).toBe(1);
    });
    test("has 'info' class", () => {
      const wrapper = muiShallow(
        <CustomSnackbarContentNaked {...defaultProps} variant="info" />
      );
      const component = wrapper.find(".info");
      expect(component.length).toBe(1);
    });
  });

  test("calls `onClose` prop on close button click", () => {
    // create a mock function so we can see whether it's called on click
    const onCloseMock = jest.fn();
    const props = { variant: "success", onClose: onCloseMock, classes: {} };

    // set up unwrapped component with onCloseMock as onClose prop
    const wrapper = mount(<CustomSnackbarContentNaked {...props} />);

    // simulate click
    const closeButton = wrapper.find("button").find('[aria-label="Close"]');
    closeButton.simulate("click");

    // expect the mock to have been called once
    expect(onCloseMock.mock.calls.length).toBe(1);

    // restore mock
    onCloseMock.mockRestore();
  });
});

// no test for rendering action button if passed an action prop
// or for calling action function if action button clicked
// not currently using that functionality in this implementation so haven't written tests for it.
// if we decide to use it we'll need to write tests here.
