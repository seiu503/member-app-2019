import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { within } from "@testing-library/dom";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";

import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import { generateSampleValidate } from "../../../../app/utils/fieldConfigs";
import { Tab1, Tab1Form, Tab1Connected } from "../../components/Tab1";
import * as formElements from "../../components/SubmissionFormElements";

// variables
let wrapper,
  store,
  handleSubmit,
  apiSubmission,
  apiSF,
  handleSubmitMock,
  updateEmployersPicklist,
  updateEmployersPicklistMock,
  testData,
  component;

// initial props for form
const defaultProps = {
  onSubmit: jest.fn(),
  classes: { test: "test" },
  formValues: {},
  renderTextField: formElements.renderTextField,
  renderCheckbox: formElements.renderCheckbox,
  renderSelect: formElements.renderSelect,
  loading: false,
  pristine: false,
  invalid: false,
  employerTypesList: [""],
  employerList: [""],
  updateEmployersPicklist: jest.fn(),
  width: "lg",
  handleTab: jest.fn(),
  handleInput: jest.fn()
};

const theme = createTheme(adaptV4Theme);

describe("<Tab1 />", () => {
  // assigning handlesubmit as a callback so it can be passed form's onSubmit assignment or our own test function
  beforeEach(() => {
    handleSubmit = fn => fn;
  });

  const initialState = {};

  store = storeFactory(initialState);
  // const setup = props => {
  //   const setUpProps = { ...defaultProps, handleSubmit, apiSubmission, apiSF };
  //   return mount(
  //     <Provider store={store}>
  //       <Tab1Form {...setUpProps} {...props} />
  //     </Provider>
  //   );
  // };

  const setup = (props = {}) => {
    const setupProps = {
      ...defaultProps,
      ...props,
      handleSubmit,
      apiSubmission,
      apiSF
    };
    return render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <Tab1Form {...setupProps} {...props} />
        </Provider>
      </ThemeProvider>
    );
  };

  const connectedSetup = (props = {}) => {
    const setupProps = {
      ...defaultProps,
      ...props,
      handleSubmit,
      apiSubmission,
      apiSF
    };
    return render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <Tab1Connected {...setupProps} {...props} />
        </Provider>
      </ThemeProvider>
    );
  };

  const {
    stateList,
    monthList,
    languageOptions,
    dateOptions,
    yearOptions,
    classesPage1
  } = formElements;

  // smoke test and making sure we have access to correct props
  describe("basic setup", () => {
    beforeEach(() => {
      handleSubmit = fn => fn;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    const props = {
      handleSubmit: fn => fn,
      classes: {},
      formValues: {},
      updateEmployersPicklist: jest.fn()
    };

    it("renders without error", () => {
      const { getByTestId } = setup();
      const component = getByTestId("component-tab1");
      expect(component).toBeInTheDocument();
    });

    it("calls handleSubmit on submit", () => {
      // create a mock function so we can see whether it's called on click
      handleSubmitMock = jest.fn();

      // add mock function to props
      const props = { handleSubmit: handleSubmitMock };

      // set up unwrapped component with handleSubmitMock as handleSubmit prop
      const { getByTestId } = setup({ ...props });

      // imported function that creates dummy data for form
      testData = generateSampleValidate();

      // simulate submit
      fireEvent.submit(getByTestId("form-tab1"), { ...testData });

      // expect the mock to have been called once
      expect(handleSubmitMock).toHaveBeenCalled();

      // restore mock
      handleSubmitMock.mockRestore();
    });

    it("calls updateEmployersPicklist on select change", async () => {
      // create a mock function so we can see whether it's called on select change
      updateEmployersPicklistMock = jest.fn();
      let handleEmployerChangeMock = jest.fn();

      // add mock function to props
      const props = {
        updateEmployersPicklist: updateEmployersPicklistMock,
        handleEmployerChange: handleEmployerChangeMock
      };

      // set up unwrapped component with mock functions assigned to props
      const user = userEvent.setup();
      const { getByLabelText, getByRole } = await setup({ ...props });
      const fieldContainer = getByLabelText("Employer Type");

      // simulate select change
      await userEvent.selectOptions(fieldContainer, [""]);

      // expect the mock to have been called once
      expect(updateEmployersPicklistMock).toHaveBeenCalled();

      // restore mock
      updateEmployersPicklistMock.mockRestore();
    });

    it("renders connected component", () => {
      props.formValues.employerType = "adult foster home";
      const { getByTestId } = connectedSetup({ ...props });
      const component = getByTestId("component-tab1");
      expect(component).toBeInTheDocument();
    });
  });
});
