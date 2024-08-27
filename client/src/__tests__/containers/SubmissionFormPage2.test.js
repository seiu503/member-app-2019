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
import * as formElements from "../../components/SubmissionFormElements";
import { employersPayload, storeFactory } from "../../utils/testUtils";
import {
  generateSampleSubmission,
  generateCAPEValidateFrontEnd
} from "../../../../app/utils/fieldConfigs.js";
import {
  I18nextProvider,
  useTranslation,
  withTranslation
} from "react-i18next";
import i18n from "../../translations/i18n";

import { SubmissionFormPage2Container } from "../../containers/SubmissionFormPage2";

import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../../styles/theme";
import { setupServer } from "msw/node";
import handlers from "../../mocks/handlers";

let store,
  handleErrorMock = jest.fn();
const server = setupServer(...handlers);

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
  Wmm: "12",
  Wdd: "01",
  Wyyyy: "1999",
  preferredLanguage: "English",
  textAuthOptOut: false
};

const defaultProps = {
  submission: {
    error: null,
    loading: false,
    formPage1: {
      signature: "",
      paymentRequired: false
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
  t: text => text,
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
          <I18nextProvider i18n={i18n} defaultNS={"translation"}>
            <SubmissionFormPage2Container {...setupProps} />
          </I18nextProvider>
        </MemoryRouter>
      </Provider>
    </ThemeProvider>
  );
};

describe("<SubmissionFormPage2Container /> unconnected", () => {
  beforeEach(() => {
    let handleSubmit = fn => fn;
  });

  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe("render", () => {
    it("renders without error", async () => {
      const { getByTestId } = await setup();
      const component = getByTestId("component-submissionformpage2");
      expect(component).toBeInTheDocument();
    });
  });

  test("calls `getSFContactById` on componentDidMount if SFid in params", async () => {
    const props = {
      ...defaultProps,
      submission: {
        ...defaultProps.submission,
        formPage1: {
          ...defaultProps.submission.formPage1,
          paymentRequired: false
        }
      },
      location: {
        search: {
          cId: "123",
          sId: "456"
        }
      }
    };
    const { getByTestId } = await setup(props, "/?cId=123&sId=456");
    const component = await getByTestId("component-submissionformpage2");
    expect(component).toBeInTheDocument();
    expect(handleErrorMock).not.toHaveBeenCalled();
  });
  test("calls `getSFContactById` on componentDidMount if SFid in state", async () => {
    const props = {
      ...defaultProps,
      submission: {
        ...defaultProps.submission,
        salesforceId: "123",
        submissionId: "345",
        formPage1: {
          ...defaultProps.submission.formPage1,
          paymentRequired: false
        }
      },
      apiSF: {
        getSFContactById: jest
          .fn()
          .mockImplementation(() =>
            Promise.resolve({ type: "GET_SF_CONTACT_SUCCESS" })
          )
      },
      location: {
        search: {
          cId: "123",
          sId: "456"
        }
      }
    };
    const { getByTestId } = await setup(props);
    const component = await getByTestId("component-submissionformpage2");
    expect(component).toBeInTheDocument();
    expect(handleErrorMock).not.toHaveBeenCalled();
  });
  test("handles error if `getSFContactById` throws", async () => {
    const getSFContactByIdError = jest
      .fn()
      .mockImplementation(() => Promise.reject("getSFContactFailure"));
    let props = {
      submission: {
        salesforceId: "1",
        formPage1: {
          paymentRequired: false
        }
      },
      apiSF: {
        getSFContactById: getSFContactByIdError
      },
      location: {
        search: {
          cId: "123",
          sId: "456"
        }
      }
    };
    const { getByTestId } = await setup({ ...props }, "/?cId=123&sId=456");
    const component = await getByTestId("component-submissionformpage2");
    expect(component).toBeInTheDocument();
    expect(handleErrorMock).toHaveBeenCalledWith("getSFContactFailure");
  });
});
