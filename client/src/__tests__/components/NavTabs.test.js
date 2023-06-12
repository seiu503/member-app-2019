import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import NavTabs from "../../components/NavTabs";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";

const theme = createTheme(adaptV4Theme);

const defaultProps = {
  classes: { test: "test" },
  handleTab: jest.fn(),
  tab: 1,
  howManyTabs: 4
};

describe("<NavTabs />", () => {
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
        <NavTabs {...setupProps} />
      </ThemeProvider>
    );
  };

  it("renders without error", () => {
    const { getByTestId } = setup({ classes: {} });
    const component = getByTestId("component-navtabs");
    expect(component).toBeInTheDocument();
  });
});
