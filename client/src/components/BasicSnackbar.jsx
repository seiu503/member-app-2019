import React, { useState, forwardRef } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const BasicSnackbar = ({ open, onClose, variant, message }) => {
  const msg = (
    <span
      id="snackbar-message-id"
      dangerouslySetInnerHTML={{ __html: message }}
      data-testid="message-span"
    />
  );

  return (
    <>
      <Snackbar
        open={open}
        data-testid="component-basic-snackbar"
        autoHideDuration={6000}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
      >
        <Alert onClose={onClose} severity={variant} sx={{ width: "100%" }}>
          {msg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BasicSnackbar;
