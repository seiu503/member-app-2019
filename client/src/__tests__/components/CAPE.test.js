import React from "react";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";

import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import * as utils from "../../utils/index";
import { generateCAPEValidateFrontEnd } from "../../../../app/utils/fieldConfigs";
import { CAPE, CAPEForm } from "../../components/CAPE";
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
  employerList: ["test"]
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
        .mockImplementation(() => Promise.resolve({}))
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
        suggestedAmountOnChange: suggestedAmountOnChangeMock
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
        }
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
  });
  describe("conditional render", () => {
    it("renders card adding iframe if payment type = `Card`", () => {
      handleSubmit = fn => fn;
      const props = {
        formValues: {
          employerType: "adult foster home",
          paymentType: "Card"
        },
        iFrameURL: "example.com"
      };
      wrapper = setup(props);
      const component = findByTestAttr(wrapper, "component-iframe");
      expect(component.length).toBe(1);
    });

    it("doesn't render iframe or payment type field for other employer types", () => {
      handleSubmit = fn => fn;
      const props = {
        formValues: {
          employerType: "state homecare or personal support"
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
        }
      };
      wrapper = setup(props);
      const component = findByTestAttr(wrapper, "field-other-amount").first();
      expect(component.length).toBe(1);
    });
  });
});
