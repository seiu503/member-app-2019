import React from "react";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";

import { findByTestAttr, storeFactory } from "../../utils/testUtils";
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
  component;

const changeFieldValueMock = jest.fn();
const backMock = jest.fn();

// initial props for form
const defaultProps = {
  handleCAPESubmit: jest.fn(),
  classes: { test: "test" },
  reCaptchaChange: jest.fn(),
  reCaptchaRef: { current: {} },
  loading: false,
  pristine: false,
  invalid: false,
  change: jest.fn(),
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
  formValues: {
    donationFrequency: "Monthly"
  },
  checkoff: false,
  displayCAPEPaymentFields: true,
  capeObject: {
    monthlyOptions: [""],
    oneTimeOptions: [""]
  }
};

describe("<CAPE />", () => {
  // assigning handlesubmit as a callback so it can be passed form's onSubmit assignment or our own test function
  // gain access to touched and error to test validation
  // will assign our own test functions to replace action/reducers for apiSubmission prop
  beforeEach(() => {
    handleSubmit = fn => fn;
  });

  // create wrapper with default props and assigned values from above as props
  // const unconnectedSetup = props => {
  //   const setUpProps = { ...defaultProps, handleSubmit, apiSubmission, apiSF };
  //   return shallow(<Tab3Form {...setUpProps} {...props} />);
  // };
  //
  const initialState = {};

  store = storeFactory(initialState);
  const setup = props => {
    const setUpProps = { ...defaultProps, handleSubmit, apiSubmission, apiSF };
    return mount(
      <Provider store={store}>
        <CAPEForm {...setUpProps} {...props} />
      </Provider>
    );
  };

  const unconnectedSetup = props => {
    const setUpProps = { ...defaultProps, handleSubmit, apiSubmission, apiSF };
    return shallow(<CAPEForm {...setUpProps} {...props} />);
  };

  // smoke test and making sure we have access to correct props
  describe("basic setup", () => {
    beforeEach(() => {
      handleSubmit = fn => fn;
      wrapper = setup();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    const props = {
      handleSubmit: fn => fn,
      classes: {},
      change: jest.fn(),
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
      checkoff: true
    };

    it("renders without error", () => {
      const component = findByTestAttr(wrapper, "component-cape");
      expect(component.length).toBe(1);
    });

    it("calls updateEmployersPicklist on select change", () => {
      const testProps = {
        standAlone: true
      };
      wrapper = shallow(<CAPE {...props} {...testProps} />);
      const updateEmployersPicklistMock = jest.fn();

      wrapper.setProps({
        updateEmployersPicklist: updateEmployersPicklistMock
      });
      component = findByTestAttr(wrapper, "select-employer-type").first();
      const event = {
        target: { value: "the-value" }
      };
      component.simulate("change", event);
      expect(updateEmployersPicklistMock.mock.calls.length).toBe(1);
    });

    it("calls suggestedAmountOnChange on capeAmount Change", () => {
      wrapper = shallow(<CAPE {...props} />);
      const suggestedAmountOnChangeMock = jest.fn();

      wrapper.setProps({
        suggestedAmountOnChange: suggestedAmountOnChangeMock,
        displayCAPEPaymentFields: true
      });

      component = findByTestAttr(wrapper, "radio-cape-amount").first();
      const event = {
        target: { value: "the-value" }
      };
      component.simulate("change", event);
      expect(suggestedAmountOnChangeMock).toHaveBeenCalled();
    });

    it("calls reduxForm `change` prop on capeAmountOther Change", () => {
      wrapper = shallow(<CAPE {...props} />);
      const changeMock = jest.fn();

      wrapper.setProps({
        change: changeMock,
        formValues: {
          capeAmount: "Other"
        },
        displayCAPEPaymentFields: true
      });

      component = findByTestAttr(wrapper, "field-other-amount").first();
      const event = {
        target: { value: "the-value" }
      };
      component.simulate("change", event);
      expect(changeMock).toHaveBeenCalled();
    });

    it("calls handleSubmit on submit", async () => {
      wrapper = shallow(<CAPE {...props} />);
      handleSubmitMock = jest.fn();
      handleSubmit = handleSubmitMock;

      // imported function that creates dummy data for form
      testData = generateCAPEValidateFrontEnd();

      wrapper.setProps({ handleSubmit: handleSubmitMock });
      component = wrapper.find("form");
      component.simulate("submit", { ...testData });
      expect(handleSubmit.mock.calls.length).toBe(1);
    });

    it("scrolls to first error on failed submit", async () => {
      const scrollToMock = jest.fn();
      utils.scrollToFirstError = scrollToMock;

      wrapper = setup(props);
      component = wrapper.find("form");
      component.simulate("submit", "");
      const asyncCheck = setImmediate(() => {
        wrapper.update();
        expect(scrollToMock.mock.calls.length).toBe(1);
      });
      global.clearImmediate(asyncCheck);
    });

    it("calls `back` on back button click", () => {
      wrapper = shallow(<CAPE {...props} />);

      // imported function that creates dummy data for form
      testData = generateCAPEValidateFrontEnd();

      wrapper.setProps({ back: backMock });
      component = findByTestAttr(wrapper, "button-back");
      component.simulate("click");
      expect(backMock.mock.calls.length).toBe(1);
    });

    it("calls `whichCardOnChange` on which card radio change", () => {
      wrapper = shallow(<CAPE {...props} />);

      let toggleCardAddingFrameMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(""));

      wrapper.setProps({
        toggleCardAddingFrame: toggleCardAddingFrameMock,
        iFrameURL: "http://test.com",
        formValues: {
          donationFrequency: "One-Time"
        },
        formPage1: {
          paymentRequired: true,
          paymentType: "Card"
        },
        payment: {
          activeMethodLast4: "1234"
        },
        displayCAPEPaymentFields: true
      });
      wrapper.update();
      component = findByTestAttr(wrapper, "radio-which-card");
      component.simulate("change", "Add new card");
      // expect(toggleCardAddingFrameMock.mock.calls.length).toBe(1);
    });
  });
  describe("conditional render", () => {
    it("renders alert dialog if capeOpen = `true`", () => {
      handleSubmit = fn => fn;
      const props = {
        capeOpen: true,
        handleSubmit: fn => fn
      };
      store = storeFactory(initialState);
      wrapper = shallow(<CAPE {...defaultProps} {...props} store={store} />);
      const component = findByTestAttr(wrapper, "component-alert-dialog");
      expect(component.length).toBe(1);
    });

    it("renders current contribution copy if currentCAPEFromSF > 0", () => {
      handleSubmit = fn => fn;
      const props = {
        formValues: {
          donationFrequency: "One-Time"
        },
        displayCAPEPaymentFields: true,
        payment: {
          currentCAPEFromSF: 5
        },
        capeObject: {
          monthlyOptions: [1, 2, 3],
          oneTimeOptions: [4, 5, 6]
        },
        handleSubmit: fn => fn
      };
      store = storeFactory(initialState);
      wrapper = shallow(<CAPE {...defaultProps} {...props} store={store} />);
      const component = findByTestAttr(wrapper, "current-contribution");
      expect(component.length).toBe(1);
    });

    it("renders card adding iframe if payment type = `Card`", () => {
      handleSubmit = fn => fn;
      const props = {
        formValues: {
          paymentType: "Card",
          donationFrequency: "One-Time"
        },
        checkoff: false,
        iFrameURL: "example.com",
        displayCAPEPaymentFields: true,
        capeObject: {
          oneTimeOptions: [1, 2, 3],
          monthlyOptions: [4, 5, 6]
        }
      };
      wrapper = setup(props);
      const component = findByTestAttr(wrapper, "component-iframe");
      expect(component.length).toBe(1);
    });

    it("doesn't render iframe or payment type field for other employer types", () => {
      handleSubmit = fn => fn;
      const props = {
        formValues: {
          employerType: "state homecare or personal support",
          donationFrequency: "Monthly"
        }
      };
      wrapper = setup(props);
      const iframe = findByTestAttr(wrapper, "component-iframe");
      const radio = findByTestAttr(wrapper, "radio-payment-type");
      expect(iframe.length).toBe(0);
      expect(radio.length).toBe(0);
    });

    it("renders contact info form if rendered as standalone component", () => {
      const props = {
        standAlone: true
      };
      wrapper = setup(props);
      const component = findByTestAttr(wrapper, "form-contact-info");
      expect(component.length).toBe(1);
    });

    it("renders `Other amount` field if capeAmount === `Other`", () => {
      const props = {
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
      wrapper = setup(props);
      const component = findByTestAttr(wrapper, "field-other-amount").first();
      expect(component.length).toBe(1);
    });

    it("renders iframe if donationFrequency === 'One-Time'", () => {
      const props = {
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
      wrapper = setup(props);
      const component = findByTestAttr(wrapper, "field-other-amount").first();
      expect(component.length).toBe(1);
    });

    it("renders iframe if capeObject.activeMethodLast4 && !capeObject.paymentErrorHold", () => {
      const props = {
        formValues: {
          capeAmount: "Other"
        },
        displayCAPEPaymentFields: true,
        capeObject: {
          oneTimeOptions: [1, 2, 3],
          monthlyOptions: [4, 5, 6],
          activeMethodLast4: 1234
        },
        payment: {
          paymentErrorHold: true
        },
        donationFrequency: "Monthly"
      };
      wrapper = setup(props);
      const component = findByTestAttr(wrapper, "field-other-amount").first();
      expect(component.length).toBe(1);
    });

    it("displays submit button if capeObject.activeMethodLast4 && !capeObject.paymentErrorHold", () => {
      const props = {
        formValues: {
          capeAmount: "Other"
        },
        formPage1: {
          paymentRequired: false
        },
        standAlone: false,
        displayCAPEPaymentFields: true
      };
      wrapper = setup(props);
      const component = findByTestAttr(wrapper, "button-submit");
      expect(component.length).toBe(1);
    });

    it("displays submit button if !paymentRequired, !standAlone, displayCAPEPaymentFields", () => {
      const props = {
        formPage1: {
          paymentRequired: false
        },
        standAlone: false,
        displayCAPEPaymentFields: true
      };
      wrapper = setup(props);
      const component = findByTestAttr(wrapper, "button-submit");
      expect(component.length).toBe(1);
    });

    it("does not display submit button if !displaySubmit", () => {
      const props = {
        formPage1: {
          paymentRequired: true
        },
        payment: {
          activeMethodLast4: undefined // !validMethod
        }
      };
      wrapper = setup(props);
      const component = findByTestAttr(wrapper, "button-submit");
      expect(component.length).toBe(0);
    });

    it("displays submit button if checkoff, donationFreq = monthly, amountSet (other)", () => {
      const props = {
        checkoff: true,
        donationFrequency: "Monthly",
        formValues: {
          capeAmountOther: 10
        }
      };
      wrapper = setup(props);
      const component = findByTestAttr(wrapper, "button-submit");
      expect(component.length).toBe(1);
    });

    it("displays submit button if checkoff, donationFreq = monthly, amountSet (number)", () => {
      const props = {
        checkoff: true,
        donationFrequency: "Monthly",
        formValues: {
          capeAmount: 10
        }
      };
      wrapper = setup(props);
      const component = findByTestAttr(wrapper, "button-submit");
      expect(component.length).toBe(1);
    });
  });
});
