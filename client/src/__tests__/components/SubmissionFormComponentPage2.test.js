import React from "react";
import { shallow } from "enzyme";

import { findByTestAttr } from "../../utils/testUtils";
import { generatePage2Validate } from "../../../../app/utils/fieldConfigs";
import { SubmissionFormPage2Component } from "../../components/SubmissionFormPage2Component";
import * as formElements from "../../components/SubmissionFormElements";
import * as Notifier from "../../containers/Notifier";

// variables
let wrapper,
  handleSubmit,
  apiSubmission,
  apiSF,
  updateSubmission,
  handleSubmitMock,
  handleSubmitSuccess,
  updateSFContactSuccess,
  testData,
  handleSubmitError,
  error,
  touched;

const initialState = {
  submission: {
    salesforceId: "1"
  },
  appState: {
    loading: false,
    error: ""
  },
  formValues: {}
};

// initial props for form
const defaultProps = {
  submission: {
    error: null,
    loading: false
  },
  initialValues: { gender: "" },
  formValues: { gender: "" },
  classes: { test: "test" },
  // need these here for form to have access to their definitions later
  apiSubmission,
  handleSubmit,
  apiSF,
  location: {
    search: ""
  },
  reset: jest.fn(),
  history: {
    push: jest.fn()
  }
};

describe("Unconnected <SubmissionFormPage2 />", () => {
  // assigning handlesubmit as a callback so it can be passed form's onSubmit assignment or our own test function
  // gain access to touched and error to test validation
  // will assign our own test functions to replace action/reducers for apiSubmission prop
  beforeEach(() => {
    touched = false;
    error = null;
    handleSubmit = fn => fn;
    apiSubmission = {};
    apiSF = {
      updateSFContact: jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SF_CONTACT_SUCCESS" })
        )
    };
  });

  // create wrapper with default props and assigned values from above as props
  const unconnectedSetup = props => {
    const setUpProps = { ...defaultProps, handleSubmit, apiSubmission, apiSF };
    return shallow(<SubmissionFormPage2Component {...setUpProps} {...props} />);
  };

  // smoke test and making sure we have access to correct props
  describe("basic setup", () => {
    beforeEach(() => {
      handleSubmitMock = jest.fn();
      handleSubmit = handleSubmitMock;
      wrapper = unconnectedSetup();
    });

    it("renders without error", () => {
      const component = findByTestAttr(
        wrapper,
        "component-submissionformpage2"
      );
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
      expect(wrapper.instance().props.initialValues.gender).toBe("");
    });
    it("calls handleSubmit on submit", () => {
      wrapper.simulate("submit");
      expect(handleSubmitMock.mock.calls.length).toBe(1);
    });
  });

  // testing that we are triggering expected behavior for submit success and failure
  describe("submit functionality", () => {
    it("calls reset after successful Submit", async function() {
      let resetMock = jest
        .fn()
        .mockImplementation(() => console.log("reset mock"));
      const props = {
        reset: resetMock
      };
      // imported function that creates dummy data for form
      testData = generatePage2Validate();
      // test function that will count calls as well as return success object
      handleSubmitSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
        );

      updateSFContactSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SF_CONTACT_SUCCESS" })
        );

      // creating wrapper
      wrapper = unconnectedSetup(props);

      wrapper.instance().props.apiSubmission.updateSubmission = handleSubmitSuccess;
      wrapper.instance().props.apiSF.updateSFContact = updateSFContactSuccess;

      wrapper.update();

      // simulate submit with dummy data
      await wrapper.find("form").simulate("submit", { testData });
      // testing that submit was called
      expect(handleSubmitSuccess.mock.calls.length).toBe(1);

      // testing that reset is called when handleSubmit receives success message
      try {
        await handleSubmitSuccess();
        await updateSFContactSuccess();
        expect(resetMock.mock.calls.length).toBe(1);
      } catch (err) {
        console.log(err);
      }
    });

    it("provides error feedback after failed Submit", async function() {
      let resetMock = jest
        .fn()
        .mockImplementation(() => console.log("reset mock"));
      // imported function that creates dummy data for form
      testData = generatePage2Validate();
      // test function that will count calls as well as return error object
      handleSubmitError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SUBMISSION_FAILURE" })
        );
      // replacing handleError import with mock function
      formElements.handleError = jest.fn();
      // replacing form prop functions and placing them in dispatch action object
      updateSubmission = handleSubmitError;
      apiSubmission.updateSubmission = updateSubmission;
      // creating wrapper
      wrapper = unconnectedSetup();
      // simulate submit with dummy data
      wrapper.find("form").simulate("submit", { testData });
      // testing that submit was called
      expect(handleSubmitError.mock.calls.length).toBe(1);
      // testing that clearForm is called when handleSubmit receives Error message
      try {
        await handleSubmitError();
        expect(formElements.handleError.mock.calls.length).toBe(1);
      } catch (err) {
        console.log(err);
      }
    });

    it("catches promise reject", async function() {
      testData = generatePage2Validate();
      formElements.handleError = jest.fn();
      handleSubmitError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SUBMISSION_FAILURE" })
        );
      Notifier.openSnackbar = jest.fn();
      updateSubmission = handleSubmitError;
      apiSubmission.updateSubmission = updateSubmission;
      wrapper = unconnectedSetup();
      wrapper.find("form").simulate("submit", { testData });
      expect(handleSubmitError.mock.calls.length).toBe(1);
      try {
        await handleSubmitError();
        expect(formElements.handleError.mock.calls.length).toBe(1);
      } catch (err) {
        console.log(err);
      }
    });

    it("handles ethnicities edge cases: declined", async function() {
      let resetMock = jest
        .fn()
        .mockImplementation(() => console.log("reset mock"));
      // imported function that creates dummy data for form
      testData = generatePage2Validate();
      testData.declined = true;
      // test function that will count calls as well as return success object
      handleSubmitSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
        );

      // creating wrapper
      wrapper = unconnectedSetup();

      wrapper.instance().props.apiSubmission.updateSubmission = handleSubmitSuccess;

      // simulate submit with dummy data
      wrapper.find("form").simulate("submit", { testData });
      // testing that submit was called
      expect(handleSubmitSuccess.mock.calls.length).toBe(1);
    });
  });
});
