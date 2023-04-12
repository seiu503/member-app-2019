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
import { Tab2, Tab2Form } from "../../components/Tab2";
import * as formElements from "../../components/SubmissionFormElements";

const theme = createTheme(adaptV4Theme);

// variables
let wrapper,
  store,
  handleSubmit,
  apiSubmission,
  apiSF,
  handleSubmitMock,
  testData,
  component;

let backMock = jest.fn();

// initial props for form
const defaultProps = {
  onSubmit: jest.fn(),
  classes: { test: "test" },
  reCaptchaChange: jest.fn(),
  reCaptchaRef: { current: {} },
  loading: false,
  pristine: false,
  invalid: false,
  renderTextField: formElements.renderTextField,
  renderCheckbox: formElements.renderCheckbox,
  handleTab: jest.fn(),
  legal_language: { current: {} },
  sigBox: { current: {} },
  clearSignature: jest.fn(),
  handleInput: jest.fn(),
  formPage1: {},
  formValues: { employerType: "" },
  signatureType: "draw",
  back: backMock
};

describe("<Tab2 />", () => {
  // assigning handlesubmit as a callback so it can be passed form's onSubmit assignment or our own test function
  beforeEach(() => {
    handleSubmit = fn => fn;
  });

  const initialState = {};

  store = storeFactory(initialState);
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
          <Tab2Form {...setupProps} {...props} />
        </Provider>
      </ThemeProvider>
    );
  };

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
      signatureType: "draw",
      formValues: { employerType: "" }
    };

    it("renders without error", () => {
      const { getByTestId } = setup();
      const component = getByTestId("component-tab2");
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
      fireEvent.submit(getByTestId("form-tab2"), { ...testData });

      // expect the mock to have been called once
      expect(handleSubmitMock).toHaveBeenCalled();

      // restore mock
      handleSubmitMock.mockRestore();
    });

    it("calls `back` on back button click", () => {
      // create a mock function so we can see whether it's called on click
      backMock = jest.fn();

      // add mock function to props
      const props = { back: backMock };

      // set up unwrapped component with handleSubmitMock as handleSubmit prop
      const { getByTestId } = setup({ ...props });

      // imported function that creates dummy data for form
      testData = generateSampleValidate();

      // simulate submit
      fireEvent.click(getByTestId("button-back"));

      // expect the mock to have been called once
      expect(backMock).toHaveBeenCalled();

      // restore mock
      backMock.mockRestore();
    });
  });

  describe("conditional render", () => {
    it("renders DPA checkbox for payment required employer types", () => {
      handleSubmit = fn => fn;
      const props = {
        formValues: {
          employerType: "Retired"
        }
      };
      const { getByLabelText } = setup({ ...props });
      const component = getByLabelText("Direct Pay Authorization");
      expect(component).toBeInTheDocument();
    });
  });
});
