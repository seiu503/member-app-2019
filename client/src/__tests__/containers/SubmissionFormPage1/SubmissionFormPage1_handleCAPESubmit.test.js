import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
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
import moment from "moment";
import "jest-canvas-mock";
import * as formElements from "../../../components/SubmissionFormElements";
import { employersPayload, storeFactory } from "../../../utils/testUtils";
import {
  generateSampleSubmission,
  generateCAPEValidateFrontEnd
} from "../../../../../app/utils/fieldConfigs.js";

import { SubmissionFormPage1Container } from "../../../containers/SubmissionFormPage1";

import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../../../styles/theme";

let store, handleErrorMock;

let pushMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  executeMock = jest.fn().mockImplementation(() => Promise.resolve());

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
  .mockImplementation(() => Promise.resolve(0.9));

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

let updateSFCAPESuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_CAPE_SUCCESS" })
  );

let updateSFCAPEError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_CAPE_FAILURE" })
  );

global.scrollTo = jest.fn();

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
    createSFCAPE: () => Promise.resolve({ type: "CREATE_SF_CAPE_SUCCESS " }),
    updateSFContact: updateSFContactSuccess,
    createSFContact: createSFContactSuccess,
    lookupSFContact: lookupSFContactSuccess
  },
  apiSubmission: {
    handleInput: handleInputMock,
    clearForm: clearFormMock,
    setCAPEOptions: jest.fn(),
    addSubmission: () => Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
  },
  lookupSFContact: lookupSFContactSuccess,
  createSFContact: createSFContactSuccess,
  updateSFContact: updateSFContactSuccess,
  history: {
    push: pushMock
  },
  recaptcha: {
    execute: executeMock
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
  translate: jest.fn(),
  cape_legal: {
    current: {
      innerHTML: "cape"
    }
  },
  handleError: jest.fn(),
  openSnackbar: jest.fn(),
  headline: { id: 1 },
  body: { id: 1 },
  renderHeadline: jest.fn(),
  renderBodyCopy: jest.fn(),
  tab: 3,
  displayCAPEPaymentFields: true
};

const initialState = {
  appState: {
    loading: false
  },
  submission: {
    formPage1: {
      reCaptchaValue: ""
    },
    allSubmissions: [{ key: "value" }],
    employerObjects: [...employersPayload]
  }
};

store = storeFactory(initialState);

const setup = async (props = {}, route = "/?cape=true") => {
  const setupProps = {
    ...defaultProps,
    ...props
  };
  return render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <SubmissionFormPage1Container {...setupProps} />
        </MemoryRouter>
      </Provider>
    </ThemeProvider>
  );
};

