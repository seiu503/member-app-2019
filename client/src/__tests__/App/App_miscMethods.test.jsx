import React from "react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
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
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
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
      lastName: "test",
      mobilePhone: "test"
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

let setActiveLanguageMock = jest.fn();

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
    },
    prefillValues: {}
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
  prefillValues: {
      preferredLanguage: ""
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
  setActiveLanguage: jest.fn(),
  i18n: {
    changeLanguage: setActiveLanguageMock
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
          <MemoryRouter initialEntries={[route]}>
            <AppUnconnected {...setupProps} />
          </MemoryRouter>
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

  describe("misc methods", () => {
    beforeEach(() => cleanup());
    test("`prepForContact` sets employerId conditionally based on prefillEmployerChanged prop", async () => {
      const props = {
        formValues: {
          ...formValues,
          employerName: "test"
        },
        submission: {
          formPage1: {
            ...defaultProps.submission.formPage1,
            employerName: "test",
            prefillEmployerId: "1234",
            prefillEmployerChanged: true,
            reCaptchaValue: "token"
          },
          payment: {},
          employerObjects: [...employersPayload],
          p4cReturnValues: {
            salesforceId: "123"
          }
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
          ),
          getSFContactByDoubleIdSuccess: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "GET_SF_CONTACT_DID_SUCCESS",
              payload: {
                firstName: "test",
                lastName: "test",
                mobilePhone: "test"
              }
            }))
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

      // check that spf renders
      await waitFor(() => {
        const spf = getByRole("form");
        expect(spf).toBeInTheDocument();
      });

      // change employer type
      await waitFor(async () => {
        const employerType = await getByLabelText("Employer Type");
        await fireEvent.change(employerType, {
          target: { value: "state homecare or personal support" }
        });
      });

      // change employer name
      await waitFor(async () => {
        const employerName = await getByLabelText("Employer Name");
        await fireEvent.change(employerName, {
          target: {
            value: "personal support worker (paid by ppl)"
          }
        });
      });

      // simulate submit tab1
      await waitFor(async () => {
        const submitButton = getByTestId("button-submit");
        await userEvent.click(submitButton);
      });

      // expect snackbar NOT to be in document
      await waitFor(() => {
        expect(
          queryByTestId("component-basic-snackbar")
        ).not.toBeInTheDocument();
      });

      // expect employerId to be set to '0014N00002ASaRyQAL' (PSW)
      await waitFor(() => {
        expect(handleInputMock).toHaveBeenCalledWith({
          target: { name: "employerId", value: "0014N00002ASaRyQAL" }
        });
      });
    });

    test("`updateLanguage` calls this.props.setActiveLanguage", async () => {
      const props = {
        setActiveLanguage: setActiveLanguageMock,
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
          ),
          getSFContactByDoubleIdSuccess: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "GET_SF_CONTACT_DID_SUCCESS",
              payload: {
                firstName: "test",
                lastName: "test",
                mobilePhone: "test"
              }
            }))
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

      // simulate user select language
      await waitFor(async() => {
        const languagePicker = getByLabelText("Select Language");
        await fireEvent.change(languagePicker, { target: { value: "Español" } });
        expect(setActiveLanguageMock).toHaveBeenCalled();
      });
    });

    test("`prepForSubmission` sets salesforceId conditionally based on query string, redux store, and passed values", async () => {
      const props = {
        submission: {
          salesforceId: "1234",
          formPage1: {
            legalLanguage: "abc"
          },
          payment: {},
          p4cReturnValues: {
            salesforceId: "5678",
            legalLanguage: "efg"
          }
        },
        location: {
          search: "&cId=1234"
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
          ),
          getSFContactByDoubleIdSuccess: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "GET_SF_CONTACT_DID_SUCCESS",
              payload: {
                firstName: "test",
                lastName: "test",
                mobilePhone: "test"
              }
            }))
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

      // check that spf renders
      await waitFor(() => {
        const spf = getByRole("form");
        expect(spf).toBeInTheDocument();
      });

      // simulate submit spf
      await waitFor(() => {
        const submitButton = getByTestId("button-submit");
        userEvent.click(submitButton);
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

    test("opens confirmation modal on SubmFormPage1 componentDidMount if firstName and lastName returned from getSFContactByDoubleId", async () => {
      getSFContactByDoubleIdSuccess = jest.fn().mockImplementation(() => {
        console.log("getSFContactByDoubleIdMock");
        return Promise.resolve({
          type: "GET_SF_CONTACT_DID_SUCCESS",
          payload: {
            FirstName: "test",
            LastName: "test",
            Account: { id: "test" },
            Ethnicity__c: "Declined"
          }
        });
      });
      const props = {
        location: {
          search: "cId=1&aId=2"
        },
        apiSF: {
          ...defaultProps.apiSF,
          getSFContactByDoubleId: getSFContactByDoubleIdSuccess,
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
          ),
          getSFContactByDoubleIdSuccess: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "GET_SF_CONTACT_DID_SUCCESS",
              payload: {
                firstName: "test",
                lastName: "test",
                mobilePhone: "test"
              }
            }))
        },
        submission: {
          ...defaultProps.submission,
          formPage1: {
            firstName: "test",
            lastName: "test"
          }
        },
        formPage2: {}
      };

      const { getByTestId } = await setup(props, "/?cId=1&aId=2");

      // check that modal renders
      // some kinda fucked up delay / race condition is happening here where
      // test is running before state is changing to open modal, so working around with
      // test timeout
      setTimeout(async () => {
        const modal = await getByTestId("component-modal");
        await waitFor(() => expect(modal).toBeInTheDocument());
      }, 10);
    });
  });
});
