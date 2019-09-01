import React from "react";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import "jest-canvas-mock";

import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import {
  generateSampleValidate,
  generateSubmissionBody
} from "../../../../app/utils/fieldConfigs";
import { SubmissionFormPage1Component } from "../../components/SubmissionFormPage1Component";
import * as formElements from "../../components/SubmissionFormElements";

import * as Notifier from "../../containers/Notifier";

// variables
let wrapper,
  store,
  handleSubmit,
  apiSubmission,
  apiSF = {},
  handleSubmitMock,
  handleErrorMock,
  addSubmission,
  addSubmissionSuccess,
  addSubmissionError,
  updateSubmissionSuccess,
  updateSubmissionError,
  createSFDJRSuccess,
  createSFOMASuccess,
  props,
  testData,
  tab,
  sfEmployerLookupSuccess,
  sfEmployerLookupFailure,
  handleUpload,
  loadEmployersPicklistMock,
  handleInputMock = jest.fn();

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
      signature: "string",
      paymentRequired: false
    },
    employerObjects: [
      {
        Name: "employer_name",
        Id: "123",
        Agency_Number__c: "456"
      }
    ],
    payment: {
      cardAddingUrl: ""
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
  tab,
  generateSubmissionBody: () => Promise.resolve({})
};

createSFDJRSuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" }));
createSFOMASuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "CREATE_SF_OMA_SUCCESS" }));

