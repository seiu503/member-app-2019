import React from "react";
import { shallow, mount } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import {
  unwrap,
  createShallow,
  createMount
} from "@material-ui/core/test-utils";
// import AlertDialog, { StyledAlertDialog } from "../../components/AlertDialog";
import AlertDialog from "../../components/AlertDialog";
import AlertDialogUnwrapped from "../../components/AlertDialog";
import { styles } from "../../components/AlertDialog";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";

const AlertDialogNaked = unwrap(AlertDialog);
const AlertDialogUnwrappedNaked = unwrap(AlertDialogUnwrapped);

const defaultProps = {
  open: true,
  title: "Dialog title",
  content: "Dialog content",
  buttonText: "Do the action",
  handleClose: jest.fn(),
  action: jest.fn(),
  classes: {
    danger: "danger",
    primary: "primary"
  }
};

const options = {
  untilSelector: "Button"
};
const muiShallow = createShallow(options);
const muiMount = createMount();

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

  it("renders imported MUI theme without error", () => {
    const theme = {
      palette: {
        danger: {
          main: "#b71c1c"
        },
        primary: {
          main: "#b71c1c"
        }
      }
    };
    const stylesTest = styles(theme);
    console.log(stylesTest);
    // the one below doesn't work with either AlertDialog, AlertDialogNaked, or AlertDialogUnwrapped -- test fails (TypeError: Cannot read property 'main' of undefined), or for AlertDialogUnwrappedNaked: TypeError: Cannot read property 'values' of undefined
    // const wrapper = muiMount(
    //   <MuiThemeProvider
    //     theme={{
    //       palette: {
    //         danger: {
    //           main: '#b71c1c'
    //         }
    //       }
    //     }}
    //   >
    //     <AlertDialogUnwrappedNaked {...defaultProps} />
    //   </MuiThemeProvider>
    // );
    // const wrapper = mount(<StyledAlertDialog {...defaultProps} />);
    const testStyles = {};
    // const StyledAlertDialogWithStyles = StyledAlertDialog(testStyles);

    // below version makes test pass but fails to cover style/theme code block
    // const wrapper = mount(<AlertDialogNaked {...defaultProps} />).find('[data-test="component-alert-dialog"]');

    // below: TypeError: Cannot read property 'main' of undefined
    // const wrapper = muiShallow(<AlertDialog {...defaultProps} />);

    // below 4 versions pass test but don't cover theme func
    // const wrapper = muiShallow(<AlertDialogNaked {...defaultProps} />);
    // const wrapper = muiShallow(<AlertDialogUnwrappedNaked {...defaultProps} />);
    // const wrapper = muiMount(<AlertDialogUnwrappedNaked {...defaultProps} />);
    // const wrapper = muiMount(<AlertDialogNaked {...defaultProps} />);

    // below throws TypeError: Cannot read property 'main' of undefined
    // const wrapper = muiMount(<AlertDialog {...defaultProps} />);

    // below passes test  but doesn't cover theme function
    const wrapper = createMount(
      <MuiThemeProvider
        theme={{
          palette: {
            danger: {
              main: "#b71c1c"
            }
          }
        }}
      >
        <AlertDialog {...defaultProps} />
      </MuiThemeProvider>
    );

    // below line passes tests but doesn't cover theme function
    // const wrapper = muiShallow(<AlertDialogNaked {...defaultProps} />);
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

  test("action button has `danger` class if passed `danger` prop", () => {
    const wrapper = setup({ buttonText: "Do the action", danger: true });
    const component = findByTestAttr(wrapper, "button-action");
    expect(component.props().className).toBe("danger");
  });

  test("action button does not have `danger` class if not passed `danger` prop", () => {
    const wrapper = setup({ buttonText: "Do the action", danger: false });
    const component = findByTestAttr(wrapper, "button-action");
    expect(component.props().className).toBe("primary");
  });

  // test("styles imported correctly from MUI theme", () => {
  //   const wrapper = shallow(<AlertDialog />);
  //   const component = findByTestAttr(wrapper, "component-alert-dialog");
  //   expect(component.length).toBe(1);
  // });

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

    // restore mock
    actionMock.mockRestore();
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

    // restore mock
    handleCloseMock.mockRestore();
  });
});
