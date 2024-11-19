import React from "react";
import '@testing-library/jest-dom';
import { within } from "@testing-library/dom";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { reduxForm } from 'redux-form';

import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import * as utils from "../../utils/index";
import { generateSampleValidate } from "../../../../app/utils/fieldConfigs";
import { SinglePageForm, spReduxForm, SinglePageFormConnected } from "../../components/SinglePageForm";
import { I18nextProvider } from "react-i18next";
import i18n from "../../translations/i18n";
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
  handleInput: jest.fn(),
  prefillValues: {}
};

const theme = createTheme(adaptV4Theme);

describe("<SinglePageForm />", () => {
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

    const Decorated = reduxForm({ form: 'spReduxForm' })(SinglePageForm);
    return render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <I18nextProvider i18n={i18n} defaultNS={"translation"}>
            <Decorated {...setupProps} {...props} />
          </I18nextProvider>
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
          <SinglePageFormConnected {...setupProps} {...props} />
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
      const component = getByTestId("component-spf");
      expect(component).toBeInTheDocument();
    });

    it("conditionally renders preferred language field", () => {
      const props = {
        formValues: {
          preferredLanguage: null
        },
        prefillValues: {
          preferredLanguage: null
        }
      }
      utils.detectDefaultLanguage = jest.fn().mockImplementation(() => {
            return {lang: "ja", other: true}
          });
      const { getByTestId } = setup(props);
      const component = getByTestId("field-preferred-language");
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
      fireEvent.submit(getByTestId("form-spf"), { ...testData });

      // expect the mock to have been called once
      expect(handleSubmitMock).toHaveBeenCalled();

      // restore mock
      handleSubmitMock.mockRestore();
    });

    it("renders connected component", () => {
      const { getByTestId } = connectedSetup({ ...props });
      const component = getByTestId("component-spf");
      expect(component).toBeInTheDocument();
    });
  });
});
