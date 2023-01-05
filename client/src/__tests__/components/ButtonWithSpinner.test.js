import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import ButtonWithSpinner from "../../components/ButtonWithSpinner";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/styles";

const theme = createTheme(adaptV4Theme);

const defaultProps = {
  loading: false,
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
      <ButtonWithSpinner {...setupProps} />
    </ThemeProvider>
  );
};

describe("<ButtonWithSpinner />", () => {
  it("renders without error", () => {
    const { getByTestId } = setup();
    const component = getByTestId("component-button-with-spinner");
    expect(component).toBeInTheDocument();
  });

  it("renders a spinner if `loading` prop = true", () => {
    const { queryByRole } = setup({ loading: true });
    const component = queryByRole("progressbar");
    expect(component).toBeInTheDocument();
  });

  it("does not render a spinner if `loading` prop = false", () => {
    const { queryByRole } = setup({ loading: false });
    const component = queryByRole("progressbar");
    expect(component).not.toBeInTheDocument();
  });
});
