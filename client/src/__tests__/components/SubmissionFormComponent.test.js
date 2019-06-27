import React from "react";
import { shallow } from "enzyme";

import { findByTestAttr } from "../../utils/testUtils";
import {
  generateSampleSubmission,
  generateSampleValidate
} from "../../../../app/utils/fieldConfigs";
import SubmissionFormComponent from "../../components/SubmissionFormComponent";

let wrapper,
  error,
  handleSubmit,
  apiSubmission,
  addSubmission,
  handleSubmitMock,
  handleSubmitResponse,
  handleSubmitSuccess,
  handleSubmitError,
  testData,
  clearForm,
  touched;

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
  apiSubmission,
  handleSubmit
};

describe("Unconnected <SubmissionForm />", () => {
  beforeEach(() => {
    touched = false;
    error = null;
    clearForm = jest.fn();
    handleSubmitResponse = fn => fn;
    handleSubmit = fn => fn;
  });

  const unconnectedSetup = () => {
    const setUpProps = { ...defaultProps, handleSubmit };
    return shallow(<SubmissionFormComponent {...setUpProps} />);
  };

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

  describe("submit functionality", () => {
    // beforeEach(() => {
    //   handleSubmitMock = jest.fn()
    //   handleSubmit = handleSubmitMock
    //   wrapper = unconnectedSetup()
    // })
    it("calls clearForm after successful Submit", () => {
      testData = generateSampleValidate();
      handleSubmitSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
        );
      addSubmission = handleSubmitSuccess;
      apiSubmission = { ...addSubmission };
      wrapper = unconnectedSetup();

      wrapper.find("form").simulate("submit", { testData });
      expect(handleSubmitMock.mock.calls.length).toBe(1);
    });
  });
});
