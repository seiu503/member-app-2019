import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

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
import { setupServer } from "msw/node";
import * as formElements from "../../components/SubmissionFormElements";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../../styles/theme";
import {
  generateSampleValidate,
  generateSubmissionBody
} from "../../../../app/utils/fieldConfigs";
import handlers from "../../mocks/handlers";
import { I18nextProvider } from "react-i18next";
import i18n from "../../translations/i18n";
let navigate = jest.fn(),
  handleInputMock = jest
    .fn()
    .mockImplementation(() => console.log("handleInputMock")),
  handleInputSPFMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  handleErrorMock = jest.fn(),
  executeMock = jest.fn().mockImplementation(() => Promise.resolve());

const testData = generateSampleValidate();
const server = setupServer(...handlers);

import { AppUnconnected } from "../../App";

let verifyMock = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "VERIFY_SUCCESS",
    payload: {
      score: 0.9
    }
  })
);

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

let createSFOMASuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "CREATE_SF_OMA_SUCCESS" }));

let createSFOMAError = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "CREATE_SF_OMA_FAILURE" }));

let refreshRecaptchaMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));

global.scrollTo = jest.fn();

const formValues = {
  firstName: "firstName",
  lastName: "lastName",
  homeEmail: "test@test.com",
  homeStreet: "homeStreet",
  homeCity: "homeCity",
  homeZip: "12345",
  homeState: "homeState",
  signature: "signature",
  employerType: "employerType",
  employerName: "employerName",
  mobilePhone: "1234567890",
  mm: "01",
  dd: "01",
  yyyy: "1999",
  preferredLanguage: "English",
  textAuthOptOut: false,
  termsAgree: true,
  MOECheckbox: true
};

const initialState = {
  appState: {
    loading: false
  },
  submission: {
    formPage1: {
      reCaptchaValue: "token",
      ...formValues
    },
    p4cReturnValues: {},
    allSubmissions: [{ key: "value" }],
    employerObjects: [...employersPayload],
    formPage2: {},
    cape: {
      monthlyOptions: []
    }
  }
};

const defaultProps = {
  submission: {
    error: null,
    loading: false,
    formPage1: {
      reCaptchaValue: "token",
      ...formValues
    },
    cape: {},
    payment: {},
    p4cReturnValues: {
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
      legalLanguage: ""
    }
  },
  appState: {},
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
    createSFOMA: createSFOMASuccess,
    getIframeURL: () =>
      Promise.resolve({ type: "GET_IFRAME_URL_SUCCESS", payload: {} }),
    updateSFContact: updateSFContactSuccess,
    createSFContact: createSFContactSuccess,
    lookupSFContact: lookupSFContactSuccess
  },
  apiSubmission: {
    handleInput: handleInputMock,
    handleInputSPF: handleInputSPFMock,
    verify: verifyMock,
    clearForm: clearFormMock,
    updateSubmission: () =>
      Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" }),
    addSubmission: () => Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
  },
  history: {},
  navigate,
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
  actions: {
    setSpinner: jest.fn()
  },
  lookupSFContact: lookupSFContactSuccess,
  i18n: {
    changeLanguage: jest.fn()
  },
  t: text => text
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
        <I18nextProvider i18n={i18n} defaultNS={"translation"}>
          <BrowserRouter>
            <AppUnconnected {...setupProps} />
          </BrowserRouter>
        </I18nextProvider>
      </Provider>
    </ThemeProvider>
  );
};

describe("<App />", () => {
  // Enable API mocking before tests.
  beforeAll(() => {
    server.listen();
    cleanup();
  });

  beforeEach(() => cleanup());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe("misc methods 2", () => {
    beforeEach(() => cleanup());

    test("`generateSubmissionBody` uses back end fieldnames if !firstName", async () => {
      const props = {
        submission: {
          ...defaultProps.submission,
          salesforceId: "1234",
          formPage1: {
            ...defaultProps.submission.formPage1,
            legalLanguage: "abc"
          },
          submissionId: "5678",
          currentSubmission: {},
          payment: {},
          cape: {
            monthlyOptions: []
          }
        },
        location: {
          search: "&cId=1234"
        },
        t: text => text,
        apiSubmission: {
          ...defaultProps.apiSubmission,
          verify: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "VERIFY_SUCCESS",
              payload: {
                score: 0.9
              }
            })
          )
        },
        apiSF: {
          createSFOMA: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_OMA_SUCCESS",
              payload: { id: 1 }
            })
          ),
          lookupSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          )
        }
      };
      // render app
      const user = await userEvent.setup();
      const {
        getByTestId,
        queryByTestId,
        getByRole,
        getByLabelText,
        getByText,
        debug
      } = await setup(props);

      // simulate user click 'Next'
      const nextButton = await getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that tab 1 renders
      const tab1Form = await getByRole("form");
      await waitFor(() => {
        expect(tab1Form).toBeInTheDocument();
      });

      // simulate submit tab1
      const submitButton = await getByTestId("button-submit");
      await waitFor(async () => {
        await userEvent.click(submitButton);
      });

      // // check that tab 2 renders
      // const tab2Form = await getByTestId("form-tab2");
      // await waitFor(() => {
      //   expect(tab2Form).toBeInTheDocument();
      // });

      // // simulate submit tab2
      // const submitButton2 = await getByTestId("button-submit-tab2");
      // await waitFor(async () => {
      //   await userEvent.click(submitButton2);
      // });

      // // just test that with these props there are no errors and it moves to tab 3

      // // expect snackbar NOT to be in document
      // await waitFor(() => {
      //   expect(
      //     queryByTestId("component-basic-snackbar")
      //   ).not.toBeInTheDocument();
      // });

      // // expect cape tab to render
      // const cape = await getByTestId("component-cape");
      // await waitFor(() => {
      //   expect(cape).toBeInTheDocument();
      // });
    });

    test("`updateSubmission` uses defaults if no passedId or passedUpdates", async () => {
      const props = {
        submission: {
          salesforceId: "1234",
          formPage1: {
            legalLanguage: "abc"
          },
          submissionId: "5678",
          payment: {}
        },
        location: {
          search: "&cId=1234"
        },
        t: text => text,
        apiSubmission: {
          ...defaultProps.apiSubmission,
          verify: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "VERIFY_SUCCESS",
              payload: {
                score: 0.9
              }
            })
          )
        },
        apiSF: {
          createSFOMA: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_OMA_SUCCESS",
              payload: { id: 1 }
            })
          ),
          lookupSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          ),
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            })
          )
        }
      };
      // render app
      const user = userEvent.setup();
      const {
        getByTestId,
        queryByTestId,
        getByRole,
        getByLabelText,
        queryByLabelText,
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

      // simulate submit tab1
      await waitFor(async () => {
        const submitButton = getByTestId("button-submit");
        await userEvent.click(submitButton);
      });

      // simulate submit tab2
      await waitFor(async () => {
        const submitButton = getByTestId("button-submit-tab2");
        await userEvent.click(submitButton);
      });

      // just test that with these props there are no errors and it moves to tab 3

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
  });
});
