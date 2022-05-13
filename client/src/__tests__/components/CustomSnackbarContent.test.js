import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import CustomSnackbarContent from "../../components/CustomSnackbarContent";
import { green, amber } from "@mui/material/colors";
import { SnackbarContent, IconButton } from "@mui/material";
import {
  CheckCircleIcon,
  WarningIcon,
  ErrorIcon,
  InfoIcon,
  CloseIcon
} from "@mui/icons-material";

import { theme } from "../../styles/theme";
import { ThemeProvider } from "@mui/material/styles";

const defaultProps = {
  classes: {
    success: "success",
    error: "error",
    info: "info",
    warning: "warning"
  },
  className: "",
  message: "Info",
  onClose: jest.fn(),
  variant: "info"
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
      <CustomSnackbarContent {...setupProps} />
    </ThemeProvider>
  );
};

describe("<CustomSnackbarContent />", () => {
  afterEach(() => {
    jest.resetAllMocks();
    cleanup();
  });

  describe("Basic render tests", () => {
    it("renders without error", () => {
      const { getByTestId } = setup();
      const component = getByTestId("component-custom-snackbar");
      expect(component).toHaveClass("info");
    });

    test("renders a message", () => {
      const { getByTestId } = setup();
      expect(screen.getByTestId("message")).toHaveTextContent("Info");
    });

    test("renders a button", () => {
      const { getByTestId } = setup();
      const component = getByTestId("icon-button");
      expect(component).toHaveClass("MuiIconButton-root");
    });

    test("renders a close icon", () => {
      const { getByTestId } = setup();
      const component = getByTestId("close-icon");
      expect(component).toHaveClass("MuiSvgIcon-root");
    });
  });

  describe("`variant` = 'success'", () => {
    test("renders a CheckCircleIcon", () => {
      const { getByTestId } = render(
        <ThemeProvider theme={theme}>
          <CustomSnackbarContent {...defaultProps} variant="success" />
        </ThemeProvider>
      );
      const icon = getByTestId("CheckCircleIcon");
      expect(icon).toHaveClass("MuiSvgIcon-root");
    });
    test("has 'success' class", () => {
      const { getByTestId } = render(
        <ThemeProvider theme={theme}>
          <CustomSnackbarContent {...defaultProps} variant="success" />
        </ThemeProvider>
      );
      const component = getByTestId("component-custom-snackbar");
      expect(component).toHaveClass("success");
    });
  });

  describe("`variant` = 'error'", () => {
    test("renders an ErrorIcon", () => {
      const { getByTestId } = render(
        <ThemeProvider theme={theme}>
          <CustomSnackbarContent {...defaultProps} variant="error" />
        </ThemeProvider>
      );
      const icon = getByTestId("ErrorIcon");
      expect(icon).toHaveClass("MuiSvgIcon-root");
    });
    test("has 'error' class", () => {
      const { getByTestId } = render(
        <ThemeProvider theme={theme}>
          <CustomSnackbarContent {...defaultProps} variant="error" />
        </ThemeProvider>
      );
      const component = getByTestId("component-custom-snackbar");
      expect(component).toHaveClass("error");
    });
  });

  describe("`variant` = 'warning'", () => {
    test("renders a WarningIcon", () => {
      const { getByTestId } = render(
        <ThemeProvider theme={theme}>
          <CustomSnackbarContent {...defaultProps} variant="warning" />
        </ThemeProvider>
      );
      const icon = getByTestId("WarningIcon");
      expect(icon).toHaveClass("MuiSvgIcon-root");
    });
    test("has 'warning' class", () => {
      const { getByTestId } = render(
        <ThemeProvider theme={theme}>
          <CustomSnackbarContent {...defaultProps} variant="warning" />
        </ThemeProvider>
      );
      const component = getByTestId("component-custom-snackbar");
      expect(component).toHaveClass("warning");
    });
  });

  describe("`variant` = 'info'", () => {
    test("renders an InfoIcon", () => {
      const { getByTestId } = render(
        <ThemeProvider theme={theme}>
          <CustomSnackbarContent {...defaultProps} variant="info" />
        </ThemeProvider>
      );
      const icon = getByTestId("InfoIcon");
      expect(icon).toHaveClass("MuiSvgIcon-root");
    });
    test("has 'info' class", () => {
      const { getByTestId } = render(
        <ThemeProvider theme={theme}>
          <CustomSnackbarContent {...defaultProps} variant="info" />
        </ThemeProvider>
      );
      const component = getByTestId("component-custom-snackbar");
      expect(component).toHaveClass("info");
    });
  });

  test("calls `onClose` prop on close button click", () => {
    // create a mock function so we can see whether it's called on click
    const onCloseMock = jest.fn();
    const props = { variant: "success", onClose: onCloseMock, classes: {} };

    // set up component with onCloseMock as onClose prop
    const { getByLabelText } = render(
      <ThemeProvider theme={theme}>
        <CustomSnackbarContent {...props} />
      </ThemeProvider>
    );

    // simulate click
    const node = getByLabelText("Close");
    fireEvent.click(node);

    // expect the mock to have been called
    expect(onCloseMock).toHaveBeenCalled();

    // restore mock
    onCloseMock.mockRestore();
  });
});
