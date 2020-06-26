import React from "react";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";

import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import { generateSampleValidate } from "../../../../app/utils/fieldConfigs";
import { Tab2, Tab2Form } from "../../components/Tab2";
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
  const setup = props => {
    const setUpProps = { ...defaultProps, handleSubmit, apiSubmission, apiSF };
    return mount(
      <Provider store={store}>
        <Tab2Form {...setUpProps} {...props} />
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
      signatureType: "draw",
      formValues: { employerType: "" }
    };

    it("renders without error", () => {
      const component = findByTestAttr(wrapper, "component-tab2");
      expect(component.length).toBe(1);
    });

    it("calls handleSubmit on submit", () => {
      wrapper = shallow(<Tab2 {...props} />);
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
      wrapper = shallow(<Tab2 {...props} />);

      // imported function that creates dummy data for form
      testData = generateSampleValidate();

      wrapper.setProps({ back: backMock });
      component = findByTestAttr(wrapper, "button-back");
      component.simulate("click");
      expect(backMock.mock.calls.length).toBe(1);
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
      wrapper = setup(props);
      const component = findByTestAttr(wrapper, "checkbox-DPA");
      expect(component.length).toBeGreaterThan(1);
    });

    it("renders DDA checkbox for hcw", () => {
      handleSubmit = fn => fn;
      const props = {
        formValues: {
          employerType: "state homecare or personal support"
        }
      };
      wrapper = setup(props);
      const component = findByTestAttr(wrapper, "checkbox-DDA");
      expect(component.length).toBeGreaterThan(1);
    });

    it("renders standard signature input for sig type === `write`", () => {
      handleSubmit = fn => fn;
      const props = {
        signatureType: "write"
      };
      wrapper = setup(props);
      const component = findByTestAttr(wrapper, "input-signature");
      expect(component.length).toBeGreaterThan(1);
    });
  });
});
