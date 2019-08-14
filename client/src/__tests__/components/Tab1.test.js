import React from "react";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";

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

describe("<Tab1 />", () => {
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
        <Tab1Form {...setUpProps} {...props} />
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
      formValues: {},
      updateEmployersPicklist: jest.fn()
    };

    it("renders without error", () => {
      const component = findByTestAttr(wrapper, "component-tab1");
      expect(component.length).toBe(1);
    });

    it("calls handleSubmit on submit", () => {
      wrapper = shallow(<Tab1 {...props} />);
      handleSubmitMock = jest.fn();
      handleSubmit = handleSubmitMock;

      // imported function that creates dummy data for form
      testData = generateSampleValidate();

      wrapper.setProps({ handleSubmit: handleSubmitMock });
      component = wrapper.find("form");
      component.simulate("submit", { ...testData });
      expect(handleSubmit.mock.calls.length).toBe(1);
    });

    it("calls updateEmployersPicklist on select change", () => {
      wrapper = shallow(<Tab1 {...props} />);
      updateEmployersPicklistMock = jest.fn();
      updateEmployersPicklist = updateEmployersPicklistMock;

      wrapper.setProps({
        updateEmployersPicklist: updateEmployersPicklistMock
      });
      component = findByTestAttr(wrapper, "select-employer-type");
      component.simulate("change");
      expect(updateEmployersPicklist.mock.calls.length).toBe(1);
    });

    it("renders connected component", () => {
      const setUpProps = {
        ...defaultProps,
        handleSubmit,
        apiSubmission,
        apiSF
      };
      wrapper = mount(
        <Provider store={store}>
          <Tab1Connected {...setUpProps} {...props} />
        </Provider>
      );
      const component = findByTestAttr(wrapper, "component-tab1");
      expect(component.length).toBe(1);
    });
  });
});
