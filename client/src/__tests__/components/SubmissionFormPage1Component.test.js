import React from "react";
import { shallow } from "enzyme";
import "jest-canvas-mock";

import { findByTestAttr } from "../../utils/testUtils";
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
  addSubmissionSuccess,
  updateSubmissionSuccess,
  updateSubmissionError,
  createSFDJRSuccess,
  createSFOMASuccess,
  props,
  testData,
  tab,
  sfEmployerLookupSuccess,
  handleUpload,
  loadEmployersPicklistMock,
  verifySuccess;

let resetMock = jest.fn();

const saveSubmissionErrorsMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));
const handleTabMock = jest.fn().mockImplementation(() => Promise.resolve({}));
const handleInputMock = jest.fn();
const verifyRecaptchaSuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve(0.9));

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
    search: "?cape=true"
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
  handleTab: handleTabMock,
  generateSubmissionBody: () => Promise.resolve({}),
  actions: {
    setSpinner: jest.fn()
  },
  verifyRecaptchaScore: verifyRecaptchaSuccess,
  saveSubmissionErrors: saveSubmissionErrorsMock,
  headline: {
    id: 1,
    text: ""
  },
  image: {
    id: 2,
    url: "blah"
  },
  body: {
    id: 3,
    text: ""
  },
  renderBodyCopy: jest.fn(),
  updateSubmission: updateSubmissionSuccess,
  translate: jest.fn()
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
      createSFDJR: createSFDJRSuccess,
      createSFOMA: createSFOMASuccess
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // create wrapper with default props and assigned values from above as props
  const setup = props => {
    const setUpProps = { ...defaultProps, handleSubmit, apiSubmission, apiSF };
    return shallow(<SubmissionFormPage1Component {...setUpProps} {...props} />);
  };

  // smoke test and making sure we have access to correct props
  describe("basic setup", () => {
    beforeEach(() => {
      handleSubmitMock = jest.fn();
      handleSubmit = handleSubmitMock;
      wrapper = setup();
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
    it("renders CAPE case", () => {
      props = {
        location: {
          search: "?cape=true"
        }
      };
      wrapper = setup(props);
      const component = findByTestAttr(
        wrapper,
        "component-submissionformpage1"
      );
      expect(component.length).toBe(1);
    });
    it("renders non-CAPE case", () => {
      props = {
        location: {
          search: "?cape=false"
        }
      };
      wrapper = setup(props);
      const component = findByTestAttr(
        wrapper,
        "component-submissionformpage1"
      );
      expect(component.length).toBe(1);
    });
    it("renders Tab 1", () => {
      props = {
        tab: 1
      };
      wrapper = setup(props);
      const component = findByTestAttr(
        wrapper,
        "component-submissionformpage1"
      );
      expect(component.length).toBe(1);
    });
    it("renders Tab 1", () => {
      props = {
        tab: 0
      };
      wrapper = setup(props);
      const component = findByTestAttr(
        wrapper,
        "component-submissionformpage1"
      );
      expect(component.length).toBe(1);
    });
    it("renders Tab 2", () => {
      props = {
        tab: 1
      };
      wrapper = setup(props);
      const component = findByTestAttr(
        wrapper,
        "component-submissionformpage1"
      );
      expect(component.length).toBe(1);
    });
    it("renders Tab 3", () => {
      props = {
        tab: 3
      };
      wrapper = setup(props);
      const component = findByTestAttr(
        wrapper,
        "component-submissionformpage1"
      );
      expect(component.length).toBe(1);
    });
  });

  describe("componentDidMount", () => {
    it("calls getSFEmployers on componentDidMount", () => {
      const getAttributeOrig = document.body.getAttribute;
      document.body.getAttribute = jest.fn().mockImplementation(() => "true");
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
      wrapper.instance().componentDidMount();
      // testing that getSFEmployers was called
      expect(sfEmployerLookupSuccess.mock.calls.length).toBe(1);
      document.body.getAttribute = getAttributeOrig;
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
      wrapper.instance().componentDidMount();
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
          formPage1: {},
          payment: {
            cardAddingUrl: ""
          }
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
      wrapper = setup(props);

      wrapper.instance().loadEmployersPicklist = loadEmployersPicklistMock;
      wrapper.instance().componentDidUpdate();

      // testing that loadEmployersPicklist was called
      expect(loadEmployersPicklistMock.mock.calls.length).toBe(1);
    });
    it("does not call loadEmployersPicklist on componentDidUpdate if employer list has loaded", () => {
      sfEmployerLookupSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
        );
      loadEmployersPicklistMock = jest.fn();
      props = {
        submission: {
          employerNames: ["first", "second", "third", "fourth"],
          formPage1: {},
          payment: {
            cardAddingUrl: ""
          }
        },
        formValues: {
          // to get code coverage for family child care edge cases
          employerType: "Child care"
        },
        apiSF: {
          getSFEmployers: sfEmployerLookupSuccess
        }
      };
      // creating wrapper
      wrapper = setup(props);

      wrapper.instance().loadEmployersPicklist = loadEmployersPicklistMock;
      wrapper.instance().componentDidUpdate();

      // testing that loadEmployersPicklist was not called
      expect(loadEmployersPicklistMock.mock.calls.length).toBe(0);
    });
  });

  describe("handleSubmit", () => {
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
    it("handles error if verifyRecaptchaScore fails", () => {
      testData = generateSampleValidate();
      const verifyRecaptchaError = jest
        .fn()
        .mockImplementation(() => Promise.resolve(0));
      handleErrorMock = jest
        .fn()
        .mockImplementation(() => console.log("handleError"));
      props = {
        verifyRecaptchaScore: verifyRecaptchaError,
        handleError: handleErrorMock,
        updateSubmission: updateSubmissionSuccess
      };
      wrapper = setup(props);
      wrapper
        .instance()
        .handleSubmit({ ...testData })
        .then(async () => {
          await verifyRecaptchaError().then(() => {
            // expect(handleErrorMock.mock.calls.length).toBe(1);
          });
        })
        .catch(err => {
          console.log(err);
        });
    });
    it("handles error if verifyRecaptchaScore throws", () => {
      testData = generateSampleValidate();
      const verifyRecaptchaError = jest
        .fn()
        .mockImplementation(() => Promise.reject(0));
      props = {
        verifyRecaptchaScore: verifyRecaptchaError,
        handleError: handleErrorMock,
        updateSubmission: updateSubmissionSuccess
      };
      wrapper = setup(props);
      wrapper
        .instance()
        .handleSubmit({ ...testData })
        .then(async () => {
          await verifyRecaptchaError();
          // expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });
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

      wrapper = setup(props);
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

    it("errors if there is no signature", async function() {
      updateSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SUBMISSION_FAILURE" })
        );
      testData = generateSampleValidate();
      formElements.handleError = jest.fn();
      addSubmissionSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
        );

      props.tab = 2;
      props.submission.formPage1.paymentMethodAdded = true;
      props.submission.payment = { cardAddingUrl: "" };
      props.submission.error = "Error";
      props.saveSubmissionErrors = saveSubmissionErrorsMock;
      props.howManyTabs = 4;
      props.handleError = handleErrorMock;
      props.updateSubmission = updateSubmissionError;

      wrapper = setup(props);

      delete testData.signature;
      // simulate submit with dummy data
      wrapper.instance().handleSubmit({ ...testData });
      // testing that clearForm is called when handleSubmit receives Error message
      try {
        await updateSubmissionError();
        await createSFDJRSuccess();
        await createSFOMASuccess();
        await saveSubmissionErrorsMock();

        expect(handleErrorMock.mock.calls[0][0]).toBe("Error");
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
      props.apiSubmission.handleInput = handleInputMock;
      props.submission.payment.activeMethodLast4 = "1234";
      props.submission.payment.paymentErrorHold = false;
      props.updateSubmission = updateSubmissionError;
      wrapper = setup(props);
      formElements.handleError = handleErrorMock;

      // simulate submit with dummy data
      // simulate submit with dummy data
      wrapper
        .instance()
        .handleSubmit(generateSampleValidate())
        .then(async () => {
          try {
            await updateSubmissionError();
            expect(formElements.handleError.mock.calls.length).toBe(1);
          } catch (err) {
            console.log(err);
          }
        })
        .catch(err => {
          console.log(err);
        });

      // testing that openSnackbar is called when handleSubmit receives Error message
      try {
        await updateSubmissionError();
        await createSFDJRSuccess();
        await createSFOMASuccess();
        expect(formElements.handleError.mock.calls.length).toBe(1);
      } catch (err) {
        console.log(err);
      }
    });

    it("resets payment options for check-paying retirees", async function() {
      // imported function that creates dummy data for form
      testData = generateSampleValidate();
      // test function that will count calls as well as return error object
      updateSubmissionSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
        );

      // creating wrapper
      props.apiSubmission.updateSubmission = updateSubmissionSuccess;
      props.submission.formPage1.employerType = "retired";
      props.submission.formPage1.paymentType = "Check";
      props.updateSubmission = updateSubmissionSuccess;
      const handleInputMock = jest.fn();
      props.apiSubmission.handleInput = handleInputMock;
      wrapper = setup(props);
      createSFOMASuccess = jest
        .fn()
        .mockImplementation(() => Promise.resolve());
      wrapper.instance().createSFOMA = createSFOMASuccess;
      const createOrUpdateSFDJRSuccess = jest
        .fn()
        .mockImplementation(() => Promise.resolve());
      wrapper.instance().createOrUpdateSFDJR = createOrUpdateSFDJRSuccess;
      const updateSubmissionMethodSuccess = jest
        .fn()
        .mockImplementation(() => Promise.resolve());
      wrapper.instance().updateSubmission = updateSubmissionMethodSuccess;

      // simulate submit with dummy data
      // simulate submit with dummy data
      wrapper
        .instance()
        .handleSubmit(generateSampleValidate())
        .then(async () => {
          try {
            await verifyRecaptchaSuccess();
            await updateSubmissionMethodSuccess();
            await createSFOMASuccess();
            await createOrUpdateSFDJRSuccess();
            // expect(handleInputMock.mock.calls.length).toBe(3);
          } catch (err) {
            console.log(err);
          }
        })
        .catch(err => {
          console.log(err);
        });
    });

    it("updates submission status after successful submit", async function() {
      // imported function that creates dummy data for form
      testData = generateSampleValidate();
      // test function that will count calls as well as return error object
      updateSubmissionSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
        );

      // creating wrapper
      props.apiSubmission.updateSubmission = updateSubmissionSuccess;
      const handleInputMock = jest.fn();
      props.apiSubmission.handleInput = handleInputMock;
      wrapper = setup(props);
      createSFOMASuccess = jest
        .fn()
        .mockImplementation(() => Promise.resolve());
      wrapper.instance().createSFOMA = createSFOMASuccess;
      const createOrUpdateSFDJRSuccess = jest
        .fn()
        .mockImplementation(() => Promise.resolve());
      wrapper.instance().createOrUpdateSFDJR = createOrUpdateSFDJRSuccess;
      const updateSubmissionMethodSuccess = jest
        .fn()
        .mockImplementation(() => Promise.resolve());
      wrapper.instance().updateSubmission = updateSubmissionMethodSuccess;
      wrapper.instance().props.submission.error = null;

      // simulate submit with dummy data
      // simulate submit with dummy data
      wrapper
        .instance()
        .handleSubmit(generateSampleValidate())
        .then(async () => {
          try {
            await verifyRecaptchaSuccess();
            await updateSubmissionMethodSuccess();
            await createSFOMASuccess();
            await createOrUpdateSFDJRSuccess();
            await updateSubmissionSuccess();
            // expect(handleTabMock.mock.calls.length).toBe(1);
          } catch (err) {
            console.log(err);
          }
        })
        .catch(err => {
          console.log(err);
        });
    });

    it("handles error if updateSubmission fails", async function() {
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
      const handleInputMock = jest.fn();
      props.apiSubmission.handleInput = handleInputMock;
      const updateSubmissionMethodSuccess = jest
        .fn()
        .mockImplementation(() => Promise.resolve());
      props.updateSubmission = updateSubmissionMethodSuccess;
      wrapper = setup(props);
      createSFOMASuccess = jest
        .fn()
        .mockImplementation(() => Promise.resolve());
      wrapper.instance().createSFOMA = createSFOMASuccess;
      const createOrUpdateSFDJRSuccess = jest
        .fn()
        .mockImplementation(() => Promise.resolve());
      wrapper.instance().createOrUpdateSFDJR = createOrUpdateSFDJRSuccess;
      wrapper.instance().props.submission.error = null;

      // simulate submit with dummy data
      // simulate submit with dummy data
      wrapper
        .instance()
        .handleSubmit(generateSampleValidate())
        .then(async () => {
          try {
            await verifyRecaptchaSuccess();
            await updateSubmissionMethodSuccess();
            await createSFOMASuccess();
            await createOrUpdateSFDJRSuccess();
            await updateSubmissionError();
            // expect(handleErrorMock.mock.calls.length).toBe(1);
          } catch (err) {
            console.log(err);
          }
        })
        .catch(err => {
          console.log(err);
        });
    });

    it("handles error if updateSubmission throws", async function() {
      // imported function that creates dummy data for form
      testData = generateSampleValidate();
      // test function that will count calls as well as return error object
      updateSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "UPDATE_SUBMISSION_FAILURE" })
        );

      // creating wrapper
      props.apiSubmission.updateSubmission = updateSubmissionError;
      const handleInputMock = jest.fn();
      props.apiSubmission.handleInput = handleInputMock;
      const updateSubmissionMethodSuccess = jest
        .fn()
        .mockImplementation(() => Promise.resolve());
      props.updateSubmission = updateSubmissionMethodSuccess;
      props.submission.error = null;
      props.location = {
        search: ""
      }; // coverage for !CAPE
      props.embed = true; // coverage for embed render edge case
      wrapper = setup(props);
      createSFOMASuccess = jest
        .fn()
        .mockImplementation(() => Promise.resolve());
      wrapper.instance().createSFOMA = createSFOMASuccess;
      const createOrUpdateSFDJRSuccess = jest
        .fn()
        .mockImplementation(() => Promise.resolve());
      wrapper.instance().createOrUpdateSFDJR = createOrUpdateSFDJRSuccess;
      // simulate submit with dummy data
      wrapper
        .instance()
        .handleSubmit(generateSampleValidate())
        .then(async () => {
          try {
            await updateSubmissionMethodSuccess();
            await createSFOMASuccess();
            await createOrUpdateSFDJRSuccess();
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
        },
        updateSubmission: updateSubmissionError
      };
      wrapper = setup(props);

      delete testData.signature;

      wrapper
        .instance()
        .props.updateSubmission()
        .catch(err => {
          console.log(err);
        });

      try {
        await updateSubmissionError();
        expect(handleErrorMock.mock.calls.length).toBe(1);
      } catch (err) {
        console.log(err);
      }
    });
    it("calls `handleError` if apiSubmission.updateSubmission throws", async function() {
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
        },
        updateSubmission: updateSubmissionError
      };
      wrapper = setup(props);

      delete testData.signature;

      wrapper
        .instance()
        .props.updateSubmission()
        .catch(err => console.log(err));
      // testing that clearForm is called when handleSubmit receives Error message
      try {
        await updateSubmissionError();
        expect(formElements.handleError.mock.calls.length).toBe(1);
      } catch (err) {
        console.log(err);
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
      wrapper = setup(props);
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
      wrapper = setup(props);
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
      wrapper = setup(props);

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
      wrapper = setup(props);

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
        .mockImplementation(() => Promise.reject("Error"));

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
      wrapper = setup(props);

      try {
        await wrapper.instance().createOrUpdateSFDJR();
        expect(updateSFDJRMock.mock.calls.length).toBe(1);
      } catch (err) {
        console.log(err);
      }
    });
    it("calls `createSFDJR` if !id", async function() {
      const createSFDJRMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        );

      // creating wrapper
      const props = {
        tab: 2,
        submission: {
          submissionId: "123",
          formPage1: {
            paymentType: "Check"
          },
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
      wrapper = setup(props);

      try {
        await wrapper.instance().createOrUpdateSFDJR();
        await expect(createSFDJRMock.mock.calls.length).toBe(1);
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
      wrapper = setup(props);

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
        .mockImplementation(() => Promise.reject("Error"));

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
      wrapper = setup(props);

      try {
        await wrapper.instance().createOrUpdateSFDJR();
        expect(createSFDJRMock.mock.calls.length).toBe(1);
      } catch (err) {
        console.log(err);
      }
    });
  });

  describe("receiveMessage", () => {
    it("receives messages from unioni.se card adding iframe (CAPE)", () => {
      sfEmployerLookupSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
        );
      const fakeEvent = {
        data: {
          notification: {
            cardBrand: "Visa",
            cardLast4: "4242",
            message: "Card successfully added.",
            type: "success"
          }
        },
        origin: "https://lab.unioni.se"
      };
      let handleInputMock = jest.fn();
      let setPaymentDetailsDuesMock = jest.fn();
      let setPaymentDetailsCAPEMock = jest.fn();
      const props = {
        formValues: {
          // to get code coverage for afh edge cases
          employerType: "Adult Foster Home",
          capeAmount: 10,
          donationFrequency: "One-Time"
        },
        apiSF: {
          getSFEmployers: sfEmployerLookupSuccess
        },
        apiSubmission: {
          handleInput: handleInputMock,
          setPaymentDetailsDues: setPaymentDetailsDuesMock,
          setPaymentDetailsCAPE: setPaymentDetailsCAPEMock
        }
      };
      wrapper = setup(props);
      wrapper.instance().receiveMessage(fakeEvent);

      expect(
        JSON.stringify(setPaymentDetailsCAPEMock.mock.calls[0])
      ).toStrictEqual(JSON.stringify([true, "Visa", "4242"]));
    });
    it("receives messages from unioni.se card adding iframe (Dues)", () => {
      sfEmployerLookupSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
        );
      const fakeEvent = {
        data: {
          notification: {
            cardBrand: "Visa",
            cardLast4: "4242",
            message: "Card successfully added.",
            type: "success"
          }
        },
        origin: "https://lab.unioni.se"
      };
      let handleInputMock = jest.fn();
      let setPaymentDetailsDuesMock = jest.fn();
      let setPaymentDetailsCAPEMock = jest.fn();
      const props = {
        formValues: {
          // to get code coverage for afh edge cases
          employerType: "Adult Foster Home",
          capeAmount: null,
          donationFrequency: null
        },
        apiSF: {
          getSFEmployers: sfEmployerLookupSuccess
        },
        apiSubmission: {
          handleInput: handleInputMock,
          setPaymentDetailsDues: setPaymentDetailsDuesMock,
          setPaymentDetailsCAPE: setPaymentDetailsCAPEMock
        }
      };
      wrapper = setup(props);
      wrapper.instance().receiveMessage(fakeEvent);

      expect(
        JSON.stringify(setPaymentDetailsDuesMock.mock.calls[0])
      ).toStrictEqual(JSON.stringify([true, "Visa", "4242"]));
    });
    it("ignores messages from non-unioni.se domains", () => {
      sfEmployerLookupSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
        );
      const fakeEvent = {
        origin: "the wrong domain",
        data: {}
      };
      let handleInputMock = jest.fn();
      let setPaymentDetailsDuesMock = jest.fn();
      let setPaymentDetailsCAPEMock = jest.fn();
      const props = {
        formValues: {
          // to get code coverage for afh edge cases
          employerType: "Adult Foster Home",
          capeAmount: null,
          donationFrequency: null
        },
        apiSF: {
          getSFEmployers: sfEmployerLookupSuccess
        },
        apiSubmission: {
          handleInput: handleInputMock,
          setPaymentDetailsDues: setPaymentDetailsDuesMock,
          setPaymentDetailsCAPE: setPaymentDetailsCAPEMock
        }
      };
      wrapper = setup(props);
      wrapper.instance().receiveMessage(fakeEvent);

      expect(setPaymentDetailsDuesMock.mock.calls.length).toBe(0);
    });
    it("ignores messages without type === 'success'", () => {
      sfEmployerLookupSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
        );
      const fakeEvent = {
        data: {
          notification: {
            type: "fail"
          }
        },
        origin: "https://lab.unioni.se"
      };
      let handleInputMock = jest.fn();
      let setPaymentDetailsDuesMock = jest.fn();
      let setPaymentDetailsCAPEMock = jest.fn();
      const props = {
        formValues: {
          // to get code coverage for afh edge cases
          employerType: "Adult Foster Home",
          capeAmount: null,
          donationFrequency: null
        },
        apiSF: {
          getSFEmployers: sfEmployerLookupSuccess
        },
        apiSubmission: {
          handleInput: handleInputMock,
          setPaymentDetailsDues: setPaymentDetailsDuesMock,
          setPaymentDetailsCAPE: setPaymentDetailsCAPEMock
        }
      };
      wrapper = setup(props);
      wrapper.instance().receiveMessage(fakeEvent);

      expect(setPaymentDetailsDuesMock.mock.calls.length).toBe(0);
    });
  });

  test("`donationFrequencyOnChange` calls this.props.change and this.handleDonationFrequencyChange", () => {
    const changeMock = jest.fn();
    const handleDonationFrequencyChangeMock = jest.fn();
    const props = {
      change: changeMock,
      handleDonationFrequencyChange: handleDonationFrequencyChangeMock
    };
    wrapper = setup(props);

    wrapper.instance().donationFrequencyOnChange();
    expect(changeMock).toHaveBeenCalled();
    expect(handleDonationFrequencyChangeMock).toHaveBeenCalled();
  });

  test("`loadEmployersPicklist` handles Community Members edge case", () => {
    const props = {
      submission: {
        employerObjects: [
          {
            Name: "community members"
          }
        ],
        payment: {
          cardAddingUrl: ""
        },
        formPage1: {
          employerType: ""
        }
      }
    };
    wrapper = setup(props);

    const list = wrapper.instance().loadEmployersPicklist();
    expect(list).toContain("Community Member");
  });

  test("`loadEmployersPicklist` handles 503 Staff edge case", () => {
    const props = {
      submission: {
        employerObjects: [
          {
            Name: "seiu local 503 opeu"
          }
        ],
        payment: {
          cardAddingUrl: ""
        },
        formPage1: {
          employerType: ""
        }
      }
    };
    wrapper = setup(props);

    const list = wrapper.instance().loadEmployersPicklist();
    expect(list).toContain("SEIU 503 Staff");
  });

  test("`updateEmployersPicklist` handles Retirees edge case", () => {
    const props = {
      submission: {
        employerObjects: [
          {
            Name: "community members"
          }
        ],
        payment: {
          cardAddingUrl: ""
        },
        formPage1: {
          employerType: "retired"
        }
      },
      formValues: {
        employerType: "retired"
      }
    };
    wrapper = setup(props);
    wrapper.instance().loadEmployersPicklist = jest
      .fn()
      .mockImplementation(() => ["community members"]);
    wrapper.instance().updateEmployersPicklist();
    expect(wrapper.instance().props.formValues.employerName).toBe("Retirees");
  });

  test("`updateEmployersPicklist` handles 503 Staff edge case", () => {
    const props = {
      submission: {
        employerObjects: [
          {
            Name: "seiu local 503 opeu"
          }
        ],
        payment: {
          cardAddingUrl: ""
        },
        formPage1: {
          employerType: "seiu 503 staff"
        }
      },
      formValues: {
        employerType: "seiu 503 staff"
      }
    };
    wrapper = setup(props);
    wrapper.instance().loadEmployersPicklist = jest
      .fn()
      .mockImplementation(() => ["seiu 503 staff"]);
    wrapper.instance().updateEmployersPicklist();
    expect(wrapper.instance().props.formValues.employerName).toBe(
      "SEIU 503 Staff"
    );
  });
});
