import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import Footer from "../../components/Footer";
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
      <Footer {...setupProps} />
    </ThemeProvider>
  );
};

describe("<Footer />", () => {
  it("renders without error", () => {
    const { getByTestId } = setup({ open: true });
    const component = getByTestId("component-footer");
    expect(component).toBeInTheDocument();
  });
});
