import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

const wrap = {
  display: "flex",
  justifyContent: "center",
  position: "fixed",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 3,
  backgroundColor: "rgba(0,0,0,.4)"
};

const spin = {
  position: "relative",
  top: "44%"
};

const Spinner = props => (
  <div style={wrap}>
    <CircularProgress
      style={spin}
      color="primary"
      size={50}
      data-test="component-spinner"
    />
  </div>
);

export default Spinner;
