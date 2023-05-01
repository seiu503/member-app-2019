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

let pushMock = jest.fn(),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  executeMock = jest.fn().mockImplementation(() => Promise.resolve()),
  updateSubmissionError = jest.fn().mockImplementation(() => Promise.reject()),
  handleErrorMock = jest.fn();

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

const clearSigBoxMock = jest.fn();
let toDataURLMock = jest.fn();

const sigBox = {
  current: {
    toDataURL: toDataURLMock,
    clear: clearSigBoxMock
  }
};

const testData = generateSampleValidate();

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
    // handleInput: handleInputMock,
    clearForm: clearFormMock,
    updateSubmission: () =>
      Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" }),
    addSubmission: () => Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" }),
    getAllSubmissions: () =>
      Promise.resolve({ type: "GET_ALL_SUBMISSIONS_SUCCESS" })
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
  lookupSFContact: lookupSFContactSuccess,
  setActiveLanguage: jest.fn()
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
  beforeEach(() => {
    // console.log = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("misc methods", () => {
    beforeEach(() => {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve(""));
    });
    afterEach(() => {
      handleInputMock.mockClear();
    });

    // test.only("`prepForContact` sets employerId conditionally based on prefillEmployerChanged prop", async () => {
    //   const props = {
    //     submission: {
    //       formPage1: {
    //         prefillEmployerId: "1234",
    //         prefillEmployerChanged: true
    //       },
    //       payment: {},
    //     },
    //     apiSubmission: {
    //       // handleInput: handleInputMock
    //     }
    //   };

    //   // simulate user click 'Next'
    //   const user = userEvent.setup();
    //   const { getByTestId, getByRole, getByText, debug } = await setup({ ...props });
    //   const nextButton = getByTestId("button-next");
    //   await userEvent.click(nextButton);

    //   // check that tab 1 renders
    //   const tab1Form = getByRole("form");
    //   await waitFor(() => {
    //     expect(tab1Form).toBeInTheDocument();
    //   });

    //   await fireEvent.submit(tab1Form, { ...testData });

    //   const submitButton = await getByTestId("button-submit");
    //   // screen.debug(submitButton)
    //   // await fireEvent.click(submitButton);
    //   // await userEvent.click(submitButton);

    //   const form = getByRole("form");
    //   // const nextButtonTab2 = getByTestId("button-next");
    //   await waitFor(() => screen.debug(form)) // tab 2
    //   // const form = getByRole('form', { name: /form-tab2/i })
    //   // screen.debug(form);

    //   // check that tab 2 renders
    //   // const tab2Form = getByTestId("form-tab2");
    //   // await waitFor(() => {
    //   //   expect(tab2Form).toBeInTheDocument();
    //   // });

    //   // await fireEvent.submit(tab2Form, { ...testData });

    //   // // expect employerId to be set to '0016100000WERGeAAP' (unknown)
    //   // await waitFor(() => {
    //   //   expect(handleInputMock).toHaveBeenCalledWith({target: { name: "employerId", value: '0016100000WERGeAAP' }});
    //   // });
    // });

    test("`updateLanguage` calls this.props.setActiveLanguage", () => {
      const setActiveLanguageMock = jest.fn();
      const props = {
        setActiveLanguage: setActiveLanguageMock
      };
      wrapper = setup(props);
      const fakeEvent = {
        target: {
          value: "English"
        }
      };
      wrapper.instance().updateLanguage(fakeEvent);
      const fakeRef = {
        current: {
          value: "Español"
        }
      };
      wrapper.instance().language_picker = fakeRef;
      wrapper.instance().updateLanguage(fakeEvent);
      //^^ doing this twice to hit branches with userSelectedLanguage
      expect(setActiveLanguageMock).toHaveBeenCalled();
    });

    test("`renderHeadline` renders headline", () => {
      const props = {};
      wrapper = setup(props);
      wrapper.instance().renderHeadline(1);
      const component = findByTestAttr(wrapper, "headline-translate");
      // expect(component.length).toBe(1);
    });

    test("`prepForSubmission` sets salesforceId conditionally based on query string, redux store, and passed values", () => {
      const props = {
        submission: {
          salesforceId: "1234",
          formPage1: {
            legalLanguage: "abc"
          },
          payment: {}
        },
        location: {
          search: "&cId=1234"
        }
      };
      const body = {
        firstName: "firstName",
        lastName: "lastName",
        homeStreet: "homeStreet",
        homeCity: "city",
        homeState: "state",
        homeZip: "zip",
        birthdate: new Date(),
        homeEmail: "test@test.com",
        mobilePhone: "1234567890",
        preferredLanguage: "Spanish",
        textAuthOptOut: false,
        capeAmountOther: 11,
        employerName: "homecare"
      };
      wrapper = setup(props);
      wrapper.instance().prepForSubmission(body);
    });

    test("`updateSubmission` uses defaults if no passedId or passedUpdates", () => {
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
        }
      };
      wrapper = setup(props);
      wrapper.instance().updateSubmission();
    });

    test("`saveSubmissionErrors` handles error if updateSubmission throws", () => {
      const props = {
        submission: {
          salesforceId: "1234",
          formPage1: {
            legalLanguage: "abc"
          },
          submissionId: "5678",
          currentSubmission: {},
          payment: {}
        },
        location: {
          search: "&cId=1234"
        }
      };
      wrapper = setup(props);
      wrapper.instance().updateSubmission = updateSubmissionError;
      wrapper.instance().saveSubmissionErrors();
    });

    test("`generateSubmissionBody` uses back end fieldnames if !firstName", () => {
      const props = {
        submission: {
          salesforceId: "1234",
          formPage1: {
            legalLanguage: "abc"
          },
          submissionId: "5678",
          currentSubmission: {},
          payment: {}
        },
        location: {
          search: "&cId=1234"
        }
      };
      const values = {};
      wrapper = setup(props);
      wrapper.instance().updateSubmission = updateSubmissionError;
      wrapper.instance().generateSubmissionBody(values, true);
    });
  });
});
