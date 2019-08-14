import React from "react";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import "jest-canvas-mock";

import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import { generateSampleValidate } from "../../../../app/utils/fieldConfigs";
import { languageOptions } from "../../components/SubmissionFormElements";
import {
  SubmissionFormPage1Component,
  SubmissionFormWrap
} from "../../components/SubmissionFormPage1Component";

import * as Notifier from "../../containers/Notifier";
import { INITIAL_STATE } from "../../store/reducers/submission";
// variables
let wrapper,
  store,
  handleSubmit,
  apiSubmission,
  apiSF,
  handleSubmitMock,
  addSubmission,
  addSubmissionSuccess,
  addSubmissionError,
  props,
  testData,
  tab,
  component,
  sfLookupError,
  sfEmployerLookupSuccess,
  sfEmployerLookupFailure,
  getSFEmployersSuccess,
  error,
  handleUpload,
  updateEmployersPicklist,
  touched;

let resetMock = jest.fn();

const initialState = {
  appState: {
    loading: false,
    error: ""
  }
};

// initial props for form
const defaultProps = {
  submission: {
    error: null,
    loading: false,
    employerNames: ["name1", "name2", "name3"],
    formPage1: {
      firstName: "",
      lastName: "",
      homeEmail: "",
      signature: "string"
    }
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
  apiSF,
  handleSubmit,
  handleUpload,
  updateEmployersPicklist,
  legal_language: {
    current: {
      textContent: "blah"
    }
  },
  location: {
    search: ""
  },
  reset: resetMock,
  history: {
    push: jest.fn()
  },
  reCaptchaRef: {
    current: {
      getValue: jest.fn().mockImplementation(() => "mock value")
    }
  },
  content: {},
  apiContent: {},
  tab
};

describe("Unconnected <SubmissionFormPage1 />", () => {
  // assigning handlesubmit as a callback so it can be passed form's onSubmit assignment or our own test function
  // gain access to touched and error to test validation
  // will assign our own test functions to replace action/reducers for apiSubmission prop
  beforeEach(() => {
    touched = false;
    error = null;
    handleSubmit = fn => fn;
    apiSubmission = {};
    apiSF = {
      getSFEmployers: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // create wrapper with default props and assigned values from above as props
  const unconnectedSetup = props => {
    const setUpProps = { ...defaultProps, handleSubmit, apiSubmission, apiSF };
    return shallow(<SubmissionFormPage1Component {...setUpProps} {...props} />);
  };

  store = storeFactory(initialState);
  const setup = props => {
    const setUpProps = { ...defaultProps, handleSubmit, apiSubmission, apiSF };
    return mount(
      <Provider store={store}>
        <SubmissionFormPage1Component {...setUpProps} {...props} />
      </Provider>
    );
  };

  // smoke test and making sure we have access to correct props
  describe("basic setup", () => {
    beforeEach(() => {
      handleSubmitMock = jest.fn();
      handleSubmit = handleSubmitMock;
      wrapper = unconnectedSetup();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("renders without error", () => {
      const component = findByTestAttr(
        wrapper,
        "component-submissionformpage1"
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
      expect(wrapper.instance().props.initialValues.mm).toBe("");
      expect(wrapper.instance().props.initialValues.onlineCampaignSource).toBe(
        null
      );
    });

    // it("has languageOptions", () => {
    //   wrapper = unconnectedSetup();
    //   let languageSelect = wrapper.find(`[name="preferredLanguage"]`);
    //   expect(languageSelect.options).toBe(languageOptions)
    // });
    // it("calls handleSubmit on submit", () => {
    //   testData = generateSampleValidate();
    //   addSubmissionSuccess = jest
    //     .fn()
    //     .mockImplementation(() =>
    //       Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
    //     );
    //   wrapper = unconnectedSetup();
    //   wrapper.setProps({ tab: 2, apiSubmission: { addSubmission: addSubmissionSuccess }});
    //   wrapper.instance().handleSubmit = handleSubmitMock;
    //   wrapper.update();
    //   wrapper.find("ReduxForm").simulate("submit", { ...testData });
    //   expect(handleSubmitMock.mock.calls.length).toBe(1);
    // });
  });

  // testing that we are triggering expected behavior for submit success and failure
  describe("submit functionality", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it("checks for recaptcha value on submit", () => {
      testData = generateSampleValidate();
      addSubmissionSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
        );
      wrapper = unconnectedSetup();
      wrapper.setProps({
        tab: 2,
        apiSubmission: { addSubmission: addSubmissionSuccess }
      });
      wrapper.update();
      wrapper.find("ReduxForm").simulate("submit", { ...testData });
      expect(
        wrapper.instance().props.reCaptchaRef.current.getValue.mock.calls.length
      ).toBe(1);
    });

    it("calls reset after successful Submit", () => {
      // imported function that creates dummy data for form
      testData = generateSampleValidate();
      // test function that will count calls as well as return success object
      addSubmissionSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
        );
      // creating wrapper
      wrapper = unconnectedSetup();
      wrapper.setProps({
        tab: 2
      });
      wrapper.instance().props.apiSubmission.addSubmission = addSubmissionSuccess;
      wrapper.update();
      // simulate signatureToggle to switch type to "write"
      // wrapper.find(`[name="signatureType"]`).simulate("click");
      // simulate submit with dummy data
      wrapper.find("ReduxForm").simulate("submit", { ...testData });
      // testing that submit was called
      expect(addSubmissionSuccess.mock.calls.length).toBe(1);
      // testing that reset is called when handleSubmit receives success message
      return addSubmissionSuccess().then(() => {
        expect(resetMock.mock.calls.length).toBe(1);
      });
    });
    it("errors if there is no signature", () => {
      // imported function that creates dummy data for form
      testData = generateSampleValidate();
      // test function that will count calls as well as return success object
      addSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_FAILURE" })
        );

      // replacing openSnackbar import with mock function
      Notifier.openSnackbar = jest.fn();
      // creating wrapper
      wrapper = unconnectedSetup();
      wrapper.setProps({
        tab: 2
      });
      wrapper.update();
      addSubmission = addSubmissionError;
      apiSubmission.addSubmission = addSubmission;
      // simulate signatureToggle to switch type to "write"
      // wrapper.find(`[name="signatureType"]`).simulate("click");
      delete testData.signature;
      // simulate submit with dummy data
      wrapper.find("ReduxForm").simulate("submit", { ...testData });
      // testing that clearForm is called when handleSubmit receives Error message
      return addSubmissionError().then(() => {
        expect(Notifier.openSnackbar.mock.calls.length).toBe(1);
      });
    });
    // it("updates employerPickList on employerType change", () => {
    //   const event = { target: { value: "non-profit" } };
    //   wrapper = unconnectedSetup();
    //   let mockUpdateEmployersPicklist = jest.fn();
    //   wrapper.instance().updateEmployersPicklist = mockUpdateEmployersPicklist;
    //   const picklist = wrapper.find(`[name="employerType"]`).first();
    //   picklist.simulate("change", event);
    //   expect(mockUpdateEmployersPicklist).toHaveBeenCalled();
    // });
    // it("toggles signatureType", () => {
    //   wrapper = unconnectedSetup();
    //   wrapper.setProps({
    //     tab: 1
    //   });
    //   wrapper.update();
    //   expect(wrapper.instance().state.signatureType).toBe("draw");
    //   console.log('######################');
    //   console.log(wrapper.debug());
    //   wrapper
    //     .find(`[name="signatureType"]`)
    //     .first()
    //     .simulate("click");
    //   expect(wrapper.instance().state.signatureType).toBe("write");
    //   let mockToggle = jest.fn();
    //   wrapper.instance().toggleSignatureInputType = mockToggle;
    //   wrapper
    //     .find(`[name="signatureType"]`)
    //     .first()
    //     .simulate("click");
    //   expect(mockToggle).toHaveBeenCalled();
    // });
    it("provides error feedback after failed Submit", () => {
      // imported function that creates dummy data for form
      testData = generateSampleValidate();
      // test function that will count calls as well as return error object
      addSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_FAILURE" })
        );
      // replacing openSnackbar import with mock function
      Notifier.openSnackbar = jest.fn();
      // creating wrapper
      wrapper = unconnectedSetup();
      wrapper.setProps({
        tab: 2,
        reCaptchaRef: {
          current: {
            getValue: jest.fn().mockImplementation(() => "mock value")
          }
        },
        submission: { formPage1: { signature: "string" } }
      });
      wrapper.update();
      wrapper.instance().props.apiSubmission.addSubmission = addSubmissionError;
      // simulate signatureToggle to switch type to "write"
      // wrapper.find(`[name="signatureType"]`).simulate("click");
      // simulate submit with dummy data
      wrapper.find("ReduxForm").simulate("submit", { ...testData });
      // testing that submit was called
      expect(addSubmissionError.mock.calls.length).toBe(1);
      // testing that clearForm is called when handleSubmit receives Error message
      return addSubmissionError().then(() => {
        expect(Notifier.openSnackbar.mock.calls.length).toBe(1);
      });
    });
    it("provides error feedback after promise rejected", () => {
      // imported function that creates dummy data for form
      testData = generateSampleValidate();
      // test function that will count calls as well as return error object
      addSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_SF_EMPLOYERS_FAILURE" })
        );
    });

    it("opens snackbar if no recaptcha value found", () => {
      testData = generateSampleValidate();
      Notifier.openSnackbar = jest.fn();
      wrapper = unconnectedSetup();
      wrapper.setProps({ tab: 2 });
      wrapper.update();
      wrapper.instance().props.reCaptchaRef.current.getValue = jest
        .fn()
        .mockImplementation(() => null);
      wrapper.find("ReduxForm").simulate("submit", { ...testData });
      expect(Notifier.openSnackbar.mock.calls.length).toBe(1);
    });

    it("calls getSFEmployers on componentDidMount", () => {
      sfEmployerLookupSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
        );
      props = {
        handleSubmit: jest.fn(),
        apiSF: {
          getSFEmployers: sfEmployerLookupSuccess
        }
      };
      // creating wrapper
      wrapper = setup(props);
      // testing that getSFEmployers was called
      expect(sfEmployerLookupSuccess.mock.calls.length).toBe(1);
    });

    it("opens snackbar when employer search fails", () => {
      sfEmployerLookupFailure = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_SF_EMPLOYERS_FAILURE" })
        );
      props = {
        handleSubmit: jest.fn(),
        apiSF: {
          getSFEmployers: sfEmployerLookupFailure
        }
      };
      Notifier.openSnackbar = jest.fn();
      // creating wrapper
      wrapper = setup(props);
      // testing that submit was called
      expect(sfEmployerLookupFailure.mock.calls.length).toBe(1);
    });
  });
});
