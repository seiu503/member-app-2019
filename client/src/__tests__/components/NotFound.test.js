import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import NotFound from "../../components/NotFound";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/styles";

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
      <NotFound {...setupProps} />
    </ThemeProvider>
  );
};

describe("<NotFound />", () => {
  it("renders without error", () => {
    const { getByTestId } = setup({ classes: {} });
    const component = getByTestId("component-not-found");
    expect(component).toBeInTheDocument();
  });
});
