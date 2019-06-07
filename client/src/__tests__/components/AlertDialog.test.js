import React from "react";
import { shallow, mount } from "enzyme";
import { unwrap } from "@material-ui/core/test-utils";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import AlertDialog from "../../components/AlertDialog";
import theme from "../../styles/theme";

const AlertDialogNaked = unwrap(AlertDialog);

describe("<AlertDialog />", () => {
  it("renders with shallow", () => {
    shallow(<AlertDialogNaked classes={{}} open={false} />);
  });

  it("renders with mount", () => {
    mount(
      <MuiThemeProvider theme={theme}>
        <AlertDialog open={false} />
      </MuiThemeProvider>
    );
  });
});

// this needs more tests
