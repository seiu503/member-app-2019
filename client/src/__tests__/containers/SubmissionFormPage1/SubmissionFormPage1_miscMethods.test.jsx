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
import { I18nextProvider } from "react-i18next";
import i18n from "../../../translations/i18n";
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
    payment: {},
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
  t: text => text,
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
        <I18nextProvider i18n={i18n} defaultNS={"translation"}>
          <SubmissionFormPage1Container {...setupProps} />
        </I18nextProvider>
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

  describe("misc methods", () => {
    test("`handleCAPEOpen` opens alert dialog if try to navigate past CAPE tab w/o submitting", async () => {
      let props = {
        tab: 3
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

      const skipButton = getByTestId("button-next");

      // simulate click skipButton
      await waitFor(async () => {
        await user.click(skipButton);
      });

      // expect alert dialog to be in document
      await waitFor(() => {
        expect(getByTestId("component-alert-dialog")).toBeInTheDocument();
      });
    });

    test("clicking 'close' button on alert dialog closes modal", async () => {
      let props = {
        tab: 3
      };

      // render form
      const user = userEvent.setup(props);
      const {
        getByTestId,
        queryByTestId,
        getByRole,
        getByLabelText,
        getByText,
        debug
      } = await setup(props);

      const skipButton = await getByTestId("button-next");

      // simulate click skipButton
      await waitFor(async () => {
        await user.click(skipButton);
      });

      // expect alert dialog to be in document
      await waitFor(() => {
        expect(getByTestId("component-alert-dialog")).toBeInTheDocument();
      });

      // simulate click modalClose
      const closeButton = getByTestId("button-cancel");
      await waitFor(async () => {
        await user.click(closeButton);
      });

      // expect alert dialog to be closed
      await waitFor(() => {
        expect(queryByTestId("component-alert-dialog")).not.toBeInTheDocument();
      });
    });

    test("`handleEmployerChange` calls handleInput to set prefillEmployerChanged to true", async () => {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({}));
      const props = {
        tab: 0,
        apiSubmission: {
          handleInput: handleInputMock
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

      // enter required data
      await waitFor(async () => {
        const employerType = await getByLabelText("Employer Type");
        await fireEvent.change(employerType, {
          target: { value: "state homecare or personal support" }
        });
        const employerName = await queryByLabelText("Employer Name");
        expect(employerName).toBeInTheDocument();
        await fireEvent.change(employerName, {
          target: {
            value: "personal support worker (paid by ppl)"
          }
        });
      });

      // expect handleInput to have been called to set prefillEmployerchanged to `true`
      await waitFor(async () => {
        expect(handleInputMock).toHaveBeenCalledWith({
          target: { name: "prefillEmployerChanged", value: true }
        });
      });
    });

    test("`handleCloseAndClear` closes modal, clears form, resets window.location", async () => {
      let originalReplaceState = window.history.replaceState;
      let replaceStateMock = jest.fn();
      clearFormMock = jest.fn();
      window.history.replaceState = replaceStateMock;
      const getSFContactByDoubleIdSuccess = jest.fn().mockImplementation(() => {
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
      let props = {
        location: {
          search: "cId=1&aId=2"
        },
        apiSF: {
          ...defaultProps.apiSF,
          getSFContactByDoubleId: getSFContactByDoubleIdSuccess
        },
        apiSubmission: {
          clearForm: clearFormMock
        },
        submission: {
          ...defaultProps.submission,
          formPage1: {
            firstName: "test",
            lastName: "test"
          }
        },
        formPage2: {},
        tab: 0
      };

      const user = userEvent.setup(props);
      const { getByTestId } = await setup(props, "/?cId=1&aId=2");

      // check that modal renders
      const modal = await getByTestId("component-modal");
      await waitFor(() => expect(modal).toBeInTheDocument());

      // simulate user click on close button
      const closeButton = await getByTestId("button-link-request");
      await waitFor(() => expect(closeButton).toBeInTheDocument());

      await user.click(closeButton);

      // expect clearFormMock to have beeen called
      await waitFor(() => {
        expect(clearFormMock).toHaveBeenCalled();
        expect(replaceStateMock).toHaveBeenCalled();
      });

      window.history.replaceState = originalReplaceState;
    });

    test("clicking close on CAPE modal closes alert dialog", async () => {
      let pushMock = jest.fn();
      let props = {
        tab: 3,
        history: {
          push: pushMock
        }
      };

      // render form
      const user = userEvent.setup(props);
      const {
        getByTestId,
        queryByTestId,
        getByRole,
        getByLabelText,
        getByText,
        debug
      } = await setup(props);

      const skipButton = getByTestId("button-next");

      // simulate click skipButton
      await waitFor(async () => {
        await user.click(skipButton);
      });

      // expect alert dialog to be in document
      await waitFor(() => {
        expect(getByTestId("component-alert-dialog")).toBeInTheDocument();
      });

      const cancelButton = await getByTestId("button-cancel");
      await user.click(cancelButton);

      // expect alert dialog not to be in document
      await waitFor(() => {
        expect(queryByTestId("component-alert-dialog")).not.toBeInTheDocument();
      });
    });

    test("clicking action button on CAPE modal calls this.props.history.push", async () => {
      let pushMock = jest.fn();
      let props = {
        tab: 3,
        history: {
          push: pushMock
        }
      };

      // render form
      const user = userEvent.setup(props);
      const {
        getByTestId,
        queryByTestId,
        getByRole,
        getByLabelText,
        getByText,
        debug
      } = await setup(props);

      const skipButton = getByTestId("button-next");

      // simulate click skipButton
      await waitFor(async () => {
        await user.click(skipButton);
      });

      // expect alert dialog to be in document
      await waitFor(() => {
        expect(getByTestId("component-alert-dialog")).toBeInTheDocument();
      });

      const actionButton = await getByTestId("button-action");
      await user.click(actionButton);

      // expect alert dialog not to be in document
      await waitFor(() => {
        expect(queryByTestId("component-alert-dialog")).not.toBeInTheDocument();
        expect(pushMock).toHaveBeenCalled();
      });
    });
  });
});
