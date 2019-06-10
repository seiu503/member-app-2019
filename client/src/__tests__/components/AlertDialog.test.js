import React from "react";
import { shallow } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import { unwrap } from "@material-ui/core/test-utils";
import AlertDialog from "../../components/AlertDialog";

const AlertDialogNaked = unwrap(AlertDialog);

const defaultProps = {
  open: true,
  title: "Dialog title",
  content: "Dialog content",
  buttonText: "Do the action",
  handleClose: jest.fn(),
  action: jest.fn(),
  classes: {}
};

/**
 * Factory function to create a ShallowWrapper for the AlertDialog component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  return shallow(<AlertDialogNaked {...setupProps} />);
};

describe("<AlertDialog />", () => {
  it("renders without error", () => {
    const wrapper = setup({ open: true });
    const component = findByTestAttr(wrapper, "component-alert-dialog");
    expect(component.length).toBe(1);
  });

  test("renders a dialog", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "dialog");
    expect(component.length).toBe(1);
  });

  test("renders a title if passed a title prop", () => {
    const wrapper = setup({ title: "Dialog title" });
    const component = findByTestAttr(wrapper, "dialog-title");
    expect(component.length).toBe(1);
    expect(component.text()).toBe("Dialog title");
  });

  test("does not render a title if no title prop", () => {
    const wrapper = setup({ title: undefined });
    const component = findByTestAttr(wrapper, "dialog-title");
    expect(component.exists()).toEqual(false);
  });

  test("renders dialog content text", () => {
    const wrapper = setup({ content: "Dialog content" });
    const component = findByTestAttr(wrapper, "dialog-content");
    expect(component.length).toBe(1);
    expect(component.text()).toBe("Dialog content");
  });

  test("renders cancel button", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "button-cancel");
    expect(component.length).toBe(1);
  });

  test("renders action button", () => {
    const wrapper = setup({ buttonText: "Do the action" });
    const component = findByTestAttr(wrapper, "button-action");
    expect(component.length).toBe(1);
    expect(component.text()).toBe("Do the action");
  });

  test("calls `action` prop on action button click", () => {
    // create a mock function so we can see whether it's called on click
    const actionMock = jest.fn();
    const props = { open: true, action: actionMock, classes: {} };

    // set up unwrapped component with actionMock as action prop
    const wrapper = shallow(<AlertDialogNaked {...props} />);

    // simulate click
    const actionButton = findByTestAttr(wrapper, "button-action");
    actionButton.simulate("click");

    // expect the mock to have been called once
    expect(actionMock.mock.calls.length).toBe(1);
  });

  test("calls `handleClose` prop on cancel button click", () => {
    // create a mock function so we can see whether it's called on click
    const handleCloseMock = jest.fn();
    const props = { open: true, handleClose: handleCloseMock, classes: {} };

    // set up unwrapped component with actionMock as action prop
    const wrapper = shallow(<AlertDialogNaked {...props} />);

    // simulate click
    const cancelButton = findByTestAttr(wrapper, "button-cancel");
    cancelButton.simulate("click");

    // expect the mock to have been called once
    expect(handleCloseMock.mock.calls.length).toBe(1);
  });
});
