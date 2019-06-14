// https://menubar.io/creating-a-material-ui-button-with-spinner-that-reflects-loading-state

import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { withStyles } from "@material-ui/core/styles";

export const withStylesProps = styles => Component => props => {
  const Comp = withStyles(styles(props))(Component);
  return <Comp {...props} />;
};

export const styles = props => theme => {
  let color =
    props.variant && props.variant === "raised"
      ? theme.palette[props.color].main
      : "#ffffff";
  let contrastColor = theme.palette.getContrastText(color);
  return {
    spinner: {
      color: contrastColor,
      marginLeft: "10px"
    }
  };
};

export const SpinnerAdornmentBase = props => (
  <CircularProgress
    className={props.classes.spinner}
    size={20}
    data-test="component-spinner-adornment"
  />
);

const SpinnerAdornment = withStylesProps(styles)(props => SpinnerAdornmentBase);
export default SpinnerAdornment;