describe("Unconnected <SubmissionFormPage1 />", () => {
  // assigning handlesubmit as a callback so it can be passed form's onSubmit assignment or our own test function
  // gain access to touched and error to test validation
  // will assign our own test functions to replace action/reducers for apiSubmission prop
  beforeEach(() => {
    updateSubmissionSuccess = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
      );
    handleSubmit = fn => fn;
    handleErrorMock = jest.fn();
    apiSubmission = { updateSubmission: updateSubmissionSuccess };
    apiSF = {
      getSFEmployers: jest.fn(),
      createSFOMA: jest.fn()
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
  });

  // testing that we are triggering expected behavior for submit success and failure
  describe("submit functionality", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it("calls handleError if payment required but no payment method added", () => {
      updateSubmissionSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
        );
      testData = generateSampleValidate();
      addSubmissionSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
        );
      const props = {
        tab: 2,
        apiSubmission: {
          addSubmission: addSubmissionSuccess,
          updateSubmission: updateSubmissionSuccess
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentType: "Card",
            paymentMethodAdded: false
          },
          payment: {
            cardAddingUrl: ""
          }
        },
        handleError: handleErrorMock
      };
      wrapper = unconnectedSetup(props);

      const formValues = {
        paymentType: "Card",
        paymentMethodAdded: false
      };
      const values = { ...formValues, ...testData };
      wrapper.find("Connect(ReduxForm)").simulate("submit", { ...values });
      expect(handleErrorMock.mock.calls.length).toBe(1);
    });

    it("calls reset after successful submit", async function() {
      // imported function that creates dummy data for form
      testData = generateSampleValidate();
      // test function that will count calls as well as return success object
      updateSubmissionSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
        );
      // creating wrapper
      const props = {
        tab: 2,
        submission: {
          submissionId: "123",
          salesforceId: "456",
          formPage1: {
            paymentRequired: false
          },
          payment: {
            cardAddingUrl: ""
          }
        },
        formValues: {
          ...generateSubmissionBody
        },
        apiSubmission: {
          updateSubmission: updateSubmissionSuccess
        },
        apiSF: {
          createSFDJR: createSFDJRSuccess,
          createSFOMA: createSFOMASuccess
        },
        handleError: jest.fn(),
        reset: resetMock
      };
      wrapper = unconnectedSetup(props);

      // simulate submit with dummy data
      wrapper.find("Connect(ReduxForm)").simulate("submit", { ...testData });
      // testing that submit was called
      expect(updateSubmissionSuccess.mock.calls.length).toBe(1);
      // testing that reset is called when handleSubmit receives success message
      try {
        await updateSubmissionSuccess();
        await createSFDJRSuccess();
        await createSFOMASuccess();
        expect(resetMock.mock.calls.length).toBe(1);
      } catch (err) {
        console.log(err);
      }
    });

    it("errors if there is no signature", async function() {
      // imported function that creates dummy data for form
      testData = generateSampleValidate();
      // test function that will count calls as well as return success object
      updateSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SUBMISSION_FAILURE" })
        );

      // replacing openSnackbar import with mock function
      formElements.handleError = handleErrorMock;
      // creating wrapper
      const props = {
        tab: 2,
        apiSubmission: {
          updateSubmission: updateSubmissionError
        },
        handleError: handleErrorMock,
        apiSF: {
          createSFDJR: createSFDJRSuccess,
          createSFOMA: createSFOMASuccess
        }
      };
      wrapper = unconnectedSetup(props);

      delete testData.signature;
      // simulate submit with dummy data
      wrapper.find("Connect(ReduxForm)").simulate("submit", { ...testData });
      // testing that clearForm is called when handleSubmit receives Error message
      try {
        await updateSubmissionError();
        await createSFDJRSuccess();
        await createSFOMASuccess();
        expect(formElements.handleError.mock.calls.length).toBe(1);
      } catch (err) {
        console.log(err);
      }
    });

    it("provides error feedback after failed Submit", async function() {
      // imported function that creates dummy data for form
      testData = generateSampleValidate();
      // test function that will count calls as well as return error object
      updateSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SUBMISSION_FAILURE" })
        );

      // creating wrapper
      const props = {
        ...defaultProps,
        tab: 2,
        reCaptchaRef: {
          current: {
            getValue: jest.fn().mockImplementation(() => "mock value")
          }
        },
        apiSubmission: {
          updateSubmission: updateSubmissionError
        },
        apiSF: {
          createSFDJR: createSFDJRSuccess,
          createSFOMA: createSFOMASuccess
        },
        handleError: handleErrorMock
      };
      wrapper = unconnectedSetup(props);

      // simulate submit with dummy data
      wrapper.find("Connect(ReduxForm)").simulate("submit", { ...testData });
      // testing that submit was called
      expect(updateSubmissionError.mock.calls.length).toBe(1);
      // testing that openSnackbar is called when handleSubmit receives Error message
      try {
        await updateSubmissionError();
        expect(handleErrorMock.mock.calls.length).toBe(1);
      } catch (err) {
        console.log(err);
      }
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
        },
        formValues: {
          // to get code coverage for retiree edge cases
          employerType: "Retirees"
        }
      };
      // creating wrapper
      wrapper = setup(props);
      // testing that getSFEmployers was called
      expect(sfEmployerLookupSuccess.mock.calls.length).toBe(1);
    });

    it("calls loadEmployersPicklist on componentDidUpdate if employer list has not yet loaded", () => {
      sfEmployerLookupSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
        );
      loadEmployersPicklistMock = jest.fn();
      props = {
        submission: {
          employerNames: [""]
        },
        formValues: {
          // to get code coverage for community member edge cases
          employerType: "Community Member"
        },
        apiSF: {
          getSFEmployers: sfEmployerLookupSuccess
        }
      };
      // creating wrapper
      wrapper = unconnectedSetup(props);

      wrapper.instance().loadEmployersPicklist = loadEmployersPicklistMock;
      wrapper.instance().componentDidUpdate();

      // testing that loadEmployersPicklist was called
      expect(loadEmployersPicklistMock.mock.calls.length).toBe(1);
    });

    it("receives messages from unioni.se card adding iframe", () => {
      sfEmployerLookupSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
        );
      const fakeEvent = {
        data: {
          notification: {
            type: "success"
          }
        },
        origin: "https://lab.unioni.se"
      };
      let handleInputMock = jest.fn();
      const props = {
        formValues: {
          // to get code coverage for afh edge cases
          employerType: "Adult Foster Home"
        },
        apiSF: {
          getSFEmployers: sfEmployerLookupSuccess
        },
        apiSubmission: {
          handleInput: handleInputMock
        }
      };
      wrapper = unconnectedSetup(props);
      wrapper.instance().receiveMessage(fakeEvent);

      expect(handleInputMock.mock.calls[0][0]).toStrictEqual({
        target: { name: "paymentMethodAdded", value: true }
      });
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
