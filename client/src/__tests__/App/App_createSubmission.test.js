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
import { employersPayload, storeFactory } from "../../utils/testUtils";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { AppUnconnected } from "../../App";
import "jest-canvas-mock";
import * as formElements from "../../components/SubmissionFormElements";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../../styles/theme";
import {
  generateSampleValidate,
  generateSubmissionBody
} from "../../../../app/utils/fieldConfigs";
import handlers from "../../mocks/handlers";
import { handleInput } from "../../store/actions/apiSubmissionActions.js";
let pushMock = jest.fn(),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  executeMock = jest.fn().mockImplementation(() => Promise.resolve());

const server = setupServer(...handlers);

let updateSFContactSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_CONTACT_SUCCESS", payload: {} })
  );

let lookupSFContactSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "LOOKUP_SF_CONTACT_SUCCESS",
    payload: { salesforce_id: "123" }
  })
);

let createSFContactSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "CREATE_SF_CONTACT_SUCCESS",
    payload: { salesforce_id: "123" }
  })
);

let createSFOMAError = jest
  .fn()
  .mockImplementation(() => Promise.reject({ type: "CREATE_SF_OMA_FAILURE" }));

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

let addSubmissionSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
  );

let addSubmissionError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "ADD_SUBMISSION_FAILURE" })
  );

let createSubmissionSuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));

let getSFDJRSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_SF_DJR_SUCCESS", payload: {} })
  );

let createSFDJRSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS", payload: {} })
  );

let updateSFDJRSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_DJR_SUCCESS", payload: {} })
  );

let refreshRecaptchaMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));

global.scrollTo = jest.fn();

const clearSigBoxMock = jest.fn();
let toDataURLMock = jest.fn();

const sigBox = {
  current: {
    toDataURL: toDataURLMock,
    clear: clearSigBoxMock
  }
};

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
  textAuthOptOut: false,
  directPayAuth: true,
  directDepositAuth: true,
  employerName: "homecare",
  paymentType: "card",
  employerType: "retired",
  preferredLanguage: "English"
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
  appState: {},
  apiProfile: {},
  initialize: jest.fn(),
  addTranslation: jest.fn(),
  profile: {},
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
    // updateSFContact: updateSFContactSuccess,
    createSFContact: createSFContactSuccess
    // lookupSFContact: lookupSFContactSuccess
  },
  apiSubmission: {
    // handleInput: handleInputMock,
    handleInput,
    clearForm: clearFormMock,
    setCAPEOptions: jest.fn(),
    addSubmission: () => Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
  },
  history: {
    push: pushMock
  },
  recaptcha: {
    execute: executeMock
  },
  refreshRecaptcha: refreshRecaptchaMock,
  sigBox: { ...sigBox },
  content: {
    error: null
  },
  legal_language: {
    current: {
      innerHTML: "legal"
    }
  },
  direct_deposit: {
    current: {
      innerHTML: "deposit"
    }
  },
  direct_pay: {
    current: {
      innerHTML: "pay"
    }
  },
  actions: {
    setSpinner: jest.fn()
  },
  createSubmission: createSubmissionSuccess,
  setActiveLanguage: jest.fn()
};

const initialState = {
  appState: {
    loading: false
  },
  submission: {
    formPage1: {
      reCaptchaValue: "token"
    },
    allSubmissions: [{ key: "value" }],
    employerObjects: [...employersPayload]
  }
};

const store = storeFactory(initialState);

const setup = async (props = {}, route = "/") => {
  const setupProps = {
    ...defaultProps,
    ...props
  };
  // console.log(setupProps.submission.employerObjects);
  return render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <AppUnconnected {...setupProps} />
        </MemoryRouter>
      </Provider>
    </ThemeProvider>
  );
};

