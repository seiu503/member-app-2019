import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import AlertDialog from "../../components/AlertDialog";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/styles";

const theme = createTheme();

const defaultProps = {
  open: true,
  title: "Dialog title",
  content: "Dialog content",
  buttonText: "Do the action",
  handleClose: jest.fn(),
  action: jest.fn(),
  classes: {
    danger: "danger",
    primary: "primary"
  }
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
      <AlertDialog {...setupProps} />
    </ThemeProvider>
  );
};

describe("<AlertDialog />", () => {
  afterEach(() => {
    jest.resetAllMocks();
    cleanup();
  });

  it("renders without error", () => {
    const { getByTestId } = setup({ open: true });
    const component = getByTestId("component-alert-dialog");
    expect(screen.getByRole("dialog")).toHaveTextContent("Dialog title");
  });

  test("renders a dialog", () => {
    const { getByTestId } = setup({ open: true });
    const component = getByTestId("dialog");
    expect(component).toBeInTheDocument();
  });

  test("renders a title if passed a title prop", () => {
    const { getByTestId } = setup({ title: "Dialog title" });
    const component = getByTestId("dialog-title");
    expect(component).toBeInTheDocument();
    expect(component).toHaveTextContent("Dialog title");
  });

  test("does not render a title if no title prop", () => {
    const { getByTestId } = setup({ title: undefined });
    const component = screen.queryByText("dialog-title");
    expect(component).not.toBeInTheDocument();
  });

  test("renders dialog content text", () => {
    const { getByTestId } = setup({ content: "Dialog content" });
    const component = getByTestId("dialog-content");
    expect(component).toBeInTheDocument();
    expect(component).toHaveTextContent("Dialog content");
  });

  test("renders cancel button", () => {
    const { getByTestId } = setup({ open: true });
    const component = getByTestId("button-cancel");
    expect(component).toBeInTheDocument();
  });

  test("renders action button", () => {
    const { getByTestId } = setup({ buttonText: "Do the action" });
    const component = getByTestId("button-action");
    expect(component).toBeInTheDocument();
    expect(component).toHaveTextContent("Do the action");
  });

  test("action button has `danger` class if passed `danger` prop", () => {
    const { getByTestId } = setup({
      buttonText: "Do the action",
      danger: true
    });
    const component = getByTestId("button-action");
    expect(component).toHaveClass("danger");
  });

  test("action button does not have `danger` class if not passed `danger` prop", () => {
    const { getByTestId } = setup({
      buttonText: "Do the action",
      danger: false
    });
    const component = getByTestId("button-action");
    expect(component).not.toHaveClass("danger");
  });

  test("calls `action` prop on action button click", () => {
    // create a mock function so we can see whether it's called on click
    const actionMock = jest.fn();
    const props = { open: true, action: actionMock, classes: {} };

    // set up unwrapped component with actionMock as action prop
    const { getByTestId } = setup({ ...props });

    // simulate click
    const actionButton = getByTestId("button-action");
    fireEvent.click(actionButton);

    // expect the mock to have been called once
    expect(actionMock).toHaveBeenCalled();

    // restore mock
    actionMock.mockRestore();
  });

  test("calls `handleClose` prop on cancel button click", () => {
    // create a mock function so we can see whether it's called on click
    const handleCloseMock = jest.fn();
    const props = { open: true, handleClose: handleCloseMock, classes: {} };

    // set up unwrapped component with actionMock as action prop
    const { getByTestId } = setup({ ...props });

    // simulate click
    const cancelButton = getByTestId("button-cancel");
    fireEvent.click(cancelButton);

    // expect the mock to have been called once
    expect(handleCloseMock).toHaveBeenCalled();

    // restore mock
    handleCloseMock.mockRestore();
  });
});
