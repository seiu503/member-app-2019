import React from "react";
import { Button } from "@mui/material";
import SpinnerAdornment from "./SpinnerAdornment";

const ButtonWithSpinner = props => {
  const {
    children,
    loading,
    disabled,
    "data-testid": dataTestId = "component-button-with-spinner",
    ...rest
  } = props;

  return (
    <Button
      {...rest}
      data-testid={dataTestId}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {children}

      {loading && (
        <SpinnerAdornment data-testid="spinner-adornment" />
      )}
    </Button>
  );
};

ButtonWithSpinner.defaultProps = {
  loading: false,
  disabled: false
};

export default ButtonWithSpinner;