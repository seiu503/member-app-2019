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
// import { I18nextProvider } from "react-i18next";
import { Translation } from "react-i18next";
import i18n from "../../translations/i18n";
import handlers from "../../mocks/handlers";
let navigate = jest.fn(),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  handleInputSPFMock = jest.fn().mockImplementation(() => Promise.resolve({})),
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

let createSFContactSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "CREATE_SF_CONTACT_SUCCESS",
    payload: { salesforce_id: "123" }
  })
);

let createSFContactError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "CREATE_SF_CONTACT_FAILURE", payload: {} })
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
    prefillValues: {
      preferredLanguage: ""
    },
    p4cReturnValues: {},
    allSubmissions: [{ key: "value" }],
    employerObjects: [...employersPayload],
    formPage2: {}
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
    prefillValues: {
      preferredLanguage: ""
    },
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
    },
    employerObjects: [...employersPayload]
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
    updateSFContact: () =>
      Promise.resolve({ type: "UPDATE_SF_CONTACT_SUCCESS" }),
    createSFContact: () =>
      Promise.resolve({ type: "CREATE_SF_CONTACT_SUCCESS" }),
    lookupSFContact: () =>
      Promise.resolve({ type: "LOOKUP_SF_CONTACT_SUCCESS" })
  },
  apiSubmission: {
    handleInput: handleInputMock,
    handleInputSPF: handleInputSPFMock,
    clearForm: clearFormMock,
    setCAPEOptions: jest.fn(),
    addSubmission: () => Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" }),
    updateSubmission: () =>
      Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
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
  i18n: {
    changeLanguage: jest.fn()
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
        <Translation>
          {(t, { i18n }) => (
            <BrowserRouter>
              <AppUnconnected {...setupProps} />
            </BrowserRouter>
          )}
        </Translation>
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

  describe("prepForContact", () => {
    test("`prepForContact` handles edge case if no employerName in formValues", async function() {
      let props = {
        ...defaultProps,
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: () =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            }),
          createSFContact: () =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
              payload: { id: 1 }
            }),
          createSFOMA: () =>
            Promise.resolve({
              type: "CREATE_SFOMA_SUCCESS",
              payload: { salesforce_id: "123" }
            })
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          addSubmission: () =>
            Promise.resolve({
              type: "ADD_SUBMISSION_SUCCESS",
              payload: { id: 1 }
            })
        },
        submission: {
          ...defaultProps.submission,
          currentSubmission: {},
          cape: {
            monthlyOptions: []
          }
        },
      };
      // render app
      const user = userEvent.setup();
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        queryByTestId,
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

      // expect snackbar NOT to be in document
      await waitFor(async () => {
        expect(
          await queryByTestId("component-basic-snackbar")
        ).not.toBeInTheDocument();
      });
    });
    test("`prepForContact` handles edge case if no matching employer object found", async function() {
      let props = {
        formValues: {
          employerName: "SEIU 503 Staff"
        },
        apiSubmission: {
          handleInput: handleInputMock,
          handleInputSPF: handleInputSPFMock,
          addSubmission: () =>
            Promise.resolve({
              type: "ADD_SUBMISSION_SUCCESS",
              payload: { id: 1 }
            })
        },
        submission: {
          ...defaultProps.submission,
          salesforceId: "123",
          formPage1: {
            prefillEmployerId: null
          },
          employerObjects: [{ id: "1", Name: "SEIU LOCAL 503 OPEU" }],
          p4cReturnValues: {
            ...defaultProps.submission.p4cReturnValues,
            salesforceId: "123"
          },
          cape: {
            monthlyOptions: []
          },
          currentSubmission: {}
        },
        createSFContact: jest.fn().mockImplementation(() =>
          Promise.resolve({
            type: "CREATE_SF_CONTACT_SUCCESS",
            payload: { salesforce_id: "123" }
          })
        ),
        updateSFContact: jest.fn().mockImplementation(() =>
          Promise.resolve({
            type: "UPDATE_SF_CONTACT_SUCCESS",
            payload: { salesforce_id: "123" }
          })
        ),
        lookupSFContact: jest.fn().mockImplementation(() =>
          Promise.resolve({
            type: "LOOKUP_SF_CONTACT_SUCCESS",
            payload: { salesforce_id: "123" }
          })
        ),
        apiSF: {
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
              payload: { salesforce_id: "123" }
            })
          ),
          updateSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "UPDATE_SF_CONTACT_SUCCESS",
              payload: { salesforce_id: "123" }
            })
          ),
          lookupSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { salesforce_id: "123" }
            })
          ),
          createSFOMA: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SFOMA_SUCCESS",
              payload: { salesforce_id: "123" }
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

      // expect snackbar NOT to be in document
      await waitFor(() => {
        expect(
          queryByTestId("component-basic-snackbar")
        ).not.toBeInTheDocument();
      });

      // expect employerId to be set to '0016100000WERGeAAP' (unknown)
      await waitFor(() => {
        expect(handleInputMock).toHaveBeenCalledWith({
          target: { name: "employerId", value: "0016100000WERGeAAP" }
        });
      });
    });
    test("`prepForContact` handles edge case if prefill employer id & employer changed", async function() {
      let props = {
        submission: {
          ...defaultProps.submission,
          salesforceId: "123",
          formPage1: {
            ...formValues,
            prefillEmployerId: "2",
            prefillEmployerChanged: true
          },
          cape: {
            monthlyOptions: []
          },
          handleInputSPF: handleInputSPFMock,
          employerObjects: [{ id: "1", Name: "SEIU LOCAL 503 OPEU" }],
          p4cReturnValues: {
            ...defaultProps.p4cReturnValues,
            salesforceId: "123"
          },
          currentSubmission: {}
        },
        apiSF: {
          createSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SF_CONTACT_SUCCESS",
              payload: { salesforce_id: "123" }
            })
          ),
          updateSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "UPDATE_SF_CONTACT_SUCCESS",
              payload: { salesforce_id: "123" }
            })
          ),
          lookupSFContact: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "LOOKUP_SF_CONTACT_SUCCESS",
              payload: { salesforce_id: "123" }
            })
          ),
          createSFOMA: jest.fn().mockImplementation(() =>
            Promise.resolve({
              type: "CREATE_SFOMA_SUCCESS",
              payload: { salesforce_id: "123" }
            })
          )
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          addSubmission: () =>
            Promise.resolve({
              type: "ADD_SUBMISSION_SUCCESS",
              payload: { id: 1 }
            })
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

      // expect snackbar NOT to be in document
      await waitFor(() => {
        expect(
          queryByTestId("component-basic-snackbar")
        ).not.toBeInTheDocument();
      });

      // expect employerId to be set to '0016100000WERGeAAP' (unknown)
      await waitFor(() => {
        expect(handleInputMock).toHaveBeenCalledWith({
          target: { name: "employerId", value: "0016100000WERGeAAP" }
        });
      });
    });
    // test("`prepForContact` handles PPL edge case", async function() {
    //   let props = {
    //     formValues: {
    //       ...formValues,
    //       employerName: "personal support worker (paid by ppl)"
    //     },
    //     submission: {
    //       ...defaultProps.submission,
    //       p4cReturnValues: {
    //         ...defaultProps.submission.p4cReturnValues,
    //         salesforceId: "123"
    //       },
    //       cape: {
    //         monthlyOptions: []
    //       }
    //     },
    //     createSFContact: jest.fn().mockImplementation(() =>
    //       Promise.resolve({
    //         type: "CREATE_SF_CONTACT_SUCCESS",
    //         payload: { salesforce_id: "123" }
    //       })
    //     ),
    //     updateSFContact: jest.fn().mockImplementation(() =>
    //       Promise.resolve({
    //         type: "UPDATE_SF_CONTACT_SUCCESS",
    //         payload: { salesforce_id: "123" }
    //       })
    //     ),
    //     lookupSFContact: jest.fn().mockImplementation(() =>
    //       Promise.resolve({
    //         type: "LOOKUP_SF_CONTACT_SUCCESS",
    //         payload: { salesforce_id: "123" }
    //       })
    //     ),
    //     apiSF: {
    //       ...defaultProps.apiSF,
    //       createSFContact: jest.fn().mockImplementation(() =>
    //         Promise.resolve({
    //           type: "CREATE_SF_CONTACT_SUCCESS",
    //           payload: { salesforce_id: "123" }
    //         })
    //       ),
    //       updateSFContact: jest.fn().mockImplementation(() =>
    //         Promise.resolve({
    //           type: "UPDATE_SF_CONTACT_SUCCESS",
    //           payload: { salesforce_id: "123" }
    //         })
    //       ),
    //       lookupSFContact: jest.fn().mockImplementation(() =>
    //         Promise.resolve({
    //           type: "LOOKUP_SF_CONTACT_SUCCESS",
    //           payload: { salesforce_id: null }
    //         })
    //       )
    //     },
    //   apiSubmission: {
    //       ...defaultProps.apiSubmission,
    //       addSubmission: jest.fn().mockImplementation(() =>
    //         Promise.resolve({
    //           type: "ADD_SUBMISSION_SUCCESS",
    //           payload: { submission_id: "123" }
    //         })
    //       ),
    //     },
    //   };
    //   // render app
    //   const user = userEvent.setup();
    //   const {
    //     getByTestId,
    //     queryByTestId,
    //     getByRole,
    //     getByLabelText,
    //     getByText,
    //     debug
    //   } = await setup(props);

    //   // check that spf renders
    //   await waitFor(() => {
    //     const spf = getByRole("form");
    //     expect(spf).toBeInTheDocument();
    //   });

    //   // simulate submit spf
    //   await waitFor(() => {
    //     const submitButton = getByTestId("button-submit");
    //     userEvent.click(submitButton);
    //   });

    //   // expect snackbar NOT to be in document
    //   await waitFor(() => {
    //     expect(
    //       queryByTestId("component-basic-snackbar")
    //     ).not.toBeInTheDocument();
    //   });

    //   // expect cape tab to render
    //   await waitFor(() => {
    //     const cape = getByTestId("component-cape");
    //     expect(cape).toBeInTheDocument();
    //   });
    // });
    // test("`prepForContact` handles PSW edge case", async function() {
    //   let props = {
    //     formValues: {
    //       ...formValues,
    //       employerName: "personal support worker (paid by state of oregon)"
    //     },
    //     submission: {
    //       ...defaultProps.submission,
    //       p4cReturnValues: {
    //         ...defaultProps.submission.p4cReturnValues,
    //         salesforceId: "123"
    //       },
    //       cape: {
    //         monthlyOptions: []
    //       }
    //     },          
    //     createSFContact: jest.fn().mockImplementation(() =>
    //       Promise.resolve({
    //         type: "CREATE_SF_CONTACT_SUCCESS",
    //         payload: { salesforce_id: "123" }
    //       })
    //     ),
    //     updateSFContact: jest.fn().mockImplementation(() =>
    //       Promise.resolve({
    //         type: "UPDATE_SF_CONTACT_SUCCESS",
    //         payload: { salesforce_id: "123" }
    //       })
    //     ),
    //     lookupSFContact: jest.fn().mockImplementation(() =>
    //       Promise.resolve({
    //         type: "LOOKUP_SF_CONTACT_SUCCESS",
    //         payload: { salesforce_id: "123" }
    //       })
    //     ),
    //     apiSF: {
    //       ...defaultProps.apiSF,
    //       createSFContact: jest.fn().mockImplementation(() =>
    //         Promise.resolve({
    //           type: "CREATE_SF_CONTACT_SUCCESS",
    //           payload: { salesforce_id: "123" }
    //         })
    //       ),
    //       updateSFContact: jest.fn().mockImplementation(() =>
    //         Promise.resolve({
    //           type: "UPDATE_SF_CONTACT_SUCCESS",
    //           payload: { salesforce_id: "123" }
    //         })
    //       ),
    //       lookupSFContact: jest.fn().mockImplementation(() =>
    //         Promise.resolve({
    //           type: "LOOKUP_SF_CONTACT_SUCCESS",
    //           payload: { salesforce_id: null }
    //         })
    //       )
    //     },
    //     apiSubmission: {
    //       ...defaultProps.apiSubmission,
    //       addSubmission: jest.fn().mockImplementation(() =>
    //         Promise.resolve({
    //           type: "ADD_SUBMISSION_SUCCESS",
    //           payload: { submission_id: "123" }
    //         })
    //       ),
    //     }
    //   };
    //   // render app
    //   const user = userEvent.setup();
    //   const {
    //     getByTestId,
    //     queryByTestId,
    //     getByRole,
    //     getByLabelText,
    //     getByText,
    //     debug
    //   } = await setup(props);

    //   // check that spf renders
    //   await waitFor(() => {
    //     const spf = getByRole("form");
    //     expect(spf).toBeInTheDocument();
    //   });

    //   // simulate submit spf
    //   await waitFor(() => {
    //     const submitButton = getByTestId("button-submit");
    //     userEvent.click(submitButton);
    //   });

    //   // expect tab2 to render
    //   await waitFor(() => {
    //     const cape = getByTestId("component-cape");
    //     expect(cape).toBeInTheDocument();
    //   });
    // });
    // test("`prepForContact` handles APD edge case", async function() {
    //   let props = {
    //     formValues: {
    //       ...formValues,
    //       employerName: "homecare worker (aging and people with disabilities)"
    //     },
    //     submission: {
    //       formPage1: {
    //         prefillEmployerId: null
    //       },
    //       p4cReturnValues: {
    //         ...defaultProps.submission.p4cReturnValues,
    //         salesforceId: "123"
    //       },
    //       cape: {
    //         monthlyOptions: []
    //       },
    //       employerObjects: [
    //         {
    //           attributes: {
    //             type: "Account",
    //             url: "/services/data/v42.0/sobjects/Account/0016100001UoJZVAA3"
    //           },
    //           Id: "0016100001UoJZVAA3",
    //           Name: "HEALTH LICENSING AGENCY",
    //           Sub_Division__c: "State",
    //           Parent: {
    //             attributes: {
    //               type: "Account",
    //               url:
    //                 "/services/data/v42.0/sobjects/Account/0016100000Kb1RQAAZ"
    //             },
    //             Id: "0016100000Kb1RQAAZ"
    //           },
    //           Agency_Number__c: 83300
    //         }
    //       ]
    //     },
    //     createSFContact: jest.fn().mockImplementation(() =>
    //       Promise.resolve({
    //         type: "CREATE_SF_CONTACT_SUCCESS",
    //         payload: { salesforce_id: "123" }
    //       })
    //     ),
    //     updateSFContact: jest.fn().mockImplementation(() =>
    //       Promise.resolve({
    //         type: "UPDATE_SF_CONTACT_SUCCESS",
    //         payload: { salesforce_id: "123" }
    //       })
    //     ),
    //     lookupSFContact: jest.fn().mockImplementation(() =>
    //       Promise.resolve({
    //         type: "LOOKUP_SF_CONTACT_SUCCESS",
    //         payload: { salesforce_id: "123" }
    //       })
    //     ),
    //     apiSubmission: {
    //       ...defaultProps.apiSubmission,
    //       addSubmission: jest.fn().mockImplementation(() =>
    //         Promise.resolve({
    //           type: "ADD_SUBMISSION_SUCCESS",
    //           payload: { submission_id: "123" }
    //         })
    //       ),
    //     },
    //     apiSF: {
    //       ...defaultProps.apiSF,
    //       createSFContact: jest.fn().mockImplementation(() =>
    //         Promise.resolve({
    //           type: "CREATE_SF_CONTACT_SUCCESS",
    //           payload: { salesforce_id: "123" }
    //         })
    //       ),
    //       updateSFContact: jest.fn().mockImplementation(() =>
    //         Promise.resolve({
    //           type: "UPDATE_SF_CONTACT_SUCCESS",
    //           payload: { salesforce_id: "123" }
    //         })
    //       ),
    //       lookupSFContact: jest.fn().mockImplementation(() =>
    //         Promise.resolve({
    //           type: "LOOKUP_SF_CONTACT_SUCCESS",
    //           payload: { salesforce_id: null }
    //         })
    //       )
    //     }
    //   };
    //   // render app
    //   const user = userEvent.setup();
    //   const {
    //     getByTestId,
    //     queryByTestId,
    //     getByRole,
    //     getByLabelText,
    //     getByText,
    //     debug
    //   } = await setup(props);

    //   // check that spf renders
    //   await waitFor(() => {
    //     const spf = getByRole("form");
    //     expect(spf).toBeInTheDocument();
    //   });

    //   // simulate submit spf
    //   await waitFor(() => {
    //     const submitButton = getByTestId("button-submit");
    //     userEvent.click(submitButton);
    //   });

    //   // expect tab2 to render
    //   await waitFor(() => {
    //     const cape = getByTestId("component-cape");
    //     expect(cape).toBeInTheDocument();
    //   });
    // });
  });
});
