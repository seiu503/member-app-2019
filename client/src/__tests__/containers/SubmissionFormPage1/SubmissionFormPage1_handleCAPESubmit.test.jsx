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
import moment from "moment";
import * as formElements from "../../../components/SubmissionFormElements";
import { employersPayload, storeFactory } from "../../../utils/testUtils";
import {
  generateSampleSubmission,
  generateCAPEValidateFrontEnd
} from "../../../../../app/utils/fieldConfigs.js";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../translations/i18n";

import { SubmissionFormPage1Container } from "../../../containers/SubmissionFormPage1";

import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../../../styles/theme";

let store, handleErrorMock;

let navigate = jest.fn().mockImplementation(() => Promise.resolve({})),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  handleInputSPFMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  executeMock = jest
    .fn()
    .mockImplementation(() => Promise.resolve({ token: "123" }));

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

let verifyRecaptchaScoreMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ payload: {score: 0.9 }}));

let createSFCAPESuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "CREATE_SF_CAPE_SUCCESS",
    payload: { sf_cape_id: 123 }
  })
);

let createSFCAPEError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "CREATE_SF_CAPE_FAILURE" })
  );

let createCAPESuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "CREATE_CAPE_SUCCESS" }));

let createCAPEError = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "CREATE_CAPE_FAILURE" }));

let updateCAPESuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" }));

let updateCAPEError = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "UPDATE_CAPE_FAILURE" }));

handleErrorMock = jest.fn();

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
  employerType: "state agency",
  employerName: "Health Licensing Agency",
  mobilePhone: "1234567890",
  mm: "01",
  dd: "01",
  yyyy: "1999",
  preferredLanguage: "English",
  capeAmount: 1,
  jobTitle: "jobTitle"
};

const defaultProps = {
  submission: {
    error: null,
    loading: false,
    formPage1: {
      signature: "",
      reCaptchaValue: "123"
    },
    cape: {
      monthlyOptions: []
    },
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
    salesforceId: "123",
    employerObjects: [...employersPayload]
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
    createSFCAPE: () => Promise.resolve({ type: "CREATE_SF_CAPE_SUCCESS " }),
    updateSFContact: updateSFContactSuccess,
    createSFContact: createSFContactSuccess,
    lookupSFContact: lookupSFContactSuccess
  },
  apiSubmission: {
    handleInput: handleInputMock,
    handleInputSPF: handleInputSPFMock,
    clearForm: clearFormMock,
    setCAPEOptions: jest.fn(),
    addSubmission: () => Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
  },
  lookupSFContact: lookupSFContactSuccess,
  createSFContact: createSFContactSuccess,
  updateSFContact: updateSFContactSuccess,
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
  t: jest.fn(),
  cape_legal: {
    current: {
      innerHTML: "cape"
    }
  },
  handleError: handleErrorMock,
  openSnackbar: jest.fn(),
  headline: { id: 1 },
  body: { id: 1 },
  renderHeadline: jest.fn(),
  renderBodyCopy: jest.fn(),
  tab: 2,
  displayCAPEPaymentFields: true
};

const initialState = {
  appState: {
    loading: false
  },
  submission: {
    formPage1: {
      reCaptchaValue: "",
      ...formValues
    },
    allSubmissions: [{ key: "value" }],
    employerObjects: [...employersPayload],
    cape: {
      monthlyOptions: []
    },
    salesforceId: "123"
  }
};

store = storeFactory(initialState);
let handleSubmit = fn => fn;
let onSubmit = jest.fn();
let windowSpy;

const setup = async (props = {}, route = "/") => {
  const setupProps = {
    ...defaultProps,
    ...props,
    handleSubmit
  };
  return render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <I18nextProvider i18n={i18n} defaultNS={"translation"}>
          <MemoryRouter initialEntries={[route]}>
            <SubmissionFormPage1Container {...setupProps} />
          </MemoryRouter>
        </I18nextProvider>
      </Provider>
    </ThemeProvider>
  );
};

