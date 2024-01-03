import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import NotFound from "../../components/NotFound";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";
import i18n from "../../translations/i18n";

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
      <I18nextProvider i18n={i18n} defaultNS={"translation"}>
        <NotFound {...setupProps} />
      </I18nextProvider>
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
