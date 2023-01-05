import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import Login from "../../components/Login";
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
      <Login {...setupProps} />
    </ThemeProvider>
  );
};

const oldWindowLocation = window.location;

describe("<Login />", () => {
  beforeAll(() => {
    delete window.location;

    window.location = Object.defineProperties(
      {},
      {
        ...Object.getOwnPropertyDescriptors(oldWindowLocation),
        assign: {
          configurable: true,
          value: jest.fn()
        }
      }
    );
  });
  afterAll(() => {
    window.location = oldWindowLocation;
  });
  beforeEach(() => {
    window.location.assign.mockReset();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("renders without error", () => {
    const { getByTestId } = setup();
    const component = getByTestId("component-login");
    expect(component).toBeInTheDocument();
  });
  it("assigns location on componentDidMount", () => {
    const { getByTestId } = setup();
    const component = getByTestId("component-login");
    expect(window.location.assign).toHaveBeenCalled();
  });
});
