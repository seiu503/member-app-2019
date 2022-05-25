import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import Spinner from "../../components/Spinner";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/styles";

const theme = createTheme();

const defaultProps = {
  classes: {}
};

/**
 * Rewriting setup function using React testing library instead of Enzyme
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {render}
 */
const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  return render(
    <ThemeProvider theme={theme}>
      <Spinner {...setupProps} />
    </ThemeProvider>
  );
};

describe("<Spinner />", () => {
  it("renders a CircularProgress", () => {
    const { getByTestId } = setup();
    const component = getByTestId("component-spinner");
    expect(component).toBeInTheDocument();
  });
});
