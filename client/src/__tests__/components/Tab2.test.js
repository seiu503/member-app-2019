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
  toggleSignatureInputType,
  handleToggleSigTypeMock,
  testData,
  component;

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
  signatureType: "draw",
  toggleSignatureInputType: jest.fn()
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
      signatureType: "draw"
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

    it("calls toggleSignatureInputType on button click", () => {
      wrapper = shallow(<Tab2 {...props} />);
      handleToggleSigTypeMock = jest.fn();
      toggleSignatureInputType = handleToggleSigTypeMock;

      // imported function that creates dummy data for form
      testData = generateSampleValidate();

      wrapper.setProps({ toggleSignatureInputType: handleToggleSigTypeMock });
      component = findByTestAttr(wrapper, "button-sig-toggle");
      component.simulate("click");
      expect(toggleSignatureInputType.mock.calls.length).toBe(1);
    });
  });
});
