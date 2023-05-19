import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "@testing-library/jest-dom/extend-expect";
import "@testing-library/jest-dom";
import { within } from "@testing-library/dom";
import {
  fireEvent,
  render,
  screen,
  cleanup,
  waitFor
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { employersPayload, storeFactory } from "../../../utils/testUtils";
import { rest } from "msw";
import { setupServer } from "msw/node";
import "jest-canvas-mock";
import * as formElements from "../../../components/SubmissionFormElements";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../../../styles/theme";
import {
  generatePage2Validate,
  generateSubmissionBody
} from "../../../../../app/utils/fieldConfigs";
import handlers from "../../../mocks/handlers";
let pushMock = jest.fn(),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  handleErrorMock = jest.fn(),
  executeMock = jest.fn().mockImplementation(() => Promise.resolve());

const testData = generatePage2Validate();
const server = setupServer(...handlers);

import { SubmissionFormPage1Container } from "../../../containers/SubmissionFormPage1";

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

let lookupSFContactSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "LOOKUP_SF_CONTACT_SUCCESS",
    payload: { salesforce_id: "123" }
  })
);

let lookupSFContactError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "LOOKUP_SF_CONTACT_FAILURE", payload: {} })
  );

let createSFContactSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "CREATE_SF_CONTACT_SUCCESS",
    payload: { salesforce_id: "123" }
  })
);

let getSFContactByIdSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "GET_SF_CONTACT_SUCCESS",
    payload: {
      Birthdate: moment("01-01-1900", "MM-DD-YYYY"),
      firstName: "test",
      lastName: "test"
    }
  })
);

let getSFContactByDoubleIdSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "GET_SF_CONTACT_DID_SUCCESS",
    payload: {
      firstName: "test",
      lastName: "test"
    }
  })
);

let createSubmissionSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "CREATE_SUBMISSION_SUCCESS" })
  );

let refreshRecaptchaMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));

let verifyRecaptchaScoreMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve(0.9));

global.scrollTo = jest.fn();

const changeTabMock = jest.fn();

const formValues = {
  firstName: "firstName",
  lastName: "lastName",
  homeEmail: "homeEmail",
  homeStreet: "homeStreet",
  homeCity: "homeCity",
  homeZip: "homeZip",
  homeState: "homeState",
  signature: "signature",
  employerType: "employerType",
  employerName: "employerName",
  mobilePhone: "mobilePhone",
  mm: "12",
  dd: "01",
  yyyy: "1999",
  preferredLanguage: "English",
  textAuthOptOut: false
};

const defaultProps = {
  submission: {
    error: null,
    loading: false,
    formPage1: {
      signature: ""
    },
    cape: {},
    payment: {}
  },
  initialValues: {
    mm: "",
    onlineCampaignSource: null
  },
  formValues,
  location: {
    search: "id=1"
  },
  classes: {},
  apiSF: {
    getSFEmployers: () => Promise.resolve({ type: "GET_SF_EMPLOYER_SUCCESS" }),
    getSFContactById: getSFContactByIdSuccess,
    getSFContactByDoubleId: getSFContactByDoubleIdSuccess,
    createSFOMA: () => Promise.resolve({ type: "CREATE_SF_OMA_SUCCESS" }),
    updateSFContact: updateSFContactSuccess,
    createSFContact: createSFContactSuccess,
    lookupSFContact: lookupSFContactSuccess
  },
  apiSubmission: {
    handleInput: handleInputMock,
    clearForm: clearFormMock,
    setCAPEOptions: jest.fn(),
    addSubmission: () => Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" }),
    updateSubmission: () =>
      Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
  },
  history: {
    push: pushMock
  },
  recaptcha: {
    current: {
      execute: executeMock
    }
  },
  refreshRecaptcha: refreshRecaptchaMock,
  content: {
    error: null
  },
  legal_language: {
    current: {
      innerHTML: "legal"
    }
  },
  direct_pay: {
    current: {
      innerHTML: "pay"
    }
  },
  createSubmission: createSubmissionSuccess,
  changeTab: changeTabMock,
  actions: {
    setSpinner: jest.fn()
  },
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
  setCAPEOptions: jest.fn(),
  handleError: jest.fn(),
  renderHeadline: jest.fn(),
  translate: jest.fn(),
  renderBodyCopy: jest.fn()
};

let handleSubmit;
const initialState = {};
const store = storeFactory(initialState);
const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props, handleSubmit };
  return render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <SubmissionFormPage1Container {...setupProps} />
      </Provider>
    </ThemeProvider>
  );
};

