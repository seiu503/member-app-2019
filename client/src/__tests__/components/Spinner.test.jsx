import React from "react";
import '@testing-library/jest-dom';
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import Spinner from "../../components/Spinner";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";

const theme = createTheme(adaptV4Theme);

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
