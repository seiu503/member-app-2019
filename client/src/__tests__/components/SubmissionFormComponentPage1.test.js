import React from "react";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";

import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import { generateSampleValidate } from "../../../../app/utils/fieldConfigs";
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
  handleSubmitSuccess,
  lookupSFContact,
  sfLookupSuccess,
  props,
  testData,
  sfLookupError,
  sfEmployerLookupSuccess,
  sfEmployerLookupFailure,
  error,
  touched;

let resetMock = jest.fn();

const initialState = {
  ...INITIAL_STATE,
  appState: {
    loading: false,
    error: ""
  },
  formValues: {
    mm: "",
    onlineCampaignSource: null
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
      homeEmail: ""
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
  }
};

describe("Unconnected <SubmissionFormPage1 />", () => {
  // assigning handlesubmit as a callback so it can be passed form's onSubmit assignment or our own test function
  // gain access to touched and error to test validation
  // will assign our own test functions to replace action/reducers for apiSubmission prop
  beforeEach(() => {
    touched = false;
    error = null;
    handleSubmit = jest.fn();
    apiSubmission = {};
    apiSF = {};
  });

  // create wrapper with default props and assigned values from above as props
  const unconnectedSetup = () => {
    const setUpProps = { ...defaultProps, handleSubmit, apiSubmission, apiSF };
    return shallow(<SubmissionFormPage1Component {...setUpProps} />);
  };

  store = storeFactory(initialState);
  const setup = props => {
    return mount(
      <Provider store={store}>
        <SubmissionFormWrap {...defaultProps} {...props} />
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
    it("calls handleSubmit on submit", () => {
      wrapper.instance().handleSubmit = handleSubmit;
      wrapper.instance().simulate("handleSubmit");
      expect(handleSubmitMock.mock.calls.length).toBe(1);
    });
  });

  // testing that we are triggering expected behavior for submit success and failure
  describe("submit functionality", () => {
    it("calls reset after successful Submit", () => {
      // imported function that creates dummy data for form
      testData = generateSampleValidate();
      // test function that will count calls as well as return success object
      handleSubmitSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
        );

      sfLookupSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "LOOKUP_SF_CONTACT_SUCCESS" })
        );

      // creating wrapper
      wrapper = unconnectedSetup();

      wrapper.instance().props.apiSubmission.addSubmission = handleSubmitSuccess;
      wrapper.instance().props.apiSF.lookupSFContact = sfLookupSuccess;

      // simulate submit with dummy data
      wrapper.find("form").simulate("submit", { testData });
      // testing that submit was called
      expect(sfLookupSuccess.mock.calls.length).toBe(1);
      // testing that reset is called when handleSubmit receives success message
      return sfLookupSuccess().then(() => {
        expect(resetMock.mock.calls.length).toBe(1);
      });
    });

    it("provides error feedback after failed Submit", () => {
      // imported function that creates dummy data for form
      testData = generateSampleValidate();
      // test function that will count calls as well as return error object
      sfLookupError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "LOOKUP_SF_CONTACT_FAILURE" })
        );
      // replacing openSnackbar import with mock function
      Notifier.openSnackbar = jest.fn();
      // replacing form prop functions and placing them in dispatch action object
      lookupSFContact = sfLookupError;
      apiSF.lookupSFContact = lookupSFContact;
      // creating wrapper
      wrapper = unconnectedSetup();
      // simulate submit with dummy data
      wrapper.find("form").simulate("submit", { testData });
      // testing that submit was called
      expect(sfLookupError.mock.calls.length).toBe(1);
      // testing that clearForm is called when handleSubmit receives Error message
      return sfLookupError().then(() => {
        expect(Notifier.openSnackbar.mock.calls.length).toBe(1);
      });
    });
    it("provides error feedback after promise rejected", () => {
      // imported function that creates dummy data for form
      testData = generateSampleValidate();
      // test function that will count calls as well as return error object
      sfLookupError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "LOOKUP_SF_CONTACT_FAILURE" })
        );
      // replacing openSnackbar import with mock function
      Notifier.openSnackbar = jest.fn();
      // replacing form prop functions and placing them in dispatch action object
      lookupSFContact = sfLookupError;
      apiSF.lookupSFContact = lookupSFContact;
      // creating wrapper
      wrapper = unconnectedSetup();
      // simulate submit with dummy data
      wrapper.find("form").simulate("submit", { testData });
      // testing that submit was called
      expect(sfLookupError.mock.calls.length).toBe(1);
      // testing that clearForm is called when handleSubmit receives Error message
      sfLookupError().then(() => {
        expect(Notifier.openSnackbar.mock.calls.length).toBe(1);
      });
    });
    // it("updates employerPicklist on employerType change", () => {
    //   testData = generateSampleValidate();
    //   // test function that will count calls as well as return error object
    //   const updateEmployersPicklistMock = jest.fn();
    //   // creating wrapper
    //   sfEmployerLookupSuccess = jest
    //     .fn()
    //     .mockImplementation(() =>
    //       Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
    //     );
    //   props = {
    //     handleSubmit: jest.fn(),
    //     updateEmployersPicklist: updateEmployersPicklistMock,
    //     apiSF: {
    //       getSFEmployers: sfEmployerLookupSuccess
    //     }
    //   }
    //   wrapper = setup(props);
    //   wrapper.find(`[data-test="employer-type-test"]`).first().props().onChange({target:{value: ""}});
    //   // testing that submit was called
    //   expect(updateEmployersPicklistMock.mock.calls.length).toBe(1);
    // })
  });

  describe("componentDidMount", () => {
    sfEmployerLookupSuccess = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
      );
    sfEmployerLookupFailure = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "GET_SF_EMPLOYERS_FAILURE" })
      );
    it("calls getSFEmployers on componentDidMount", () => {
      props = {
        handleSubmit: jest.fn(),
        apiSF: {
          getSFEmployers: sfEmployerLookupSuccess
        }
      };
      // creating wrapper
      wrapper = setup(props);
      // testing that submit was called
      expect(sfEmployerLookupSuccess.mock.calls.length).toBe(1);
    });

    it("opens snackbar when employer search failes", () => {
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