describe("<SubmissionFormPage1Container /> unconnected", () => {
  beforeEach(() => {
    handleSubmit = fn => fn;
  });

  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe("handleTab1", () => {
    test.only("`handleTab1` sets howManyTabs to 3 if no payment required", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      createSubmissionSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SUBMISSION_SUCCESS" })
        );
      let props = {
        formValues: {
          signature: "test",
          directPayAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        submission: {
          ...defaultProps.submission,
          formPage1: {
            ...defaultProps.submission.formPage1,
            reCaptchaValue: "token"
          }
        },
        createSubmission: createSubmissionSuccess,
        tab: 0,
        updateSFContact: updateSFContactSuccess,
        createSFContact: jest.fn().mockImplementation(() =>
          Promise.resolve({
            type: "CREATE_SF_CONTACT_SUCCESS",
            payload: { salesforce_id: "123" }
          })
        ),
        lookupSFContact: jest.fn().mockImplementation(() =>
          Promise.resolve({
            type: "LOOKUP_SF_CONTACT_SUCCESS",
            payload: { salesforce_id: "123" }
          })
        ),
        apiSubmission: {
          ...defaultProps.apiSubmission,
          verify: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "VERIFY_SUCCESS",
              payload: {
                score: 0.9
              }
            })
          ),
          handleInput: handleInputMock
        }
      };
      // render form
      const user = userEvent.setup(props);
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        debug
      } = await setup(props);

      const tab1Form = getByTestId("form-tab1");

      // simulate submit tab1
      await waitFor(async () => {
        await fireEvent.submit(tab1Form);
      });

      // expect handleInputMock to have been called setting `howManyTabs` to 3
      await waitFor(() => {
        expect(handleInputMock).toHaveBeenCalledWith({
          target: { name: "howManyTabs", value: 3 }
        });
      });
    });

    test("`handleTab1` sets 'paymentRequired' to true if payment required", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          employerName: "community member",
          paymentType: "card",
          employerType: "community member",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {}
        },
        apiSF: {
          updateSFContact: updateSFContactError,
          createSFContact: createSFContactSuccess
        }
      };
      let verifyRecaptchaScoreMock = jest.fn().mockImplementation(() => 1);
      wrapper = setup(props);
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;

      wrapper.update();
      wrapper
        .instance()
        .handleTab1()
        .then(async () => {
          await verifyRecaptchaScoreMock();
          expect(handleInputMock.mock.calls[0][0]).toEqual({
            target: { name: "paymentRequired", value: true }
          });
          changeTabMock.mockClear();
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleTab1` handles error if updateSFContact fails", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      const updateSFContactError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "UPDATE_SF_CONTACT_FAILURE" })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          employerName: "community member",
          paymentType: "card",
          employerType: "community member",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {}
        },
        apiSF: {
          updateSFContact: updateSFContactError,
          createSFContact: createSFContactSuccess
        }
      };
      let verifyRecaptchaScoreMock = jest.fn().mockImplementation(() => 1);
      wrapper = setup(props);
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;

      wrapper.update();
      wrapper
        .instance()
        .handleTab1()
        .then(async () => {
          await verifyRecaptchaScoreMock();
          await handleInputMock();
          await handleInputMock();
          await updateSFContactError();
          expect(formElements.handleError.mock.calls.length).toBe(1);
          changeTabMock.mockClear();
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleTab1` handles error if lookupSFContact fails", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: null,
          formPage1: {}
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          updateSFContact: updateSFContactSuccess,
          lookupSFContact: lookupSFContactError
        }
      };
      wrapper = setup(props);
      lookupSFContactError = () => Promise.reject("");
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper.instance().updateSFContact = updateSFContactSuccess;
      wrapper.instance().lookupSFContact = lookupSFContactError;
      wrapper.update();
      wrapper
        .instance()
        .handleTab1()
        .then(async () => {
          await verifyRecaptchaScoreMock();
          await handleInputMock();
          await updateSFContactSuccess();
          return lookupSFContactError().then(() => {
            expect(formElements.handleError.mock.calls.length).toBe(1);
            changeTabMock.mockClear();
          });
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleTab1` navigates to tab 1 if salesforceId found in state", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      clearFormMock = jest.fn();
      updateSFContactSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SF_CONTACT_SUCCESS", payload: {} })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock,
          clearForm: clearFormMock,
          verify: () =>
            Promise.resolve({ type: "VERIFY_SUCCESS", payload: { score: 0.9 } })
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            reCaptchaValue: ""
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          updateSFContact: updateSFContactSuccess
        },
        recaptcha: {
          execute: jest.fn()
        }
      };
      wrapper = setup(props);
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper.instance().updateSFContact = updateSFContactSuccess;

      wrapper
        .instance()
        .handleTab1()
        .then(async () => {
          await verifyRecaptchaScoreMock();
          await handleInputMock();
          return updateSFContactSuccess().then(() => {
            expect(changeTabMock.mock.calls.length).toBe(1);
            changeTabMock.mockClear();
          });
        })
        .catch(err => console.log(err));
    });

    test("`handleTab1` navigates to tab 1 if lookup successful", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      const handleErrorMock = jest.fn();
      formElements.handleError = handleErrorMock;
      clearFormMock = jest.fn();
      updateSFContactSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SF_CONTACT_SUCCESS", payload: {} })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock,
          clearForm: clearFormMock,
          verify: () =>
            Promise.resolve({ type: "VERIFY_SUCCESS", payload: { score: 0.9 } })
        },
        submission: {
          salesforceId: null,
          formPage1: {
            reCaptchaValue: ""
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          updateSFContact: updateSFContactSuccess
        },
        recaptcha: {
          execute: jest.fn()
        }
      };
      wrapper = setup(props);
      updateSFContactError = jest
        .fn()
        .mockImplementation(() => Promise.reject("is this the error?"));
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper.instance().lookupSFContact = lookupSFContactSuccess;
      wrapper.instance().updateSFContact = updateSFContactError;
      const changeTabMock = jest.fn();
      wrapper.instance().changeTab = changeTabMock;
      wrapper.update();
      await wrapper
        .instance()
        .handleTab1()
        .catch(err => console.log(err));
      await verifyRecaptchaScoreMock();
      await handleInputMock();
      await lookupSFContactSuccess();
      wrapper.instance().props.submission.salesforceId = "1";
      await updateSFContactError().catch(err => console.log(err));
      changeTabMock.mockClear();
      // expect(formElements.handleError.mock.calls.length).toBe(1);
    });
  });
});
