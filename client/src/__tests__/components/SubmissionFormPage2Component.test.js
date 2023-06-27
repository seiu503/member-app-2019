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
  generatePage2Validate,
  generateSubmissionBody
} from "../../../../app/utils/fieldConfigs";
import { I18nextProvider } from "react-i18next";
import i18n from "../../translations/i18n";
import handlers from "../../mocks/handlers";
let pushMock = jest.fn(),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  handleErrorMock = jest.fn(),
  executeMock = jest.fn().mockImplementation(() => Promise.resolve());

const testData = generatePage2Validate();
const server = setupServer(...handlers);

import {
  SubmissionFormPage2Component,
  SubmissionFormPage2FormWrap
} from "../../components/SubmissionFormPage2Component";

let handleSubmit, props, handleSubmitMock, store;

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

let updateSubmissionSuccess = jest.fn().mockImplementation(() => {
  console.log("updateSubmissionSuccessMock");
  Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS", payload: {} });
});

let createSubmissionSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "CREATE_SUBMISSION_SUCCESS", payload: {} })
  );

let updateSubmissionError = jest.fn().mockImplementation(() => {
  console.log("updateSubmissionErrorMock");
  Promise.reject({
    type: "UPDATE_SUBMISSION_FAILURE",
    payload: {},
    message: "updateSubmissionError"
  });
});

// initial props for form
const defaultProps = {
  handleSubmit,
  submission: {
    error: null,
    loading: false,
    formPage1: {
      paymentRequired: false
    },
    formPage2: {
      ...generatePage2Validate,
      hireDate: "2000-10-01"
    },
    salesforceId: "123",
    submissionId: "345"
  },
  initialValues: { gender: "" },
  formValues: { gender: "" },
  classes: { test: "test" },
  // need these here for form to have access to their definitions later
  apiSubmission: {
    updateSubmission: updateSubmissionSuccess
  },
  apiSF: {
    updateSFContact: updateSFContactSuccess
  },
  location: {
    search: ""
  },
  reset: jest.fn(),
  history: {
    push: jest.fn()
  },
  addTranslation: jest.fn(),
  actions: {
    setSpinner: jest.fn()
  },
  createSubmission: createSubmissionSuccess,
  updateSubmission: updateSubmissionSuccess,
  updateSFContact: updateSFContactSuccess,
  saveSubmissionErrors: jest.fn(),
  translate: jest.fn(),
  handleError: handleErrorMock,
  openSnackbar: jest.fn()
};

const bodyData = generatePage2Validate();
const initialState = {
  submission: {
    formPage2: {
      ...bodyData,
      hireDate: "2000-10-01"
    }
  }
};
store = storeFactory(initialState);
const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props, handleSubmit };
  return render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <I18nextProvider i18n={i18n} defaultNS={"translation"}>
          <SubmissionFormPage2FormWrap {...setupProps} />
        </I18nextProvider>
      </Provider>
    </ThemeProvider>
  );
};

