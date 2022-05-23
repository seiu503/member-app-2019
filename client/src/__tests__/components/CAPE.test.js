import React from "react";
import "@testing-library/jest-dom/extend-expect";
import {
  fireEvent,
  render,
  screen,
  cleanup,
  waitFor
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/styles";
import { storeFactory } from "../../utils/testUtils";
import * as utils from "../../utils/index";
import { generateCAPEValidateFrontEnd } from "../../../../app/utils/fieldConfigs";
import { CAPE, CAPEForm, CAPEConnected } from "../../components/CAPE";
import * as formElements from "../../components/SubmissionFormElements";

// variables
let wrapper,
  store,
  handleSubmit,
  apiSubmission,
  apiSF,
  handleSubmitMock,
  testData,
  suggestedAmountOnChangeMock,
  component;

const changeFieldValueMock = jest.fn();
const backMock = jest.fn();
const changeMock = jest.fn().mockImplementation((name, value) => value);
suggestedAmountOnChangeMock = jest.fn();

// initial props for form
const defaultProps = {
  handleCAPESubmit: jest.fn(),
  classes: { test: "test" },
  reCaptchaChange: jest.fn(),
  reCaptchaRef: { current: {} },
  loading: false,
  pristine: false,
  invalid: false,
  change: changeMock,
  formValues: {
    paymentType: "Card",
    employerName: "blah",
    employerType: "adult foster home"
  },
  formPage1: {
    paymentType: "Card",
    paymentRequired: true,
    newCardNeeded: true
  },
  payment: {
    activeMethodLast4: "1234",
    paymentErrorHold: false
  },
  afhDuesRate: 17.59304,
  changeFieldValue: changeFieldValueMock,
  back: backMock,
  renderTextField: formElements.renderTextField,
  renderSelect: formElements.renderSelect,
  renderCheckbox: formElements.renderCheckbox,
  employerTypesList: ["test"],
  employerList: ["test"],
  checkoff: false,
  displayCAPEPaymentFields: true,
  suggestedAmountOnChange: suggestedAmountOnChangeMock,
  capeObject: {
    monthlyOptions: [""],
    oneTimeOptions: [""]
  }
};

const theme = createTheme();

describe("<CAPE />", () => {
  // assigning handlesubmit as a callback so it can be passed form's onSubmit assignment or our own test function
  // gain access to touched and error to test validation
  // will assign our own test functions to replace action/reducers for apiSubmission prop
  beforeEach(() => {
    handleSubmit = fn => fn;
  });
  afterEach(() => {
    cleanup();
  });
  const initialState = {};

  store = storeFactory(initialState);
  const setup = props => {
    const setUpProps = { ...defaultProps, handleSubmit, apiSubmission, apiSF };
    return render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <CAPEForm {...setUpProps} {...props} />
        </Provider>
      </ThemeProvider>
    );
  };

  // const connectedSetup = props => {
  //   const setUpProps = { ...defaultProps, handleSubmit, apiSubmission, apiSF };
  //   return render(
  //     <ThemeProvider theme={theme}>
  //       <Provider store={store}>
  //         <CAPEConnected {...setUpProps} {...props} />
  //       </Provider>
  //     </ThemeProvider>
  //   );
  // };

  // smoke test and making sure we have access to correct props
  describe("basic setup", () => {
    beforeEach(() => {
      handleSubmit = fn => fn;
    });

    afterEach(() => {
      jest.restoreAllMocks();
      cleanup();
    });

    const suggestedAmountOnChangeMock = jest.fn();

    const props = {
      handleSubmit: fn => fn,
      classes: {},
      formValues: {
        employerType: "adult foster home"
      },
      formPage1: {
        paymentType: "Card",
        paymentRequired: true,
        newCardNeeded: true,
        employerName: "adult foster home"
      },
      afhDuesRate: 17.59304,
      payment: {
        activeMethodLast4: "1234",
        paymentErrorHold: false
      },
      handleEmployerTypeChange: jest
        .fn()
        .mockImplementation(() => Promise.resolve({})),
      suggestedAmountOnChange: suggestedAmountOnChangeMock,
      capeObject: {
        monthlyOptions: [1, 2, 3],
        oneTimeOptions: [4, 5, 6]
      },
      checkoff: true,
      displayCAPEPaymentFields: true,
      capeAmount: 2
    };

    it("renders without error", () => {
      const { getByTestId } = setup();
      const component = getByTestId("component-cape");
      expect(component).toBeInTheDocument();
    });

    it("calls updateEmployersPicklist on select change", () => {
      const updateEmployersPicklistMock = jest.fn();
      const testProps = {
        standAlone: true,
        updateEmployersPicklist: updateEmployersPicklistMock
      };
      const { getAllByRole } = setup({ ...testProps });
      const component = getAllByRole("combobox")[0];
      fireEvent.change(component);
      expect(updateEmployersPicklistMock).toHaveBeenCalled();
    });

    it("calls suggestedAmountOnChange on capeAmount Change", async () => {
      const testProps = {
        suggestedAmountOnChange: suggestedAmountOnChangeMock,
        capeObject: {
          monthlyOptions: ["1", "2", "3"]
        }
      };
      const user = userEvent.setup();
      const { getByLabelText, debug } = await setup({ ...testProps });
      const component = getByLabelText("$1");
      await user.click(component);
      expect(suggestedAmountOnChangeMock).toHaveBeenCalled();
    });

    // it("calls reduxForm `change` prop on capeAmountOther Change", async () => {
    it("calls suggestedAmountOnChange on capeAmountOther Change", async () => {
      const testProps = {
        change: changeMock,
        suggestedAmountOnChange: suggestedAmountOnChangeMock,
        formValues: {
          ...defaultProps.formValues,
          capeAmount: "Other"
        },
        displayCAPEPaymentFields: true
      };
      const user = userEvent.setup();
      const { getByTestId, debug } = await setup({ ...testProps });
      const component = getByTestId("field-other-amount").querySelector(
        "input"
      );
      // debug(component, 3000000);
      await user.type(component, "7");
      expect(suggestedAmountOnChangeMock).toHaveBeenCalled();
      // expect(changeMock).toHaveBeenCalled();
    });

    it("calls handleSubmit on submit", async () => {
      handleSubmitMock = jest.fn();
      const testProps = {
        handleSubmit: handleSubmitMock
      };
      const { getByTestId, debug } = await setup({ ...testProps });
      testData = generateCAPEValidateFrontEnd();

      const component = getByTestId("cape-form");
      fireEvent.submit(component);
      expect(handleSubmitMock).toHaveBeenCalled();
    });

    it("scrolls to first error on failed submit", async () => {
      const scrollToMock = jest.fn();
      utils.scrollToFirstError = scrollToMock;

      const { getByTestId, debug } = await setup();
      testData = generateCAPEValidateFrontEnd();

      const component = getByTestId("cape-form");
      fireEvent.submit(component);
      const asyncCheck = setTimeout(() => {
        expect(scrollToMock).toHaveBeenCalled();
      }, 0);
      global.clearTimeout(asyncCheck);
    });

    it("calls `back` on back button click", async () => {
      const testProps = {
        back: backMock
      };
      const { getByTestId, debug } = await setup({ ...testProps });
      testData = generateCAPEValidateFrontEnd();

      const component = getByTestId("button-back");
      const user = userEvent.setup();
      await user.click(component);
      expect(backMock).toHaveBeenCalled();
    });
  });
  describe("conditional render", () => {
    it("renders alert dialog if capeOpen = `true`", async () => {
      handleSubmit = fn => fn;
      const testProps = {
        capeOpen: true,
        handleSubmit: fn => fn
      };
      const { getByTestId, debug } = await setup({ ...testProps });
      const component = getByTestId("component-alert-dialog");
      expect(component).toBeInTheDocument();
    });

    it("renders contact info form if rendered as standalone component", async () => {
      const testProps = {
        standAlone: true
      };
      const { getByTestId, debug } = await setup({ ...testProps });
      const component = getByTestId("form-contact-info");
      expect(component).toBeInTheDocument();
    });

    it("renders `Other amount` field if capeAmount === `Other`", async () => {
      const testProps = {
        formValues: {
          capeAmount: "Other"
        },
        displayCAPEPaymentFields: true,
        capeObject: {
          oneTimeOptions: [1, 2, 3],
          monthlyOptions: [4, 5, 6]
        },
        donationFrequency: "One-Time"
      };
      const { getByTestId, debug } = await setup({ ...testProps });
      const component = getByTestId("field-other-amount");
      expect(component).toBeInTheDocument();
    });

    it("displays submit button if displayCAPEPaymentFields = true", async () => {
      const testProps = {
        displayCAPEPaymentFields: true
      };
      const { getByLabelText, debug } = await setup({ ...testProps });
      const component = getByLabelText("Submit");
      expect(component).toBeInTheDocument();
    });
  });
});
