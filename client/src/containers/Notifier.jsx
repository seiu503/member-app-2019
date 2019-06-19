import React from "react";

import CustomSnackbarContentWrapper from "../components/CustomSnackbarContent";

import Snackbar from "@material-ui/core/Snackbar";

let openSnackbarFn;

class Notifier extends React.Component {
  state = {
    open: false,
    message: "",
    variant: "info",
    action: null
  };

  componentDidMount() {
    openSnackbarFn = this.openSnackbar;
  }

  openSnackbar = (variant, message, action) => {
    this.setState({
      open: true,
      variant,
      message,
      action
    });
  };

  handleSnackbarClose = () => {
    this.setState({
      open: false,
      message: "",
      variant: "info",
      action: null
    });
  };

  render() {
    const message = (
      <span
        id="snackbar-message-id"
        dangerouslySetInnerHTML={{ __html: this.state.message }}
        data-test="message-span"
      />
    );

    return (
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
        open={this.state.open}
        autoHideDuration={6000}
        onClose={this.handleSnackbarClose}
        data-test="component-notifier"
      >
        <CustomSnackbarContentWrapper
          variant={this.state.variant}
          message={message}
          open={this.state.open}
          action={this.state.action}
          onClose={this.handleSnackbarClose}
          data-test="custom-snackbar-content-wrapper"
        />
      </Snackbar>
    );
  }
}

// this function should really just be one line
// it should call openSnackbarFn with the first 2 arguments
// (variant, message)
// however! some kind of race condition is happening between importing the
// openSnackbar function into the target component and mounting the Notifier
// so it's throwing an error if the function is not defined when the
// Notifier mounts
// setting a timeout of 50ms is an extremely dirty workaround but it works...
export const openSnackbar = (
  variant,
  message,
  testSetTimeout,
  testBranchOne
) => {
  // aaaaaand because it's dirty it is impossible to test lol
  // so here let's add yet another unnecessary logical branch just for testing!
  if (
    (typeof openSnackbarFn === "function" && process.env.NODE_ENV !== "test") ||
    testBranchOne
  ) {
    openSnackbarFn(variant, message);
  } else if (
    typeof openSnackbarFn === "function" &&
    process.env.NODE_ENV === "test" &&
    !testSetTimeout
  ) {
    // so! dirty!! somebody fix this mess!
    openSnackbarFn(variant, message);
  } else {
    // console.log("openSnackbarFn is undefined");
    setTimeout(() => openSnackbarFn(variant, message), 50);
  }
};

export default Notifier;