describe("Unconnected <SubmissionFormPage2 />", () => {
  // assigning handlesubmit as a callback so it can be passed form's onSubmit assignment or our own test function
  // gain access to touched and error to test validation
  // will assign our own test functions to replace action/reducers for apiSubmission prop
  beforeEach(() => {
    handleSubmit = fn => fn;
  });

  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe("basic setup", () => {
    beforeEach(() => {
      handleSubmitMock = jest.fn();
      handleSubmit = handleSubmitMock;
    });

    it("renders without error", () => {
      const { getByTestId } = setup(props);
      const component = getByTestId("component-submissionformpage2");
      expect(component).toBeInTheDocument();
    });
  });

  describe("handleSubmit", () => {
    afterEach(() => {
      // jest.restoreAllMocks();
    });

    it("handles error if updateSubmission prop throws", async function() {
      props = {
        ...defaultProps,
        handleError: handleErrorMock,
        apiSF: {
          updateSFContact: jest.fn().mockImplementation(() => {
            console.log("updateSFContactMock");
            return Promise.resolve({
              type: "UPDATE_SF_CONTACT_SUCCESS",
              payload: {}
            });
          })
        },
        submission: {
          ...defaultProps.submission,
          salesforceId: null,
          error: "updateSubmissionError"
        },
        updateSubmission: jest.fn().mockImplementation(() => {
          console.log("updateSubmissionErrorMock");
          return Promise.reject("updateSubmissionError");
        })
      };

      // render form
      const user = userEvent.setup();
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        debug
      } = await setup(props);

      const page2Form = getByTestId("form-page2");

      // simulate submit p2
      await waitFor(async () => {
        const formPage2 = getByTestId("form-page2");
        await fireEvent.submit(formPage2);
      });

      // expect handleErrorMock to have been called with correct message
      await waitFor(() => {
        const message = "updateSubmissionError";
        expect(handleErrorMock).toHaveBeenCalledWith(message);
      });
    });

    it("handles error if updateSFContact prop throws", async function() {
      props = {
        ...defaultProps,
        handleError: handleErrorMock,
        apiSF: {
          updateSFContact: jest.fn().mockImplementation(() => {
            console.log("updateSFContactMock");
            return Promise.reject("updateSFContactError");
          })
        },
        submission: {
          ...defaultProps.submission,
          salesforceId: null,
          error: "updateSFContactError"
        },
        updateSubmission: jest.fn().mockImplementation(() => {
          console.log("updateSubmissionSuccessMock");
          return Promise.resolve({
            type: "UPDATE_SUBMISSION_SUCCESS",
            payload: {}
          });
        })
      };

      // render form
      const user = userEvent.setup();
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        debug
      } = await setup(props);

      // simulate submit p2
      await waitFor(async () => {
        const formPage2 = getByTestId("form-page2");
        await fireEvent.submit(formPage2);
      });

      // expect handleErrorMock to have been called with correct message
      await waitFor(() => {
        const message = "updateSFContactError";
        expect(handleErrorMock).toHaveBeenCalledWith(message);
      });
    });

    it("handles error if updateSubmission method throws", async function() {
      const updateSubmissionError = jest
        .fn()
        .mockImplementation(() => Promise.reject("updateSubmissionError"));

      props = {
        ...defaultProps,
        handleError: handleErrorMock,
        apiSF: {
          updateSFContact: jest.fn().mockImplementation(() => {
            return Promise.resolve({
              type: "UPDATE_SF_CONTACT_SUCCESS",
              payload: {}
            });
          })
        },
        submission: {
          ...defaultProps.submission,
          salesforceId: null,
          error: "createSubmissionError"
        },
        updateSubmission: updateSubmissionError
      };

      // render form
      const user = userEvent.setup();
      const {
        getByTestId,
        getByRole,
        getByLabelText,
        getByText,
        debug
      } = await setup(props);

      const page2Form = getByTestId("form-page2");

      // simulate submit p2
      await waitFor(async () => {
        const formPage2 = getByTestId("form-page2");
        await fireEvent.submit(formPage2);
      });

      // expect handleErrorMock to have been called with correct message
      await waitFor(() => {
        const message = "updateSubmissionError";
        expect(handleErrorMock).toHaveBeenCalledWith(message);
      });
    });

    // REWRITE IF NEEDED FOR COVERAGE
    // it("handles edge cases: no params.id, no hire date", async function() {
    //   updateSubmissionError = jest
    //     .fn()
    //     .mockImplementation(() =>
    //       Promise.reject({ type: "UPDATE_SUBMISSION_FAILURE", payload: {} })
    //     );

    //   // creating wrapper
    //   props.updateSubmission = updateSubmissionError;
    //   props.updateSFContact = updateSFContactSuccess;
    //   props.submission.submissionId = 1234;
    //   props.submission.salesforceId = null;
    //   props.location.search = "";
    //   wrapper = unconnectedSetup(props);
    //   const bodyData = generatePage2Validate();
    //   delete bodyData.hireDate;

    //   // simulate submit with dummy data
    //   wrapper
    //     .instance()
    //     .handleSubmit(bodyData)
    //     .then(async () => {
    //       try {
    //         await updateSubmissionError();
    //         expect(handleErrorMock.mock.calls.length).toBe(1);
    //       } catch (err) {
    //         console.log(err);
    //       }
    //     })
    //     .catch(err => {
    //       console.log(err);
    //     });
    // });
  });
});