describe("<App />", () => {
  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe("createSubmission", () => {
    test.only("`createSubmission` handles error if prop function fails", async function() {
      // Tab1 onSubmit = handleTab(1) (SubmissionFormPage1.jsx > 628)
      // handleTab calls handleTab1() (async, w catch block) (SubmFormP1.jsx > 573)
      // handleTab1 calls verifyRecapchaScore method (SubmFormP1.jsx > 228)
      // verifyRecaptchaScore calls this.props.recaptcha.current.execute() (mocked in test props)
      // verifyRecaptchaScore calls this.props.apiSubmission.verify() (mocked with msw) and returns a score back to handleTab1
      // handleTab1 calls utils.ispaymentRequired (is this mocked? what's happening here?)
      // handleTab1 calls apiSubmission.handleInput (mocked in test props?)
      // handleTab1 checks for this.props.submission.salesforceId
      // if yes, calls this.props.apiSF.updateSFContact (async, w catch block)
      // if success, RETURN this.props.changeTab(1) (App.js > 864)
      // if fail, handleError
      // if no, calls this.props.lookupSFContact (async, w catch block) ==> NEED TO MOCK THIS
      // if fail, handleError
      // handleTab1 checks again for this.props.submission.salesforceId (should have been returned in lookup)
      // if yes, calls this.props.apiSF.updateSFContact (async, w catch block) ?mocked w msw??
      // if success, RETURN this.props.changeTab(1) (App.js > 864)
      // if fail, handleError
      // if no, calls this.props.lookupSFContact (async, w catch block) ?mocked w msw??
      // if fail, handleError
      // handleTab1 calls this.props.createSFContact (async, w catch block) mocked in test props
      // if fail, handleError
      // if success, RETURN this.props.changeTab(1) (App.js > 864)
      // changeTab(1) sets App state to cause Tab 2 to render

      //  ==> createSubmission is not called until submit on Tab 2

      // Tab2 onSubmit = handleTab(2) (SubmissionFormPage1.jsx > 628)
      // handleTab calls handleTab2() (async, w catch block) (SubmFormP1.jsx > 550)
      // handleTab2 checks for formValues.signature
      // if false, handleError
      // handleTab2 calls this.saveLegalLanguage() (mocked in test props)
      // handleTab2 calls this.props.createSubmission (async, w catch block) (App.js > 684)
      // handleTab2 calls this.props.changeTab(2) (App.js > 864)

      // handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      addSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_FAILURE" })
        );
      let props = {
        apiSubmission: {
          // handleInput: handleInputMock,
          handleInput,
          addSubmission: addSubmissionError,
          updateSubmission: jest
            .fn()
            .mockImplementation(() => Promise.resolve({}))
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            legalLanguage: "jjj"
          }
        }
      };

      let generateSubmissionBodyMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      const testData = generateSampleValidate();

      // render app
      const user = userEvent.setup();
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        debug
      } = await setup(props);

      // simulate user click 'Next'
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that tab 1 renders
      const tab1Form = getByRole("form");
      await waitFor(() => {
        expect(tab1Form).toBeInTheDocument();
      });

      // simulate submit
      await fireEvent.submit(tab1Form, { ...testData });

      // enter signature and simulate submit tab2
      await waitFor(async () => {
        const sigInput = await getByLabelText("Signature");
        await fireEvent.change(sigInput, { target: { value: "test" } });
        const tab2Form = await getByTestId("form-tab2");
        await fireEvent.submit(tab2Form, { ...testData });
      });

      // expect snackbar to be in document with error styling and correct message
      await waitFor(() => {
        const snackbar = getByTestId("component-basic-snackbar");
        const errorIcon = getByTestId("ErrorOutlineIcon");
        const message = getByText(
          "An error occurred while saving your Submission"
        );
        expect(snackbar).toBeInTheDocument();
        expect(message).toBeInTheDocument();
        expect(errorIcon).toBeInTheDocument();
      });
    });
    test("`createSubmission` handles error if prop function throws", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      addSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "ADD_SUBMISSION_FAILURE" })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock,
          addSubmission: addSubmissionError,
          updateSubmission: jest
            .fn()
            .mockImplementation(() => Promise.resolve({}))
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            legalLanguage: "jjj"
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" }),
          createSFOMA: () => Promise.resolve({ type: "CREATE_SF_OMA_SUCCESS" })
        }
      };
      wrapper = setup(props);
      let generateSubmissionBodyMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      wrapper.instance().generateSubmissionBody = generateSubmissionBodyMock;
      wrapper.update();
      wrapper
        .instance()
        .createSubmission(formValues)
        .then(async () => {
          await generateSubmissionBodyMock;
          await addSubmissionError;
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`createSubmission` calls saveSubmissionErrors if createSFOMA fails", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      addSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_FAILURE" })
        );
      const createSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SUBMISSION_FAILURE" })
        );
      createSFOMAError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SF_OMA_FAILURE" })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock,
          addSubmission: addSubmissionError
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            paymentRequired: false
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" }),
          createSFOMA: createSFOMAError
        },
        createSubmission: createSubmissionError
      };
      let saveSubmissionErrorsMock = jest.fn();
      wrapper = setup(props);
      wrapper.instance().saveSubmissionErrors = saveSubmissionErrorsMock;

      wrapper.update();
      wrapper
        .instance()
        .createSubmission(formValues)
        .then(async () => {
          await createSFOMAError;
          expect(saveSubmissionErrorsMock.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`createSubmission` calls saveSubmissionErrors if createSFOMA throws", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      addSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_FAILURE" })
        );
      const createSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SUBMISSION_FAILURE" })
        );
      createSFOMAError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "CREATE_SF_OMA_FAILURE" })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock,
          addSubmission: addSubmissionError
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            paymentRequired: false
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" }),
          createSFOMA: createSFOMAError
        },
        createSubmission: createSubmissionError
      };
      let saveSubmissionErrorsMock = jest.fn();
      wrapper = setup(props);
      wrapper.instance().saveSubmissionErrors = saveSubmissionErrorsMock;

      wrapper.update();
      wrapper
        .instance()
        .createSubmission(formValues)
        .then(async () => {
          await createSFOMAError;
          expect(saveSubmissionErrorsMock.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`createSubmission` handles error if updateSubmission throws", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      addSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_FAILURE" })
        );
      const updateSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "UPDATE_SUBMISSION_FAILURE" })
        );
      const createSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SUBMISSION_FAILURE" })
        );
      const createSFOMASuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "CREATE_SF_OMA_SUCCESS" })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock,
          addSubmission: addSubmissionError,
          updateSubmission: updateSubmissionError
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            paymentRequired: false
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" }),
          createSFOMA: createSFOMASuccess
        },
        createSubmission: createSubmissionError,
        updateSubmission: updateSubmissionError
      };
      let saveSubmissionErrorsMock = jest.fn();
      wrapper = setup(props);
      wrapper.instance().saveSubmissionErrors = saveSubmissionErrorsMock;

      wrapper.update();
      wrapper
        .instance()
        .createSubmission(formValues)
        .then(async () => {
          await addSubmissionSuccess;
          await createSFOMASuccess;
          await updateSubmissionError;
          expect(formElements.handleError).toHaveBeenCalled();
        })
        .catch(err => console.log(err));
    });
    test("`createSubmission` handles edge case if !paymentRequired and partial", async function() {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      formElements.handleError = jest.fn();
      createSFOMAError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SF_OMA_FAILURE" })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock,
          addSubmission: addSubmissionSuccess
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            paymentRequired: false
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" }),
          createSFOMA: createSFOMAError
        }
      };
      let saveSubmissionErrorsMock = jest.fn();
      wrapper = setup(props);
      wrapper.instance().saveSubmissionErrors = saveSubmissionErrorsMock;

      wrapper.update();
      wrapper
        .instance()
        .createSubmission(formValues, true)
        .catch(err => console.log(err));
    });
  });
});
