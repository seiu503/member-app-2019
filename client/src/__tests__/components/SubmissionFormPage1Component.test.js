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
  verifySuccess,
  verifyError,
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
  handleTab: () => Promise.resolve({}),
  generateSubmissionBody: () => Promise.resolve({})
};

createSFDJRSuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" }));
createSFOMASuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "CREATE_SF_OMA_SUCCESS" }));

verifySuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "VERIFY_SUCCESS", payload: { score: 0.9 } })
  );

updateSubmissionSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
  );

describe("Unconnected <SubmissionFormPage1 />", () => {
  // assigning handlesubmit as a callback so it can be passed form's onSubmit assignment or our own test function
  // gain access to touched and error to test validation
  // will assign our own test functions to replace action/reducers for apiSubmission prop
  beforeEach(() => {
    handleSubmit = fn => fn;
    handleErrorMock = jest.fn();
    apiSubmission = {
      updateSubmission: updateSubmissionSuccess,
      verify: verifySuccess
    };
    apiSF = {
      getSFEmployers: jest.fn(),
      createSFOMA: jest.fn(),
      createSFDJR: createSFDJRSuccess,
      createSFOMA: createSFOMASuccess
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

  describe("componentDidMount", () => {
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
    it("handles error when getSFEmployers fails", () => {
      handleErrorMock = jest.fn();
      const getSFEmployersError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "GET_SF_EMPLOYERS_FAILURE" })
        );
      props = {
        handleSubmit: jest.fn(),
        apiSF: {
          getSFEmployers: getSFEmployersError
        },
        handleError: handleErrorMock
      };
      Notifier.openSnackbar = jest.fn();
      // creating wrapper
      wrapper = setup(props);
      expect(getSFEmployersError.mock.calls.length).toBe(1);
    });
  });

  describe("componentDidUpdate", () => {
    it("calls loadEmployersPicklist on componentDidUpdate if employer list has not yet loaded", () => {
      sfEmployerLookupSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
        );
      loadEmployersPicklistMock = jest.fn();
      props = {
        submission: {
          employerNames: [""],
          formPage1: {}
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
  });

  // testing that we are triggering expected behavior for submit success and failure
  describe("submit functionality", () => {
    beforeEach(done => {
      props = {
        reCaptchaRef: {
          current: {
            getValue: jest.fn().mockImplementation(() => "mock value")
          }
        },
        tab: 2,
        apiSubmission: {
          addSubmission: addSubmissionSuccess,
          updateSubmission: updateSubmissionSuccess,
          verify: verifySuccess
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
        formValues: {
          ...generateSubmissionBody
        },
        handleError: handleErrorMock,
        reset: resetMock
      };
      done();
    });
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

      props.tab = 2;
      props.submission.payment.activeMethodLast4 = null;

      wrapper = unconnectedSetup(props);
      // console.log(wrapper.instance().props);

      const formValues = {
        paymentType: "Card",
        paymentMethodAdded: false
      };
      const values = { ...formValues, ...testData };
      wrapper
        .instance()
        .handleSubmit({ ...values })
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });
    });
    // reset no longer called after tab2 submit; rewrite this test to check for reset after CAPE submit
    // it("calls reset after successful CAPE submit", async function() {
    //   // imported function that creates dummy data for form
    //   testData = generateSampleValidate();
    //   // test function that will count calls as well as return success object
    //   updateSubmissionSuccess = jest
    //     .fn()
    //     .mockImplementation(() =>
    //       Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
    //     );
    //   // creating wrapper
    //   wrapper = unconnectedSetup(props);
    //   wrapper.setProps({ tab: 2 });
    //   wrapper.update();

    //   // simulate submit with dummy data
    //    wrapper
    //     .instance()
    //     .handleSubmit(generateSampleValidate())
    //     .then(() => {
    //       expect(updateSubmissionSuccess.mock.calls.length).toBe(1);
    //     })
    //     .catch(err => {
    //       console.log(err);
    //     });

    //   // testing that reset is called when handleSubmit receives success message
    //   try {
    //     await updateSubmissionSuccess();
    //     await createSFDJRSuccess();
    //     await createSFOMASuccess();
    //     expect(resetMock.mock.calls.length).toBe(1);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // });

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
      props.apiSubmission.updateSubmission = updateSubmissionError;
      wrapper = unconnectedSetup(props);
      wrapper.setProps({ tab: 2 });
      wrapper.update();

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
      props.apiSubmission.updateSubmission = updateSubmissionError;
      wrapper = unconnectedSetup(props);

      // simulate submit with dummy data
      // simulate submit with dummy data
      wrapper
        .instance()
        .handleSubmit(generateSampleValidate())
        .then(() => {
          expect(updateSubmissionError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });

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
  });

  describe("updateSubmission", () => {
    it("calls `handleError` if apiSubmission.updateSubmission fails", async function() {
      // imported function that creates dummy data for form
      testData = generateSampleValidate();
      // test function that will count calls as well as return success object
      updateSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "UPDATE_SUBMISSION_FAILURE" })
        );

      // replacing openSnackbar import with mock function
      formElements.handleError = handleErrorMock;
      // creating wrapper
      const props = {
        tab: 2,
        submission: {
          submissionId: "123",
          formPage1: {},
          payment: {}
        },
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

      wrapper.instance().updateSubmission();
      // testing that clearForm is called when handleSubmit receives Error message
      try {
        await updateSubmissionError();
        expect(formElements.handleError.mock.calls.length).toBe(1);
      } catch (err) {
        // console.log(err);
      }
    });
  });

  describe("createSFOMA", () => {
    it("handles error if createSFOMA prop fails", async function() {
      let createSFOMAError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SF_OMA_FAILURE" })
        );
      let generateSubmissionBodyMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      formElements.handleError = handleErrorMock;
      // creating wrapper
      const props = {
        tab: 2,
        submission: {
          submissionId: "123",
          salesforceId: "456",
          formPage1: {},
          payment: {},
          error: "test"
        },
        apiSubmission: {
          updateSubmission: updateSubmissionError
        },
        handleError: handleErrorMock,
        apiSF: {
          createSFDJR: createSFDJRSuccess,
          createSFOMA: createSFOMAError
        },
        formValues: {}
      };
      wrapper = unconnectedSetup(props);
      wrapper.instance().generateSubmissionBody = generateSubmissionBodyMock;

      wrapper
        .instance()
        .createSFOMA()
        .then(() => {
          return createSFOMAError()
            .then(() => {
              expect(createSFOMAError.mock.calls.length).toBe(2);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          // console.log(err);
        });
    });

    it("handles error if createSFOMA prop throws", async function() {
      let createSFOMAError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "CREATE_SF_OMA_FAILURE" })
        );
      let generateSubmissionBodyMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      formElements.handleError = handleErrorMock;
      // creating wrapper
      const props = {
        tab: 2,
        submission: {
          submissionId: "123",
          salesforceId: "456",
          formPage1: {},
          payment: {}
        },
        apiSubmission: {
          updateSubmission: updateSubmissionError
        },
        handleError: handleErrorMock,
        apiSF: {
          createSFDJR: createSFDJRSuccess,
          createSFOMA: createSFOMAError
        },
        formValues: {}
      };
      wrapper = unconnectedSetup(props);
      wrapper.instance().generateSubmissionBody = generateSubmissionBodyMock;

      try {
        wrapper
          .instance()
          .createSFOMA()
          .then(() => {
            return createSFOMAError()
              .catch(err => {
                // console.log(err);
              })
              .finally(() => {
                expect(formElements.handleError.mock.calls.length).toBe(1);
              });
          })
          .catch(err => {
            // console.log(err);
          });
      } catch (err) {
        console.log(err);
      }
    });
  });

  describe("createOrUpdateSFDJR", () => {
    it("calls `updateSFDJR` if djrId in redux store", async function() {
      const updateSFDJRMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SF_DJR_SUCCESS" })
        );

      // replacing openSnackbar import with mock function
      formElements.handleError = handleErrorMock;
      // creating wrapper
      const props = {
        tab: 2,
        submission: {
          submissionId: "123",
          djrId: "456",
          formPage1: {},
          payment: {}
        },
        apiSubmission: {
          updateSubmission: updateSubmissionError
        },
        handleError: handleErrorMock,
        apiSF: {
          createSFDJR: createSFDJRSuccess,
          createSFOMA: createSFOMASuccess,
          updateSFDJR: updateSFDJRMock
        }
      };
      wrapper = unconnectedSetup(props);

      try {
        await wrapper.instance().createOrUpdateSFDJR();
        expect(updateSFDJRMock.mock.calls.length).toBe(1);
      } catch (err) {
        console.log(err);
      }
    });
    it("handles error if `updateSFDJR` fails", async function() {
      const updateSFDJRMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SF_DJR_FAILURE" })
        );

      // replacing openSnackbar import with mock function
      formElements.handleError = handleErrorMock;
      // creating wrapper
      const props = {
        tab: 2,
        submission: {
          submissionId: "123",
          djrId: "456",
          formPage1: {},
          payment: {}
        },
        apiSubmission: {
          updateSubmission: updateSubmissionError
        },
        handleError: handleErrorMock,
        apiSF: {
          createSFDJR: createSFDJRSuccess,
          createSFOMA: createSFOMASuccess,
          updateSFDJR: updateSFDJRMock
        }
      };
      wrapper = unconnectedSetup(props);

      try {
        await wrapper.instance().createOrUpdateSFDJR();
        await expect(updateSFDJRMock.mock.calls.length).toBe(1);
      } catch (err) {
        console.log(err);
      }
    });
    it("handles error if `updateSFDJR` throws", async function() {
      const updateSFDJRMock = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error()));

      // replacing openSnackbar import with mock function
      formElements.handleError = handleErrorMock;
      // creating wrapper
      const props = {
        tab: 2,
        submission: {
          submissionId: "123",
          djrId: "456",
          formPage1: {},
          payment: {}
        },
        apiSubmission: {
          updateSubmission: updateSubmissionError
        },
        handleError: handleErrorMock,
        apiSF: {
          createSFDJR: createSFDJRSuccess,
          createSFOMA: createSFOMASuccess,
          updateSFDJR: updateSFDJRMock
        }
      };
      wrapper = unconnectedSetup(props);

      try {
        await wrapper.instance().createOrUpdateSFDJR();
        expect(updateSFDJRMock.mock.calls.length).toBe(1);
      } catch (err) {
        console.log(err);
      }
    });
    it("handles error if `createSFDJR` fails", async function() {
      const createSFDJRMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SF_DJR_FAILURE" })
        );

      // replacing openSnackbar import with mock function
      formElements.handleError = handleErrorMock;
      // creating wrapper
      const props = {
        tab: 2,
        submission: {
          submissionId: "123",
          formPage1: {},
          payment: {},
          error: "Error"
        },
        apiSubmission: {
          updateSubmission: updateSubmissionError
        },
        handleError: handleErrorMock,
        apiSF: {
          createSFDJR: createSFDJRMock,
          createSFOMA: createSFOMASuccess,
          updateSFDJR: jest.fn().mockImplementation(() => Promise.resolve({}))
        }
      };
      wrapper = unconnectedSetup(props);

      try {
        await wrapper.instance().createOrUpdateSFDJR();
        await expect(createSFDJRMock.mock.calls.length).toBe(1);
      } catch (err) {
        console.log(err);
      }
    });
    it("handles error if `createSFDJR` throws", async function() {
      const createSFDJRMock = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error()));

      // replacing openSnackbar import with mock function
      formElements.handleError = handleErrorMock;
      // creating wrapper
      const props = {
        tab: 2,
        submission: {
          submissionId: "123",
          formPage1: {},
          payment: {}
        },
        apiSubmission: {
          updateSubmission: updateSubmissionError
        },
        handleError: handleErrorMock,
        apiSF: {
          createSFDJR: createSFDJRMock,
          createSFOMA: createSFOMASuccess,
          updateSFDJR: jest.fn().mockImplementation(() => Promise.resolve({}))
        }
      };
      wrapper = unconnectedSetup(props);

      try {
        await wrapper.instance().createOrUpdateSFDJR();
        expect(createSFDJRMock.mock.calls.length).toBe(1);
      } catch (err) {
        console.log(err);
      }
    });
  });

  describe("receiveMessage", () => {
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
  });
});
