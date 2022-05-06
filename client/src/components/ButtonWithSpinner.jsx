// https://menubar.io/creating-a-material-ui-button-with-spinner-that-reflects-loading-state

import React from "react";
import { Button } from "@mui/material";
import SpinnerAdornment from "./SpinnerAdornment";

type Props = {
  children: React.ChildrenArray<any>,
  loading: boolean
};

const ButtonWithSpinner = (props: Props) => {
  const { children, loading, ...rest } = props;
  return (
    <Button {...rest} data-test="component-button-with-spinner">
      {children}
      {loading && <SpinnerAdornment {...rest} data-test="spinner-adornment" />}
    </Button>
  );
};

ButtonWithSpinner.defaultProps = {
  loading: false
};

export default ButtonWithSpinner;
