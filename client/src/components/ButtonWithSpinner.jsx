// https://menubar.io/creating-a-material-ui-button-with-spinner-that-reflects-loading-state

import React from "react";
import { Button } from "@mui/material";
import SpinnerAdornment from "./SpinnerAdornment";

const ButtonWithSpinner = (props) => {
  const { children, loading, ...rest } = props;
  return (
    <Button {...rest} data-testid="component-button-with-spinner">
      {children}
      {loading && (
        <SpinnerAdornment {...rest} data-testid="spinner-adornment" />
      )}
    </Button>
  );
};

// ButtonWithSpinner.defaultProps = {
//   loading: false
// };

export default ButtonWithSpinner;
