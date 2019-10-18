import React from "react";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";

import { findByTestAttr, storeFactory } from "../../utils/testUtils";
// import * as utils from "../../utils/index";
import { generateSampleValidate } from "../../../../app/utils/fieldConfigs";
import { Tab3, Tab3Form } from "../../components/Tab3";

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
  onSubmit: jest.fn(),
  classes: { test: "test" },
  reCaptchaChange: jest.fn(),
  reCaptchaRef: { current: {} },
  loading: false,
  pristine: false,
  invalid: false,
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
  back: backMock
};

describe("<Tab3 />", () => {
  // assigning handlesubmit as a callback so it can be passed form's onSubmit assignment or our own test function
  beforeEach(() => {
    handleSubmit = fn => fn;
  });

  const initialState = {};

  store = storeFactory(initialState);
  const setup = props => {
    const setUpProps = { ...defaultProps, handleSubmit, apiSubmission, apiSF };
    return mount(
      <Provider store={store}>
        <Tab3Form {...setUpProps} {...props} />
      </Provider>
    );
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
      }
    };

    it("renders without error", () => {
      const component = findByTestAttr(wrapper, "component-tab3");
      expect(component.length).toBe(1);
    });

    it("calls handleSubmit on submit", async () => {
      wrapper = shallow(<Tab3 {...props} />);
      handleSubmitMock = jest.fn();
      handleSubmit = handleSubmitMock;

      // imported function that creates dummy data for form
      testData = generateSampleValidate();

      wrapper.setProps({ handleSubmit: handleSubmitMock });
      component = wrapper.find("form");
      component.simulate("submit", { ...testData });
      expect(handleSubmit.mock.calls.length).toBe(1);
    });

    it("calls `back` on back button click", () => {
      wrapper = shallow(<Tab3 {...props} />);

      // imported function that creates dummy data for form
      testData = generateSampleValidate();

      wrapper.setProps({ back: backMock });
      component = findByTestAttr(wrapper, "button-back");
      component.simulate("click");
      expect(backMock.mock.calls.length).toBe(1);
    });

    it("calls `whichCardOnChange` on which card radio change", async () => {
      wrapper = setup(props);

      let toggleCardAddingFrameMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(""));

      wrapper.setProps({
        toggleCardAddingFrame: toggleCardAddingFrameMock,
        iFrameURL: "http://test.com",
        formValues: {},
        formPage1: {
          paymentRequired: true,
          paymentType: "Card"
        },
        payment: {
          activeMethodLast4: "1234",
          cardBrand: "Visa"
        }
      });
      wrapper.update();
      component = findByTestAttr(wrapper, "radio-which-card").first();
      component.simulate("change", "Add new card");
      // expect(toggleCardAddingFrameMock.mock.calls.length).toBe(1);
    });
  });
  describe("conditional render", () => {
    it("renders Payment Type radio for retirees", () => {
      handleSubmit = fn => fn;
      const props = {
        formValues: {
          employerType: "Retired"
        }
      };
      wrapper = setup(props);
      const component = findByTestAttr(wrapper, "radio-payment-type");
      expect(component.length).toBeGreaterThan(1);
    });

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
  });
});
