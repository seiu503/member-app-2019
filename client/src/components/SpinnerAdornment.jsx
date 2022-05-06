// https://menubar.io/creating-a-material-ui-button-with-spinner-that-reflects-loading-state

import { CircularProgress } from "@mui/material";

const spinnerStyle = {
  color: "#ffffff",
  marginLeft: "10px"
};

const SpinnerAdornment = props => (
  <CircularProgress
    style={spinnerStyle}
    size={20}
    data-test="component-spinner-adornment"
  />
);

export default SpinnerAdornment;