describe("<SubmissionFormPage1Container /> handleCAPESubmit1", () => {
  beforeEach(() => {
    // console.log = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  afterAll(() => {
    jest.restoreAllMocks();
    cleanup();
  })

  describe("handleCAPESubmit", () => {
    beforeEach(() => {
      handleErrorMock = jest.fn();
    });
    afterEach(() => {
      createCAPESuccess.mockClear();
    });

    test("`handleCAPESubmit` redirects to page 2 after successful submit (!capeid case)", async () => {
      let lookupSFContactSuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "LOOKUP_SF_CONTACT_SUCCESS",
          payload: { salesforce_id: "123" }
        })
      );

      let verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ payload: {score: 0.9 }}));

      let createSFCAPESuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_CAPE_SUCCESS",
          payload: { sf_cape_id: 123 }
        })
      );

      let createCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_CAPE_SUCCESS" })
        );

      let updateCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" })
        );

      createCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_CAPE_SUCCESS" })
        );
      createSFCAPESuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_CAPE_SUCCESS",
          payload: { sf_cape_id: 123 }
        })
      );
      updateCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" })
        );
      let props = {
        formValues: {
          ...formValues,
          capeAmount: 10,
          capeAmountOther: undefined,
          donationFrequency: "One-Time"
        },
        submission: {
          ...defaultProps.submission,
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true,
            ...formValues
          },
          salesforceId: "123",
          submissionId: "456",
          payment: {
            memberShortId: null
          },
          cape: {
            id: undefined,
            memberShortId: "123"
          },
          employerObjects: [...employersPayload]
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPESuccess,
          handleInput: handleInputMock
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn(),
        tab: 2,
        displayCAPEPaymentFields: true,
        verifyRecaptchaScore: verifyRecaptchaScoreMock,
        history: {},
        navigate
      };

      // setup
      // const user = await userEvent.setup();
      const { getByTestId } = await setup(props);

      // mock recaptcha
      document.addEventListener("DOMContentLoaded", () => {
        console.log('DOMContentLoaded');
        windowSpy = jest.spyOn(globalThis, "window", "grecaptcha");
        windowSpy.mockImplementation(() => ({
          enterprise: {
            execute: jest.fn().mockImplementation(() => {
              Promise.resolve("token")
            })
          },
        }));
      });

      const cape = await getByTestId("cape-form");

      // simulate submit
      await fireEvent.submit(cape);

      // expect redirect to page 2
      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith(`/page2/?cId=123&sId=456`);
      });
    });

    test("`handleCAPESubmit` handles error if recaptcha verification fails", async () => {
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.reject("reCaptchaError"));

      // add mock function to props
      let props = {
        ...defaultProps,
        verifyRecaptchaScore: verifyRecaptchaScoreMock,
        location: {
          search: "?cape=true"
        },
        recaptcha: {
          current: {
            execute: executeMock
          }
        },
        submission: {
          ...defaultProps.submission,
          formPage1: {
            ...defaultProps.submission.formPage1,
            reCaptchaValue: "token"
          }
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPESuccess,
          handleInput: handleInputMock,
          verify: verifyRecaptchaScoreMock
        },
        handleError: handleErrorMock,
        t: text => text
      };

      // setup
      const user = await userEvent.setup();
      const { queryByTestId, getByTestId } = await setup(props, "/?cape=true");
      const cape = await getByTestId("cape-form");

      // mock console err to see if error is logged to console
      const consoleErrorMock = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // mock recaptcha
      document.addEventListener("DOMContentLoaded", () => {
        console.log('DOMContentLoaded');
        windowSpy = jest.spyOn(globalThis, "window", "grecaptcha");
        windowSpy.mockImplementation(() => ({
          enterprise: {
            execute: jest.fn().mockImplementation(() => {
              Promise.reject(new Error("reCaptchaError"))
            })
          },
        }));
      });

      // simulate submit
      await fireEvent.submit(cape);

      // error is not returned to client here, so just check if it is logged to console instead
      await waitFor(() => {
        // console.log('handleErrorMockLastCall');
        // console.log(handleErrorMock.mock.lastCall)
        // expect(handleErrorMock).not.toHaveBeenCalled();
        expect(consoleErrorMock).toHaveBeenCalledWith("recaptcha failed: undefined");
      });

      // restore mock
      consoleErrorMock.mockRestore();

    });

    test("`handleCAPESubmit` handles error if lookupSFContact prop throws", async () => {
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ payload: {score: 0.9 }}));

      lookupSFContactError = jest
        .fn()
        .mockImplementation(() => Promise.reject("lookupSFContactError"));
      updateCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" })
        );

      // add mock function to props
      let props = {
        ...defaultProps,
        formValues: {
          ...formValues,
          capeAmount: 10
        },
        submission: {
          ...defaultProps.submission,
          formPage1: {
            ...defaultProps.submission.formPage1,
            paymentRequired: true,
            paymentMethodAdded: true,
            reCaptchaValue: "token"
          },
          salesforceId: null,
          payment: {
            memberShortId: "123"
          }
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: lookupSFContactError,
          createSFCAPE: createSFCAPESuccess
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPESuccess,
          handleInput: handleInputMock,
          verify: verifyRecaptchaScoreMock
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn(),
        verifyRecaptchaScore: verifyRecaptchaScoreMock,
        handleError: handleErrorMock,
        lookupSFContact: lookupSFContactError,
        history: {},
        navigate
      };

      // setup
      const user = await userEvent.setup();
      const { queryByTestId, getByTestId } = await setup(props, "/?cape=true");
      const cape = await getByTestId("cape-form");

      // mock recaptcha
      document.addEventListener("DOMContentLoaded", () => {
        console.log('DOMContentLoaded');
        windowSpy = jest.spyOn(globalThis, "window", "grecaptcha");
        windowSpy.mockImplementation(() => ({
          enterprise: {
            execute: jest.fn().mockImplementation(() => {
              Promise.resolve("token")
            })
          },
        }));
      });

      // simulate submit
      await fireEvent.submit(cape);

      // expect handleError to have been called
      await waitFor(() => {
        expect(handleErrorMock).toHaveBeenCalledWith("lookupSFContactError");
      });
    });

    test("`handleCAPESubmit` handles error if createSFCape prop fails", async () => {
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ payload: {score: 0.9 }}));
      createCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_CAPE_SUCCESS" })
        );
      createSFCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SF_CAPE_FAILURE" })
        );
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true
          },
          salesforceId: "123",
          payment: {
            memberShortId: "123"
          },
          error: "Error"
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPEError
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPESuccess,
          handleInput: handleInputMock,
          verify: verifyRecaptchaScoreMock
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn(),
        handleError: handleErrorMock,
        history: {},
        navigate
      };

      // setup
      const user = await userEvent.setup();
      const { queryByTestId, getByTestId } = await setup(props, "/?cape=true");
      const cape = await getByTestId("cape-form");

      // mock recaptcha
      document.addEventListener("DOMContentLoaded", () => {
        console.log('DOMContentLoaded');
        windowSpy = jest.spyOn(globalThis, "window", "grecaptcha");
        windowSpy.mockImplementation(() => ({
          enterprise: {
            execute: jest.fn().mockImplementation(() => {
              Promise.resolve("token")
            })
          },
        }));
      });

      // simulate submit
      await fireEvent.submit(cape);

      // expect handleError to have been called
      await waitFor(() => {
        expect(handleErrorMock).toHaveBeenCalled();
      });
    });
  });
});

