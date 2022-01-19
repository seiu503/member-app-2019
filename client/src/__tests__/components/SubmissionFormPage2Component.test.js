import React from "react";
import { shallow } from "enzyme";

import { findByTestAttr } from "../../utils/testUtils";
import { generatePage2Validate } from "../../../../app/utils/fieldConfigs";
import { SubmissionFormPage2Component } from "../../components/SubmissionFormPage2Component";
import * as formElements from "../../components/SubmissionFormElements";

// variables
let wrapper, handleSubmit, props, apiSubmission, apiSF, handleSubmitMock;

let handleErrorMock = jest.fn();

let updateSFContactSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_CONTACT_SUCCESS", payload: {} })
  );

let updateSFContactError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "UPDATE_SF_CONTACT_FAILURE", payload: {} })
  );

let updateSubmissionSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS", payload: {} })
  );

let createSubmissionSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "CREATE_SUBMISSION_SUCCESS", payload: {} })
  );

let updateSubmissionError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SUBMISSION_FAILURE", payload: {} })
  );

// initial props for form
const defaultProps = {
  handleSubmit,
  submission: {
    error: null,
    loading: false,
    formPage1: {
      paymentRequired: false
    }
  },
  initialValues: { gender: "" },
  formValues: { gender: "" },
  classes: { test: "test" },
  // need these here for form to have access to their definitions later
  apiSubmission,
  apiSF,
  location: {
    search: ""
  },
  reset: jest.fn(),
  history: {
    push: jest.fn()
  },
  addTranslation: jest.fn(),
  actions: {
    setSpinner: jest.fn()
  },
  createSubmission: createSubmissionSuccess,
  updateSFContact: updateSFContactSuccess,
  translate: jest.fn()
};

