import React from "react";
import { shallow, mount } from "enzyme";
import { unwrap } from "@material-ui/core/test-utils";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import AlertDialog from "../../components/AlertDialog";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import theme from "../../styles/theme";

const AlertDialogNaked = unwrap(AlertDialog);

const props = {
  open: true,
  title: "Dialog title",
  content: "Dialog content",
  buttonText: "Do the action",
  handleClose: jest.fn(),
  action: jest.fn(),
  classes: {}
};

describe("<AlertDialog />", () => {
  it("renders without crashing", () => {
    shallow(<AlertDialogNaked {...props} />);
  });

  it("renders a title if passed a title prop", () => {
    const titleEl = shallow(<AlertDialogNaked {...props} />).find(
      "#alert-dialog-title"
    );
    expect(titleEl.exists()).toEqual(true);
    expect(titleEl.text()).toEqual(props.title);
  });

  it("doesn't render a title if no title prop", () => {
    props.title = undefined;
    const titleEl = shallow(<AlertDialogNaked {...props} />).find(
      "#alert-dialog-title"
    );
    expect(titleEl.exists()).toEqual(false);
  });
});

// this needs more tests