describe("<SubmissionFormPage1Container /> handleCAPESubmit2", () => {
  beforeEach(() => {
    // console.log = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("handleCAPESubmit", () => {
    beforeEach(() => {
      handleErrorMock = jest.fn();
    });
    afterEach(() => {
      createCAPESuccess.mockClear();
    });

    test("`handleCAPESubmit` handles error if createSFCape prop throws", async () => {
      createCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_CAPE_SUCCESS" })
        );
      updateCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" })
        );
      createSFCAPEError = jest
        .fn()
        .mockImplementation(() => Promise.reject("createSFCAPEError"));
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true,
            donationFrequency: "One-Time"
          },
          salesforceId: "123",
          payment: {
            memberShortId: null
          },
          cape: {
            memberShortId: "123"
          }
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPEError
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPESuccess,
          handleInput: handleInputMock,
          verify: verifyRecaptchaScoreMock
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn(),
        handleError: handleErrorMock,
        history: {},
        navigate
      };

      // setup
      const user = await userEvent.setup();
      const { queryByTestId, getByTestId } = await setup(props, "/?cape=true");
      const cape = await getByTestId("cape-form");

      // mock recaptcha
      document.addEventListener("DOMContentLoaded", () => {
        console.log('DOMContentLoaded');
        windowSpy = jest.spyOn(globalThis, "window", "grecaptcha");
        windowSpy.mockImplementation(() => ({
          enterprise: {
            execute: jest.fn().mockImplementation(() => {
              Promise.resolve("token")
            })
          },
        }));
      });

      // simulate submit
      await fireEvent.submit(cape);

      // expect handleError to have been called
      await waitFor(() => {
        expect(handleErrorMock).toHaveBeenCalledWith("createSFCAPEError");
      });
    });

    test("`handleCAPESubmit` handles error if createCAPE prop fails", async () => {
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ payload: {score: 0.9 }}));
      updateCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" })
        );
      createSFCAPESuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_CAPE_SUCCESS",
          payload: { sf_cape_id: 123 }
        })
      );
      createCAPEError = jest
        .fn()
        .mockImplementation(() => Promise.resolve("createCAPEError"));
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true
          },
          salesforceId: "123",
          payment: {
            memberShortId: "123"
          },
          cape: {},
          error: "createCAPEError"
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          createCAPE: createCAPEError,
          updateCAPE: updateCAPESuccess,
          handleInput: handleInputMock,
          verify: verifyRecaptchaScoreMock
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn(),
        handleError: handleErrorMock,
        createCAPE: createCAPEError,
        history: {},
        navigate,
        verifyRecaptchaScore: verifyRecaptchaScoreMock,
      };

      // setup
      const user = await userEvent.setup();
      const { queryByTestId, getByTestId } = await setup(props);
      const cape = await getByTestId("cape-form");

      // mock recaptcha
      document.addEventListener("DOMContentLoaded", () => {
        console.log('DOMContentLoaded');
        windowSpy = jest.spyOn(globalThis, "window", "grecaptcha");
        windowSpy.mockImplementation(() => ({
          enterprise: {
            execute: jest.fn().mockImplementation(() => {
              Promise.resolve("token")
            })
          },
        }));
      });

      // simulate submit
      await fireEvent.submit(cape);

      // expect handleError to have been called
      await waitFor(() => {
        expect(handleErrorMock).toHaveBeenCalledWith("createCAPEError");
      });
    });

    test("`handleCAPESubmit` handles error if createCAPE prop throws", async () => {
      updateCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" })
        );
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ payload: {score: 0.9 }}));
      createSFCAPESuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_CAPE_SUCCESS",
          payload: { sf_cape_id: 123 }
        })
      );
      createCAPEError = jest
        .fn()
        .mockImplementation(() => Promise.reject("createCAPEError"));
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true
          },
          salesforceId: "123",
          payment: {
            memberShortId: "123"
          },
          cape: {
            id: undefined
          }
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          createCAPE: createCAPEError,
          updateCAPE: updateCAPESuccess,
          handleInput: handleInputMock,
          verify: verifyRecaptchaScoreMock
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn(),
        handleError: handleErrorMock,
        history: {},
        navigate,
        verifyRecaptchaScore: verifyRecaptchaScoreMock,
      };

      // setup
      const user = await userEvent.setup();
      const { queryByTestId, getByTestId } = await setup(props, "/?cape=true");
      const cape = await getByTestId("cape-form");

      // mock recaptcha
      document.addEventListener("DOMContentLoaded", () => {
        console.log('DOMContentLoaded');
        windowSpy = jest.spyOn(globalThis, "window", "grecaptcha");
        windowSpy.mockImplementation(() => ({
          enterprise: {
            execute: jest.fn().mockImplementation(() => {
              Promise.resolve("token")
            })
          },
        }));
      });

      // simulate submit
      await fireEvent.submit(cape);

      // expect handleError to have been called
      await waitFor(() => {
        expect(handleErrorMock).toHaveBeenCalledWith("createCAPEError");
      });
    });

    test("`handleCAPESubmit` handles error if updateCAPE prop throws", async () => {
      createCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_CAPE_SUCCESS" })
        );
      updateCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" })
        );
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ payload: {score: 0.9 }}));
      updateCAPEError = jest
        .fn()
        .mockImplementation(() => Promise.reject("updateCAPEError"));
      createSFCAPESuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_CAPE_SUCCESS",
          payload: { sf_cape_id: 123 }
        })
      );
      handleErrorMock = jest
        .fn()
        .mockImplementation(err =>
          console.log("handleErrorMockIsBeingCalledHere...", err)
        );
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true,
            reCaptchaValue: "123"
          },
          salesforceId: "123",
          payment: {
            memberShortId: "123"
          },
          cape: {
            id: undefined
          }
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPEError,
          handleInput: handleInputMock,
          verify: verifyRecaptchaScoreMock
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn(),
        handleError: handleErrorMock,
        updateCAPE: updateCAPEError,
        history: {},
        navigate,
        verifyRecaptchaScore: verifyRecaptchaScoreMock
      };

      // setup
      const user = await userEvent.setup();
      const { queryByTestId, getByTestId } = await setup(props, "/?cape=true");
      const cape = await getByTestId("cape-form");

      // mock console err to see if error is logged to console
      const consoleErrorMock = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // mock recaptcha
      document.addEventListener("DOMContentLoaded", () => {
        console.log('DOMContentLoaded');
        windowSpy = jest.spyOn(globalThis, "window", "grecaptcha");
        windowSpy.mockImplementation(() => ({
          enterprise: {
            execute: jest.fn().mockImplementation(() => {
              Promise.resolve("token")
            })
          },
        }));
      });

      // simulate submit
        await fireEvent.submit(cape);

        // expect handleError NOT to have been called, only logged to console
        await waitFor(() => {
          // console.log('handleErrorMockLastCall');
          // console.log(handleErrorMock.mock.lastCall)
          expect(handleErrorMock).not.toHaveBeenCalled();
          expect(consoleErrorMock).toHaveBeenCalledWith("updateCAPEError");
        });

        // restore mock
        consoleErrorMock.mockRestore();
      });

    test("`handleCAPESubmit` redirects to thankyou page if standalone", async () => {
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true
          },
          salesforceId: "123",
          payment: {
            memberShortId: "123"
          },
          cape: {
            id: "234"
          }
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPESuccess,
          handleInput: handleInputMock,
          verify: verifyRecaptchaScoreMock
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn(),
        location: {
          search: "&cape=true"
        },
        recaptcha: {
          current: {
            execute: executeMock
          }
        },
        openSnackbar: jest.fn(),
        handleError: handleErrorMock,
        verifyRecaptchaScore: verifyRecaptchaScoreMock,
        history: {},
        navigate
      };

      // setup
      const user = await userEvent.setup();
      const { queryByTestId, getByTestId } = await setup(props, "/?cape=true");
      const cape = await getByTestId("cape-form");

      // mock recaptcha
      document.addEventListener("DOMContentLoaded", () => {
        console.log('DOMContentLoaded');
        windowSpy = jest.spyOn(globalThis, "window", "grecaptcha");
        windowSpy.mockImplementation(() => ({
          enterprise: {
            execute: jest.fn().mockImplementation(() => {
              Promise.resolve("token")
            })
          },
        }));
      });

      // simulate submit
      await fireEvent.submit(cape);

      // expect the mock to have been called with arguments
      await waitFor(() => {
        expect(navigate).lastCalledWith("/thankyou/?cape=true");
      });

      // restore mock
      navigate.mockRestore();
    });
  });
});
