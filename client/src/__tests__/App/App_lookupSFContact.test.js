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
let pushMock = jest.fn(),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  handleErrorMock = jest.fn(),
  executeMock = jest.fn().mockImplementation(() => Promise.resolve());

const testData = generateSampleValidate();
const server = setupServer(...handlers);

import { AppUnconnected } from "../../App";

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
    payment: {},
    employerObjects: { ...employersPayload }
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

const notes = () => {
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
  // if no, calls this.props.lookupSFContact (async, w catch block) ==> (App.js > 354)
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
  // createSubmission calls this.props.apiSubmission.addSubmission (async, w catch block)
  // createSubmission calls this.props.apiSF.createSFOMA (async, w catch block)
  // handleTab2 calls this.props.changeTab(2) (App.js > 864)
};

describe("<App />", () => {
  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe("lookupSFContact", () => {
    test("`lookupSFContact` calls lookupSFContact prop if required fields populated", async function() {
      // just test that with this set of props, it doesn't error and advances to next tab
      let props = {
        formValues: {
          firstName: "string",
          lastName: "string",
          employerName: "homecare",
          homeEmail: "test@test.com"
        },
        submission: {
          salesforceId: null,
          formPage1: { ...defaultProps.formPage1 }
        }
      };
      // render app
      const user = userEvent.setup();
      const {
        getByTestId,
        queryByTestId,
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

      // expect snackbar NOT to be in document
      await waitFor(() => {
        expect(
          queryByTestId("component-basic-snackbar")
        ).not.toBeInTheDocument();
      });

      // expect cape tab to render
      await waitFor(() => {
        const cape = getByTestId("component-cape");
        expect(cape).toBeInTheDocument();
      });
    });
    test.only("`lookupSFContact` handles error if lookupSFContact prop throws", async function() {
      lookupSFContactError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({
            type: "LOOKUP_SF_CONTACT_FAILURE",
            payload: {},
            message: "lookupSFContactError"
          })
        );
      let props = {
        submission: {
          salesforceId: null,
          formPage1: {
            prefillEmployerId: "123"
          }
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: lookupSFContactError
        }
      };

      // render app
      const user = userEvent.setup(props);
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

      // enter required data
      await waitFor(async () => {
        const employerType = await getByLabelText("Employer Type");
        const firstName = await getByLabelText("First Name");
        const lastName = await getByLabelText("Last Name");
        const homeEmail = await getByLabelText("Home Email");
        await fireEvent.change(employerType, {
          target: { value: "state homecare or personal support" }
        });
        await fireEvent.change(firstName, { target: { value: "test" } });
        await fireEvent.change(lastName, { target: { value: "test" } });
        await fireEvent.change(homeEmail, {
          target: { value: "test@test.com" }
        });
      });

      // simulate submit tab1
      await waitFor(async () => {
        const employerName = await getByLabelText("Employer Name");
        expect(employerName).toBeInTheDocument();
        await fireEvent.change(employerName, {
          target: {
            value: "homecare worker (aging and people with disabilities)"
          }
        });
        const tab1Form = await getByTestId("form-tab1");
        await fireEvent.submit(tab1Form, { ...testData });
      });

      // expect snackbar to be in document with error styling and correct message
      await waitFor(() => {
        const snackbar = getByTestId("component-basic-snackbar");
        const errorIcon = getByTestId("ErrorOutlineIcon");
        const message = getByText("lookupSFContactError");
        expect(snackbar).toBeInTheDocument();
        expect(message).toBeInTheDocument();
        expect(errorIcon).toBeInTheDocument();
      });
    });
    test("`lookupSFContact` calls createSFContact if lookupSFContact finds no match", async function() {
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          firstName: "string",
          lastName: "string",
          employerName: "homecare",
          homeEmail: "test@test.com"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: null,
          formPage1: {
            prefillEmployerId: null
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          lookupSFContact: lookupSFContactSuccess
        }
      };
      wrapper = setup(props);
      let createSFContactMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      wrapper.instance().setCAPEOptions = jest.fn();
      wrapper.instance().createSFContact = createSFContactMock;

      wrapper.update();
      wrapper
        .instance()
        .lookupSFContact(formValues)
        .then(async () => {
          await lookupSFContactSuccess;
          expect(createSFContactMock.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`lookupSFContact` handles error if createSFContact throws", async function() {
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          firstName: "string",
          lastName: "string",
          employerName: "homecare",
          homeEmail: "test@test.com"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: null,
          formPage1: {
            prefillEmployerId: "123"
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          lookupSFContact: lookupSFContactSuccess
        }
      };
      wrapper = setup(props);
      let createSFContactMock = jest
        .fn()
        .mockImplementation(() => Promise.reject("Error"));
      wrapper.instance().setCAPEOptions = jest.fn();
      wrapper.instance().createSFContact = createSFContactMock;

      wrapper.update();
      wrapper
        .instance()
        .lookupSFContact(formValues)
        .then(async () => {
          await lookupSFContactSuccess;
          await createSFContactMock;
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`lookupSFContact` doesn't call createSFContact if salesforceId in redux store", async function() {
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          firstName: "string",
          lastName: "string",
          employerName: "homecare",
          homeEmail: "test@test.com"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "1",
          formPage1: {
            prefillEmployerId: null
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          lookupSFContact: lookupSFContactSuccess
        }
      };
      wrapper = setup(props);
      let createSFContactMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      wrapper.instance().setCAPEOptions = jest.fn();
      wrapper.instance().createSFContact = createSFContactMock;

      wrapper.update();
      wrapper
        .instance()
        .lookupSFContact(formValues)
        .then(async () => {
          await lookupSFContactSuccess;
          expect(createSFContactMock.mock.calls.length).toBe(0);
        })
        .catch(err => console.log(err));
    });
  });
});
