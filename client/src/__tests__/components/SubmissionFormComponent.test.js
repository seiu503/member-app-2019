import React from "react";
import { shallow } from "enzyme";

import { findByTestAttr } from "../../utils/testUtils";
import {
  generateSampleSubmission,
  generateSampleValidate
} from "../../../../app/utils/fieldConfigs";
import SubmissionFormComponent from "../../components/SubmissionFormComponent";
import * as Notifier from "../../containers/Notifier";

// variables
let wrapper,
  handleSubmit,
  apiSubmission,
  addSubmission,
  clearForm,
  handleSubmitMock,
  clearFormMock,
  handleSubmitSuccess,
  testData,
  handleSubmitError,
  error,
  touched;

// initial props for form
const defaultProps = {
  submission: {
    error: null,
    loading: false
  },
  initialValues: {
    mm: "",
    onlineCampaignSource: null
  },
  formValues: {
    mm: "",
    onlineCampaignSource: null
  },
  classes: { test: "test" },
  // need these here for form to have access to their definitions later
  apiSubmission,
  handleSubmit
};

describe("Unconnected <SubmissionForm />", () => {
  // assigning handlesubmit as a callback so it can be passed form's obSubmit assignment or our own test function
  // gain access to touched and error to test validation
  // will assign our own test functions to replace action/reducers for apiSubmission prop
  beforeEach(() => {
    touched = false;
    error = null;
    handleSubmit = fn => fn;
    apiSubmission = {};
  });

  // create wrapper with default props and assigned values from above as props
  const unconnectedSetup = () => {
    const setUpProps = { ...defaultProps, handleSubmit, apiSubmission };
    return shallow(<SubmissionFormComponent {...setUpProps} />);
  };

  // smoke test and making sure we have access to correct props
  describe("basic setup", () => {
    beforeEach(() => {
      handleSubmitMock = jest.fn();
      handleSubmit = handleSubmitMock;
      wrapper = unconnectedSetup();
    });

    it("renders without error", () => {
      const component = findByTestAttr(wrapper, "component-submissionform");
      expect(component.length).toBe(1);
    });
    it("has access to `submission error` prop", () => {
      expect(wrapper.instance().props.submission.error).toBe(null);
    });
    it("has access to `classes` prop", () => {
      expect(typeof wrapper.instance().props.classes).toBe("object");
      expect(wrapper.instance().props.classes.test).toBe("test");
    });
    it("has access to `initialValues` prop", () => {
      expect(typeof wrapper.instance().props.formValues).toBe("object");
      expect(wrapper.instance().props.initialValues.mm).toBe("");
      expect(wrapper.instance().props.initialValues.onlineCampaignSource).toBe(
        null
      );
    });
    it("calls handleSubmit on submit", () => {
      wrapper.simulate("submit");
      expect(handleSubmitMock.mock.calls.length).toBe(1);
    });
  });

  // testing that we are triggering expected behavior for submit success and failure
  describe("submit functionality", () => {
    it("calls clearForm after successful Submit", () => {
      // imported function that creates dummy data for form
      testData = generateSampleValidate();
      // test function that will count calls as well as return success object
      handleSubmitSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
        );
      // just need to test that this is called after submit success
      clearFormMock = jest.fn();
      // replacing form prop functions and placing them in dispatch action object
      addSubmission = handleSubmitSuccess;
      clearForm = clearFormMock;
      apiSubmission.addSubmission = addSubmission;
      apiSubmission.clearForm = clearForm;
      // creating wrapper
      wrapper = unconnectedSetup();
      // simulate submit with dummy data
      wrapper.find("form").simulate("submit", { testData });
      // testing that submit was called
      expect(handleSubmitSuccess.mock.calls.length).toBe(1);
      // testing that clearForm is called when handleSubmit receives success message
      return handleSubmitSuccess().then(() => {
        expect(clearFormMock.mock.calls.length).toBe(1);
      });
    });

    it("provides error feedback after failed Submit", () => {
      // imported function that creates dummy data for form
      testData = generateSampleValidate();
      // test function that will count calls as well as return error object
      handleSubmitError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_FAILURE" })
        );
      // replacing openSnackbar import with mock function
      Notifier.openSnackbar = jest.fn();
      // replacing form prop functions and placing them in dispatch action object
      addSubmission = handleSubmitError;
      apiSubmission.addSubmission = addSubmission;
      // creating wrapper
      wrapper = unconnectedSetup();
      // simulate submit with dummy data
      wrapper.find("form").simulate("submit", { testData });
      // testing that submit was called
      expect(handleSubmitError.mock.calls.length).toBe(1);
      // testing that clearForm is called when handleSubmit receives Error message
      return handleSubmitError().then(() => {
        expect(Notifier.openSnackbar.mock.calls.length).toBe(1);
      });
    });
  });
});