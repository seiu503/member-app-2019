import React from "react";
import '@testing-library/jest-dom';
import { fireEvent, render } from "@testing-library/react";
import SpinnerAdornment, {
  SpinnerAdornmentBase
} from "../../components/SpinnerAdornment";

import { CircularProgress } from "@mui/icons-material";

const { getByTestId } = render(<SpinnerAdornment classes={{}} />);

const spinnerAdornment = getByTestId("component-spinner-adornment");

describe("<SpinnerAdornment />", () => {
  it("renders without error", () => {
    const spinnerAdornment = getByTestId("component-spinner-adornment");
    expect(spinnerAdornment).toHaveClass("MuiCircularProgress-root");
  });
});