describe("<SubmissionFormPage1Container /> unconnected", () => {
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

    test("`handleCAPESubmit` displays thank you message (!capeid case)", async () => {
      let lookupSFContactSuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "LOOKUP_SF_CONTACT_SUCCESS",
          payload: { salesforce_id: "123" }
        })
      );

      let verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(0.9));

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

      let updateSFCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SF_CAPE_SUCCESS" })
        );

      formElements.handleError = jest.fn();

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
          capeAmount: 10,
          capeAmountOther: undefined,
          donationFrequency: "One-Time"
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true
          },
          salesforceId: null,
          payment: {
            memberShortId: null
          },
          cape: {
            id: undefined,
            memberShortId: "123"
          }
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess,
          updateSFCAPE: updateSFCAPESuccess
        },
        apiSubmission: {
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn(),
        tab: 3,
        displayCAPEPaymentFields: true
      };

      // add mock function to props
      props = {
        verifyRecaptchaScore: verifyRecaptchaScoreMock,
        history: {
          push: pushMock
        }
      };

      // simulate user click 'Next'
      const user = userEvent.setup();
      const { getByTestId, getByRole, debug } = await setup({ ...props });
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that submit button renders
      waitFor(() => {
        const submitButton = getByTestId("button-submit");
        expect(submitButton).toBeInTheDocument();
      });

      // imported function that creates dummy data for form
      let testData = generateCAPEValidateFrontEnd();

      // simulate CAPE submit
      await fireEvent.submit(getByTestId("cape-form"), { ...testData });

      // expect screen to display thankyou message
      waitFor(() => {
        expect(
          screen.getByText("Your information has been submitted.")
        ).toBeInTheDocument();
      });
    });

    test("`handleCAPESubmit` handles error if recaptcha verification fails", async () => {
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(0.1));
      formElements.handleError = jest.fn();

      // add mock function to props
      let props = {
        verifyRecaptchaScore: verifyRecaptchaScoreMock
      };

      // simulate user click 'Next'
      const user = userEvent.setup();
      const { getByTestId, getByRole, debug } = await setup({ ...props });
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that submit button renders
      waitFor(() => {
        const submitButton = getByTestId("button-submit");
        expect(submitButton).toBeInTheDocument();
      });

      // imported function that creates dummy data for form
      let testData = generateCAPEValidateFrontEnd();

      // simulate CAPE submit
      await fireEvent.submit(getByTestId("cape-form"), { ...testData });

      // expect handleError to have been called
      waitFor(() => {
        expect(formElements.handleError).toHaveBeenCalled();
      });
    });

    test("`handleCAPESubmit` handles error if lookupSFContact prop throws", async () => {
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(0.9));
      formElements.handleError = jest.fn();
      lookupSFContactError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "LOOKUP_SF_CONTACT_FAILURE" })
        );
      updateCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" })
        );

      // add mock function to props
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true
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
          createCAPE: createCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn(),
        verifyRecaptchaScore: verifyRecaptchaScoreMock
      };

      // simulate user click 'Next'
      const user = userEvent.setup();
      const { getByTestId, getByRole, debug } = await setup({ ...props });
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that submit button renders
      waitFor(() => {
        const submitButton = getByTestId("button-submit");
        expect(submitButton).toBeInTheDocument();
      });

      // imported function that creates dummy data for form
      let testData = generateCAPEValidateFrontEnd();

      // simulate CAPE submit
      await fireEvent.submit(getByTestId("cape-form"), { ...testData });

      // expect handleError to have been called
      waitFor(() => {
        expect(formElements.handleError).toHaveBeenCalled();
      });
    });

    test("`handleCAPESubmit` handles error if createSFCape prop fails", async () => {
      formElements.handleError = jest.fn();
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(0.9));
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
          createCAPE: createCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      // simulate user click 'Next'
      const user = userEvent.setup();
      const { getByTestId, getByRole, debug } = await setup({ ...props });
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that submit button renders
      waitFor(() => {
        const submitButton = getByTestId("button-submit");
        expect(submitButton).toBeInTheDocument();
      });

      // imported function that creates dummy data for form
      let testData = generateCAPEValidateFrontEnd();

      // simulate CAPE submit
      await fireEvent.submit(getByTestId("cape-form"), { ...testData });

      // expect handleError to have been called
      waitFor(() => {
        expect(formElements.handleError).toHaveBeenCalled();
      });
    });

    test("`handleCAPESubmit` handles error if createSFCape prop throws", async () => {
      formElements.handleError = jest.fn();
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
        .mockImplementation(() =>
          Promise.reject({ type: "CREATE_SF_CAPE_FAILURE" })
        );
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
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      // simulate user click 'Next'
      const user = userEvent.setup();
      const { getByTestId, getByRole, debug } = await setup({ ...props });
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that submit button renders
      waitFor(() => {
        const submitButton = getByTestId("button-submit");
        expect(submitButton).toBeInTheDocument();
      });

      // imported function that creates dummy data for form
      let testData = generateCAPEValidateFrontEnd();

      // simulate CAPE submit
      await fireEvent.submit(getByTestId("cape-form"), { ...testData });

      // expect handleError to have been called
      waitFor(() => {
        expect(formElements.handleError).toHaveBeenCalled();
      });
    });

    test("`handleCAPESubmit` handles error if createCAPE prop fails", async () => {
      formElements.handleError = jest.fn();
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(0.9));
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
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_CAPE_FAILURE" })
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
          cape: {}
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess
        },
        apiSubmission: {
          createCAPE: createCAPEError,
          updateCAPE: updateCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      // simulate user click 'Next'
      const user = userEvent.setup();
      const { getByTestId, getByRole, debug } = await setup({ ...props });
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that submit button renders
      waitFor(() => {
        const submitButton = getByTestId("button-submit");
        expect(submitButton).toBeInTheDocument();
      });

      // imported function that creates dummy data for form
      let testData = generateCAPEValidateFrontEnd();

      // simulate CAPE submit
      await fireEvent.submit(getByTestId("cape-form"), { ...testData });

      // expect handleError to have been called
      waitFor(() => {
        expect(formElements.handleError).toHaveBeenCalled();
      });
    });

    test("`handleCAPESubmit` handles error if createCAPE prop throws", async () => {
      formElements.handleError = jest.fn();
      updateCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" })
        );
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(0.9));
      createSFCAPESuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_CAPE_SUCCESS",
          payload: { sf_cape_id: 123 }
        })
      );
      createCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "CREATE_CAPE_FAILURE" })
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
          createCAPE: createCAPEError,
          updateCAPE: updateCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      // simulate user click 'Next'
      const user = userEvent.setup();
      const { getByTestId, getByRole, debug } = await setup({ ...props });
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that submit button renders
      waitFor(() => {
        const submitButton = getByTestId("button-submit");
        expect(submitButton).toBeInTheDocument();
      });

      // imported function that creates dummy data for form
      let testData = generateCAPEValidateFrontEnd();

      // simulate CAPE submit
      await fireEvent.submit(getByTestId("cape-form"), { ...testData });

      // expect handleError to have been called
      waitFor(() => {
        expect(formElements.handleError).toHaveBeenCalled();
      });
    });

    test("`handleCAPESubmit` handles error if updateCAPE prop throws", async () => {
      handleErrorMock = jest.fn();
      formElements.handleError = handleErrorMock;
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
        .mockImplementation(() => Promise.resolve(0.9));
      updateCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "UPDATE_CAPE_FAILURE" })
        );
      createSFCAPESuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_CAPE_SUCCESS",
          payload: { sf_cape_id: 123 }
        })
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
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPEError
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      // simulate user click 'Next'
      const user = userEvent.setup();
      const { getByTestId, getByRole, debug } = await setup({ ...props });
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that submit button renders
      waitFor(() => {
        const submitButton = getByTestId("button-submit");
        expect(submitButton).toBeInTheDocument();
      });

      // imported function that creates dummy data for form
      let testData = generateCAPEValidateFrontEnd();

      // simulate CAPE submit
      await fireEvent.submit(getByTestId("cape-form"), { ...testData });

      // expect handleError to have been called
      waitFor(() => {
        expect(formElements.handleError).toHaveBeenCalled();
      });
    });

    test("`handleCAPESubmit` handles error if updateSFCAPE prop throws", async () => {
      createCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_CAPE_SUCCESS" })
        );

      createCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_CAPE_FAILURE" })
        );
      handleErrorMock = jest.fn();
      formElements.handleError = handleErrorMock;
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(0.9));
      updateSFCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "UPDATE_SF_CAPE_FAILURE" })
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

      updateCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_FAILURE" })
        );
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
            memberShortId: "123"
          },
          cape: {
            id: undefined,
            oneTimePaymentId: "123"
          }
        },
        apiSF: {
          ...defaultProps.apiSF,
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess,
          updateSFCAPE: updateSFCAPEError
        },
        apiSubmission: {
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      // simulate user click 'Next'
      const user = userEvent.setup();
      const { getByTestId, getByRole, debug } = await setup({ ...props });
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that submit button renders
      waitFor(() => {
        const submitButton = getByTestId("button-submit");
        expect(submitButton).toBeInTheDocument();
      });

      // imported function that creates dummy data for form
      let testData = generateCAPEValidateFrontEnd();

      // simulate CAPE submit
      await fireEvent.submit(getByTestId("cape-form"), { ...testData });

      // expect handleError to have been called
      waitFor(() => {
        expect(formElements.handleError).toHaveBeenCalled();
      });
    });

    test("`handleCAPESubmit` handles error if updateSFCAPE prop fails", async () => {
      handleErrorMock = jest
        .fn()
        .mockImplementation(() => console.log("handleError"));
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(0.9));
      formElements.handleError = handleErrorMock;
      updateCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" })
        );
      updateSFCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SF_CAPE_FAILURE" })
        );
      createSFCAPESuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_CAPE_SUCCESS",
          payload: { sf_cape_id: 123 }
        })
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
          cape: {
            id: undefined,
            activeMethodLast4: "1234"
          }
        },
        apiSF: {
          ...defaultProps.apiSF,
          updateSFCAPE: updateSFCAPEError,
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess
        },
        apiSubmission: {
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      // simulate user click 'Next'
      const user = userEvent.setup();
      const { getByTestId, getByRole, debug } = await setup({ ...props });
      const nextButton = getByTestId("button-next");
      await userEvent.click(nextButton);

      // check that submit button renders
      waitFor(() => {
        const submitButton = getByTestId("button-submit");
        expect(submitButton).toBeInTheDocument();
      });

      // imported function that creates dummy data for form
      let testData = generateCAPEValidateFrontEnd();

      // simulate CAPE submit
      await fireEvent.submit(getByTestId("cape-form"), { ...testData });

      // expect handleError to have been called
      waitFor(() => {
        expect(formElements.handleError).toHaveBeenCalled();
      });
    });

    test("`handleCAPESubmit` redirects to thankyou page if standalone", async () => {
      formElements.handleError = jest.fn();
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
          createSFCAPE: createSFCAPESuccess,
          updateSFCAPE: updateSFCAPESuccess
        },
        apiSubmission: {
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn(),
        history: {},
        openSnackbar: jest.fn()
      };

      // add mock function to props
      props = {
        verifyRecaptchaScore: verifyRecaptchaScoreMock,
        history: {
          push: pushMock
        }
      };

      // simulate component render
      const { getByTestId } = await setup();

      // imported function that creates dummy data for form
      let testData = generateCAPEValidateFrontEnd();

      // simulate CAPE submit
      await fireEvent.submit(getByTestId("cape-form"), { ...testData });

      // expect the mock to have been called with arguments
      waitFor(() => {
        expect(pushMock).lastCalledWith("/thankyou/?cape=true");
      });

      // restore mock
      pushMock.mockRestore();
    });
  });
});
