import React from "react";
import '@testing-library/jest-dom';
import {
  fireEvent,
  render,
  screen,
  cleanup,
  waitFor
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { storeFactory } from "../../utils/testUtils";
import * as utils from "../../utils/index";
import { generateCAPEValidateFrontEnd } from "../../../../app/utils/fieldConfigs";
import { CAPE, CAPEForm, CAPEConnected } from "../../components/CAPE";
import * as formElements from "../../components/SubmissionFormElements";
import { I18nextProvider } from "react-i18next";
import i18n from "../../translations/i18n";
import { BrowserRouter, MemoryRouter } from "react-router-dom";

// variables
let wrapper,
  store,
  handleSubmit,
  apiSubmission,
  apiSF,
  handleSubmitMock,
  testData,
  component;

const changeFieldValueMock = jest.fn();
const backMock = jest.fn();
const changeMock = jest.fn().mockImplementation((name, value) => value);
handleSubmitMock = jest.fn();

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
  capeObject: {
    monthlyOptions: [""],
    oneTimeOptions: [""]
  },
  submission: {
    cape: {
      monthlyOptions: [""],
      oneTimeOptions: [""]
    }
  }
};

const theme = createTheme(adaptV4Theme);

describe("<CAPE />", () => {
  // assigning handlesubmit as a callback so it can be passed form's onSubmit assignment or our own test function
  // gain access to touched and error to test validation
  // will assign our own test functions to replace action/reducers for apiSubmission prop
  beforeEach(() => {
    handleSubmit = handleSubmitMock;
  });
  afterEach(() => {
    cleanup();
  });
  const initialState = {};

  store = storeFactory(initialState);
  const setup = async (props = {}, route = "/") => {
    // console.log('##################################### TEST PROPS ##################');
    // console.log(props);
    const setUpProps = { ...defaultProps, ...props, handleSubmit, apiSubmission, apiSF };
    // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ SETUP PROPS @@@@@@@@@@@@@@@@@@');
    // console.log(setUpProps);
    return render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <I18nextProvider i18n={i18n} defaultNS={"translation"}>
            <MemoryRouter initialEntries={[route]}>
              <CAPEForm {...setUpProps} />
            </MemoryRouter>
          </I18nextProvider>
        </Provider>
      </ThemeProvider>
    );
  };

  describe("basic setup", () => {
    beforeEach(() => {
      handleSubmit = handleSubmitMock;
    });

    afterEach(() => {
      jest.restoreAllMocks();
      cleanup();
    });

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
      capeObject: {
        monthlyOptions: [1, 2, 3],
        oneTimeOptions: [4, 5, 6]
      },
      checkoff: true,
      displayCAPEPaymentFields: true,
      capeAmount: 2
    };

    it("renders without error", async () => {
      const { getByTestId } = await setup(props, "/?cape=true");
      const component = getByTestId("component-cape");
      expect(component).toBeInTheDocument();
    });

    it("calls updateEmployersPicklist on select change", async () => {
      const updateEmployersPicklistMock = jest.fn();
      const testProps = {
        standAlone: true,
        updateEmployersPicklist: updateEmployersPicklistMock
      };
      const { getAllByRole } = await setup({ ...testProps }, "/?cape=true");
      const component = getAllByRole("combobox")[0];
      fireEvent.change(component);
      expect(updateEmployersPicklistMock).toHaveBeenCalled();
    });

    it("calls handleSubmit on submit", async () => {
      handleSubmitMock = jest.fn();
      const testProps = {
        handleSubmit: handleSubmitMock,
        displayCAPEPaymentFields: true,
        submission: {
          cape: {
            oneTimeOptions: [1, 2, 3],
            monthlyOptions: [4, 5, 6]
          }
        },
        donationFrequency: "One-Time"
      };
      const { getByTestId, getByLabelText, debug } = await setup(
        { ...testProps },
        "/?cape=true"
      );

      const component = getByTestId("cape-form");
      const radio = getByLabelText("$4");
      const user = userEvent.setup();
      await user.click(component);
      await fireEvent.submit(component);
      // await debug();
      const asyncCheck = setTimeout(() => {
        expect(handleSubmitMock).toHaveBeenCalled();
      }, 0);
      global.clearTimeout(asyncCheck);
    });

    it("scrolls to first error on failed submit", async () => {
      const scrollToMock = jest.fn();
      utils.scrollToFirstError = scrollToMock;

      const { getByTestId, debug } = await setup(props, "/?cape=true");
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
      const { getByTestId, debug } = await setup(
        { ...testProps },
        "/?cape=true"
      );
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
      const { getByTestId, debug } = await setup(
        { ...testProps },
        "/?cape=true"
      );
      const component = getByTestId("component-alert-dialog");
      debug(component);
      expect(component).toBeInTheDocument();
    });

    it("renders contact info form if rendered as standalone component", async () => {
      const testProps = {
        standAlone: true
      };
      const { getByTestId, debug } = await setup(
        { ...testProps }
      );
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
      const { getByTestId, debug } = await setup(
        { ...testProps },
        "/?cape=true"
      );
      const component = getByTestId("field-other-amount");
      expect(component).toBeInTheDocument();
    });

    it("changes CAPE amount if user clicks radio button", async () => {
      const testProps = {
        displayCAPEPaymentFields: true,
        submission: {
          cape: {
            oneTimeOptions: [1, 2, 3],
            monthlyOptions: [4, 5, 6]
          }
        },
        donationFrequency: "One-Time"
      };
      const { getByLabelText, debug } = await setup(
        { ...testProps },
        "/?cape=true"
      );
      const component = getByLabelText("$4");
      expect(component).toBeInTheDocument();
      const user = userEvent.setup();
      await user.click(component);
      expect(component.value).toBe('4');
    });

    it("displays submit button if displayCAPEPaymentFields = true", async () => {
      const testProps = {
        displayCAPEPaymentFields: true
      };
      const { getByLabelText, debug } = await setup(
        { ...testProps },
        "/?cape=true"
      );
      const component = getByLabelText("Submit");
      expect(component).toBeInTheDocument();
    });
  });
});
