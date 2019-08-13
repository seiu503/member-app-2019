import React from "react";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";

import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import { generateSampleValidate } from "../../../../app/utils/fieldConfigs";
import { SubmissionFormPage1Component } from "../../components/SubmissionFormPage1Component";
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
  component,
  sfLookupError,
  sfEmployerLookupSuccess,
  sfEmployerLookupFailure,
  getSFEmployersSuccess,
  error,
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
  },
  reCaptchaRef: {
    current: {
      getValue: jest.fn().mockImplementation(() => "mock value")
    }
  },
  content: {},
  apiContent: {}
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
    apiSF = {};
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
  });

  // testing that we are triggering expected behavior for submit success and failure
  // describe("submit functionality", () => {
  //   it("calls handleSubmit on submit", () => {
  //     handleSubmitMock = jest.fn();
  //     handleSubmit = handleSubmitMock;

  //     // imported function that creates dummy data for form
  //     testData = generateSampleValidate();
  //     // test function that will count calls as well as return success object
  //     addSubmissionSuccess = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
  //       );

  //     sfEmployerLookupSuccess = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
  //       );

  //     props = {
  //       apiSF: {
  //         getSFEmployers: sfEmployerLookupSuccess
  //       },
  //       apiSubmission: {
  //         addSubmission: addSubmissionSuccess
  //       },
  //       tab: 2
  //     };

  //     wrapper = setup(props);
  //     console.dir(wrapper.instance().props);
  //     // wrapper.instance().props.apiSubmission = {
  //     //   addSubmission: addSubmissionSuccess
  //     // }
  //     component = wrapper.find("form");
  //     component.simulate("submit", { ...testData });
  //     expect(addSubmissionSuccess.mock.calls.length).toBe(1);
  //   });
  //   // it("calls reset after successful Submit", () => {
  //   //   // imported function that creates dummy data for form
  //   //   testData = generateSampleValidate();
  //   //   // test function that will count calls as well as return success object
  //   //   addSubmissionSuccess = jest
  //   //     .fn()
  //   //     .mockImplementation(() =>
  //   //       Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
  //   //     );

  //   //   // creating wrapper
  //   //   wrapper = unconnectedSetup();
  //   //   wrapper.instance().props.apiSubmission.addSubmission = addSubmissionSuccess;

  //   //   // simulate submit with dummy data
  //   //   wrapper.find("form").simulate("submit", { ...testData });
  //   //   // testing that submit was called
  //   //   expect(addSubmissionSuccess.mock.calls.length).toBe(1);
  //   //   // testing that reset is called when handleSubmit receives success message
  //   //   return addSubmissionSuccess().then(() => {
  //   //     expect(resetMock.mock.calls.length).toBe(1);
  //   //   });
  //   // });

  //   // it("provides error feedback after failed Submit", () => {
  //   //   // imported function that creates dummy data for form
  //   //   testData = generateSampleValidate();
  //   //   // test function that will count calls as well as return error object
  //   //   addSubmissionError = jest
  //   //     .fn()
  //   //     .mockImplementation(() =>
  //   //       Promise.resolve({ type: "ADD_SUBMISSION_FAILURE" })
  //   //     );
  //   //   // replacing openSnackbar import with mock function
  //   //   Notifier.openSnackbar = jest.fn();
  //   //   // replacing form prop functions and placing them in dispatch action object
  //   //   addSubmission = addSubmissionError;
  //   //   apiSubmission.addSubmission = addSubmission;
  //   //   // creating wrapper
  //   //   wrapper = unconnectedSetup();
  //   //   // simulate submit with dummy data
  //   //   wrapper.find("form").simulate("submit", { testData });
  //   //   // testing that submit was called
  //   //   expect(addSubmissionError.mock.calls.length).toBe(1);
  //   //   // testing that clearForm is called when handleSubmit receives Error message
  //   //   return addSubmissionError().then(() => {
  //   //     expect(Notifier.openSnackbar.mock.calls.length).toBe(1);
  //   //   });
  //   // });
  //   // it("provides error feedback after promise rejected", () => {
  //   //   // imported function that creates dummy data for form
  //   //   testData = generateSampleValidate();
  //   //   // test function that will count calls as well as return error object
  //   //   addSubmissionError = jest
  //   //     .fn()
  //   //     .mockImplementation(() =>
  //   //       Promise.reject({ type: "ADD_SUBMISSION_FAILURE" })
  //   //     );
  //   //   // replacing openSnackbar import with mock function
  //   //   Notifier.openSnackbar = jest.fn();
  //   //   // replacing form prop functions and placing them in dispatch action object
  //   //   addSubmission = addSubmissionError;
  //   //   apiSubmission.addSubmission = addSubmission;
  //   //   // creating wrapper
  //   //   wrapper = unconnectedSetup();
  //   //   // simulate submit with dummy data
  //   //   wrapper.find("form").simulate("submit", { testData });
  //   //   // testing that submit was called
  //   //   expect(addSubmissionError.mock.calls.length).toBe(1);
  //   //   // testing that clearForm is called when handleSubmit receives Error message
  //   //   addSubmissionError().then(() => {
  //   //     expect(Notifier.openSnackbar.mock.calls.length).toBe(1);
  //   //   });
  //   // });
  //   // it("updates employerPicklist on employerType change", () => {
  //   //   testData = generateSampleValidate();
  //   //   // test function that will count calls as well as return error object
  //   //   const updateEmployersPicklistMock = jest.fn();
  //   //   // creating wrapper
  //   //   sfEmployerLookupSuccess = jest
  //   //     .fn()
  //   //     .mockImplementation(() =>
  //   //       Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
  //   //     );
  //   //   props = {
  //   //     handleSubmit: jest.fn(),
  //   //     updateEmployersPicklist: updateEmployersPicklistMock,
  //   //     apiSF: {
  //   //       getSFEmployers: sfEmployerLookupSuccess
  //   //     }
  //   //   }
  //   //   wrapper = setup(props);
  //   //   wrapper.find(`[data-test="employer-type-test"]`).first().props().onChange({target:{value: ""}});
  //   //   // testing that submit was called
  //   //   expect(updateEmployersPicklistMock.mock.calls.length).toBe(1);
  //   // })
  // });

  describe("componentDidMount", () => {
    beforeEach(() => {
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
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("calls getSFEmployers on componentDidMount", () => {
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
