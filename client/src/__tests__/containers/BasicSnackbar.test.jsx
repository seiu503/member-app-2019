import React from "react";
import '@testing-library/jest-dom';
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import BasicSnackbar from "../../components/BasicSnackbar";
const theme = createTheme(adaptV4Theme);

// // mock setTimeout
// jest.useFakeTimers();

const setup = (props = {}) => {
  return render(
    <ThemeProvider theme={theme}>
      <BasicSnackbar {...props} />
    </ThemeProvider>
  );
};

describe("<BasicSnackbar />", () => {
  it("renders without error", () => {
    const { getByTestId } = setup({ open: true, handleClose: jest.fn() });
    const component = getByTestId("component-basic-snackbar");
    expect(component).toBeInTheDocument();
  });
});

// test("renders custom snackbar content component", () => {
//   const wrapper = shallow(<Notifier />);
//   const component = findByTestAttr(
//     wrapper,
//     "custom-snackbar-content-wrapper"
//   );
//   expect(component.length).toBe(1);
// });

// test("renders a message span with correct message if `open` = true", () => {
//   const wrapper = mount(<Notifier />);
//   wrapper.setState({ open: true, message: "Everything OK!" }, () => {
//     const component = findByTestAttr(wrapper, "message-span");
//     expect(component.length).toBe(1);
//     expect(component.text()).toBe("Everything OK!");
//   });
// });

// test("does not render a message span if `open` = false", () => {
//   const wrapper = mount(<Notifier />);
//   wrapper.setState({ open: false }, () => {
//     const component = findByTestAttr(wrapper, "message-span");
//     expect(component.length).toBe(0);
//   });
// });

// test("`openSnackbar` sets correct state for open, variant, and message", () => {
//   const wrapper = mount(<Notifier />);
//   // call method
//   wrapper.instance().openSnackbar("success", "Everything OK!");
//   expect(wrapper.state("open")).toBe(true);
//   expect(wrapper.state("variant")).toBe("success");
//   expect(wrapper.state("message")).toBe("Everything OK!");
// });

// test("`handleSnackbarClose` sets correct state for open, variant, and message", () => {
//   const wrapper = mount(<Notifier />);
//   // call method
//   wrapper.instance().handleSnackbarClose();
//   expect(wrapper.state("open")).toBe(false);
//   expect(wrapper.state("variant")).toBe("info");
//   expect(wrapper.state("message")).toBe("");
// });
// });

// describe("exported openSnackbar function", () => {
//   test("if `openSnackbarFn` is type `function`, calls openSnackbarFn", () => {
//     // mock openSnackbarFn
//     const openSnackbarFnMock = jest.fn();

//     // mount component, set component method to mock, call cDM
//     const wrapper = mount(<Notifier />);
//     wrapper.instance().openSnackbar = openSnackbarFnMock;
//     wrapper.instance().componentDidMount();

//     // call method
//     openSnackbar("success", "Everything OK!", null, false);

//     // expect mock to be called
//     expect(openSnackbarFnMock.mock.calls.length).toBe(1);

//     // restore mock
//     openSnackbarFnMock.mockRestore();
//   });

//   test("if `openSnackbarFn` is type `function`, calls openSnackbarFn (branchOne)", () => {
//     // mock openSnackbarFn
//     const openSnackbarFnMock = jest.fn();

//     // mount component, set component method to mock, call cDM
//     const wrapper = mount(<Notifier />);
//     wrapper.instance().openSnackbar = openSnackbarFnMock;
//     wrapper.instance().componentDidMount();

//     // call method
//     openSnackbar("success", "Everything OK!", null, false, true);

//     // expect mock to be called
//     expect(openSnackbarFnMock.mock.calls.length).toBe(1);

//     // restore mock
//     openSnackbarFnMock.mockRestore();
//   });

//   test("if `openSnackbarFn` is undefined, call setTimeout for 50ms", () => {
//     // clear mock since componentDidMount is called in other tests
//     jest.spyOn(global, "setTimeout");

//     // mount component (ensure openSnackbarFn is undefined here)
//     const wrapper = mount(<Notifier />);
//     wrapper.instance().componentDidMount();
//     wrapper.instance().openSnackbar = undefined;

//     // call method
//     openSnackbar("success", "Everything OK!", null, true);

//     // mock openSnackbarFn
//     const openSnackbarFnMock = jest.fn();

//     // openSnackbarFn should not have been called yet, but setTimeout should
//     expect(openSnackbarFnMock.mock.calls.length).toBe(0);
//     expect(setTimeout).toHaveBeenCalled();

//     // restore mocks
//     jest.useRealTimers();
//     openSnackbarFnMock.mockRestore();
//   });
// });
