import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

const wrap = {
  width: "100vw",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "absolute",
  top: 0,
  zIndex: 3
};

const spin = {
  position: "relative",
  left: "-27px"
};

const Spinner = props => (
  <div style={wrap}>
    <CircularProgress style={spin} color="primary" size={50} />
  </div>
);

export default Spinner;