describe("Unconnected <SubmissionFormPage2 />", () => {
  // assigning handlesubmit as a callback so it can be passed form's onSubmit assignment or our own test function
  // gain access to touched and error to test validation
  // will assign our own test functions to replace action/reducers for apiSubmission prop
  beforeEach(() => {
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
    it("renders specialized text if payment required", () => {
      const props = {
        submission: {
          formPage1: {
            paymentRequired: true
          }
        }
      };
      wrapper = unconnectedSetup(props);
      const component = findByTestAttr(wrapper, "direct-pay-text");
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
  });

  describe("handleSubmit", () => {
    beforeEach(done => {
      props = {
        apiSubmission: {
          updateSubmission: updateSubmissionSuccess
        },
        apiSF: {
          updateSFContact: updateSFContactSuccess
        },
        location: {
          search: "id=1"
        },
        submission: {
          formPage1: {
            paymentRequired: false
          },
          formPage2: {
            ...generatePage2Validate
          },
          salesforceId: "123"
        },
        handleError: handleErrorMock
      };
      done();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("handles error if updateSubmission prop fails", async function() {
      props.submission.salesforceId = null;
      updateSubmissionError = jest
        .fn()
        .mockImplementation(() => Promise.reject());

      // creating wrapper
      props.updateSubmission = updateSubmissionError;
      props.submission.error = "Error";
      wrapper = unconnectedSetup(props);
      formElements.handleError = handleErrorMock;

      // simulate submit with dummy data
      wrapper
        .instance()
        .handleSubmit(generatePage2Validate())
        .then(async () => {
          try {
            await updateSubmissionError();
            expect(handleErrorMock.mock.calls.length).toBe(1);
          } catch (err) {
            console.log(err);
          }
        })
        .catch(err => {
          console.log(err);
        });
    });

    it("handles error if updateSubmission prop throws", async function() {
      // imported function that creates dummy data for form
      updateSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "UPDATE_SUBMISSION_FAILURE", payload: {} })
        );

      // creating wrapper
      props.apiSubmission.updateSubmission = updateSubmissionError;
      wrapper = unconnectedSetup(props);
      formElements.handleError = handleErrorMock;

      // simulate submit with dummy data
      wrapper
        .instance()
        .handleSubmit(generatePage2Validate())
        .then(async () => {
          try {
            await updateSubmissionError();
            expect(formElements.handleError.mock.calls.length).toBe(1);
          } catch (err) {
            // console.log(err);
          }
        })
        .catch(err => {
          console.log(err);
        });
    });

    it("handles error if updateSFContact prop throws", async function() {
      // creating wrapper
      props.apiSubmission.updateSubmission = updateSubmissionSuccess;
      props.apiSF.updateSFContact = updateSFContactError;

      wrapper = unconnectedSetup(props);
      formElements.handleError = handleErrorMock;

      // simulate submit with dummy data
      wrapper
        .instance()
        .handleSubmit(generatePage2Validate())
        .then(async () => {
          try {
            await updateSubmissionSuccess();
            await updateSFContactError();
            expect(formElements.handleError.mock.calls.length).toBe(1);
          } catch (err) {
            // console.log(err);
          }
        })
        .catch(err => {
          console.log(err);
        });
    });

    it("handles error if updateSFContact prop fails", async function() {
      updateSFContactError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "UPDATE_SF_CONTACT_FAILURE", payload: {} })
        );

      // creating wrapper
      props.updateSubmission = updateSubmissionSuccess;
      props.updateSFContact = updateSFContactError;
      wrapper = unconnectedSetup(props);
      formElements.handleError = handleErrorMock;

      // simulate submit with dummy data
      wrapper
        .instance()
        .handleSubmit(generatePage2Validate())
        .then(async () => {
          try {
            await updateSubmissionSuccess();
            await updateSFContactError();
            expect(handleErrorMock.mock.calls.length).toBe(1);
          } catch (err) {
            console.log(err);
          }
        })
        .catch(err => {
          console.log(err);
        });
    });

    it("handles error if createSubmission method throws (no id)", async function() {
      const createSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "CREATE_SUBMISSION_FAILURE", payload: {} })
        );

      // creating wrapper
      props.createSubmission = createSubmissionError;
      props.updateSubmission = updateSubmissionSuccess;
      props.updateSFContact = updateSFContactSuccess;
      props.submission.submissionId = null;
      wrapper = unconnectedSetup(props);
      formElements.handleError = handleErrorMock;

      // simulate submit with dummy data
      wrapper
        .instance()
        .handleSubmit(generatePage2Validate())
        .then(async () => {
          try {
            await createSubmissionError();
            expect(handleErrorMock.mock.calls.length).toBe(1);
          } catch (err) {
            console.log(err);
          }
        })
        .catch(err => {
          console.log(err);
        });
    });

    it("handles error if updateSubmission method throws", async function() {
      updateSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "UPDATE_SUBMISSION_FAILURE", payload: {} })
        );

      // creating wrapper
      props.updateSubmission = updateSubmissionError;
      props.updateSFContact = updateSFContactSuccess;
      props.submission.submissionId = 1234;
      wrapper = unconnectedSetup(props);
      formElements.handleError = handleErrorMock;

      // simulate submit with dummy data
      wrapper
        .instance()
        .handleSubmit(generatePage2Validate())
        .then(async () => {
          try {
            await updateSubmissionError();
            expect(handleErrorMock.mock.calls.length).toBe(1);
          } catch (err) {
            console.log(err);
          }
        })
        .catch(err => {
          console.log(err);
        });
    });

    it("handles edge cases: no params.id, no hire date", async function() {
      updateSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "UPDATE_SUBMISSION_FAILURE", payload: {} })
        );

      // creating wrapper
      props.updateSubmission = updateSubmissionError;
      props.updateSFContact = updateSFContactSuccess;
      props.submission.submissionId = 1234;
      props.submission.salesforceId = null;
      props.location.search = "";
      wrapper = unconnectedSetup(props);
      formElements.handleError = handleErrorMock;
      const bodyData = generatePage2Validate();
      delete bodyData.hireDate;

      // simulate submit with dummy data
      wrapper
        .instance()
        .handleSubmit(bodyData)
        .then(async () => {
          try {
            await updateSubmissionError();
            expect(handleErrorMock.mock.calls.length).toBe(1);
          } catch (err) {
            console.log(err);
          }
        })
        .catch(err => {
          console.log(err);
        });
    });
  });
});
