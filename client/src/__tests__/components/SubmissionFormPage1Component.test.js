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

import { SubmissionFormPage1Component } from "../../components/SubmissionFormPage1Component";
import { I18nextProvider } from "react-i18next";
import i18n from "../../translations/i18n";

// variables
let handleSubmit,
  apiSubmission,
  apiSF = {},
  handleSubmitMock,
  createSubmissionSuccess,
  updateSubmissionSuccess,
  updateSubmissionError,
  props,
  tab,
  store,
  getSFEmployersSuccess,
  handleUpload,
  verifySuccess;

let resetMock = jest.fn();

const saveSubmissionErrorsMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));
let createSFOMASuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "CREATE_SF_OMA_SUCCESS"
  })
);
const handleTabMock = jest.fn().mockImplementation(() => Promise.resolve({}));
const verifyRecaptchaSuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve(0.9));

verifySuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "VERIFY_SUCCESS", payload: { score: 0.9 } })
  );

updateSubmissionSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
  );

getSFEmployersSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
  );

let loadEmployersPicklistMock = jest.fn(() => []);

// initial props for form
const defaultProps = {
  submission: {
    error: null,
    loading: false,
    employerNames: ["name1", "name2", "name3"],
    formPage1: {
      firstName: "",
      lastName: "",
      homeEmail: "",
      signature: "string",
      paymentRequired: false
    },
    employerObjects: [...employersPayload],
    payment: {
      cardAddingUrl: ""
    }
  },
  initialValues: {
    mm: "",
    onlineCampaignSource: null
  },
  formValues: {
    mm: "",
    onlineCampaignSource: null,
    employerType: "test"
  },
  classes: { test: "test" },
  // need these here for form to have access to their definitions later
  apiSubmission: {
    updateSubmission: updateSubmissionSuccess,
    createSubmission: createSubmissionSuccess,
    verify: verifySuccess
  },
  apiSF: {
    getSFEmployers: getSFEmployersSuccess,
    createSFOMA: createSFOMASuccess
  },
  handleSubmit: fn => fn,
  handleUpload,
  legal_language: {
    current: {
      textContent: "blah"
    }
  },
  location: {
    // search: "?cape=true"
  },
  reset: resetMock,
  history: {
    push: jest.fn()
  },
  reCaptchaRef: {
    current: {
      getValue: jest.fn().mockImplementation(() => "mock value")
    }
  },
  content: {},
  apiContent: {},
  tab,
  handleTab: handleTabMock,
  generateSubmissionBody: () => Promise.resolve({}),
  actions: {
    setSpinner: jest.fn()
  },
  verifyRecaptchaScore: verifyRecaptchaSuccess,
  saveSubmissionErrors: saveSubmissionErrorsMock,
  loadEmployersPicklist: loadEmployersPicklistMock,
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
  renderBodyCopy: jest.fn(),
  renderHeadline: jest.fn(),
  updateSubmission: updateSubmissionSuccess,
  t: text => text,
  handleEmployerChange: jest.fn()
};

describe("Unconnected <SubmissionFormPage1 />", () => {
  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  beforeEach(() => {
    handleSubmit = fn => fn;
  });

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  const initialState = {};
  store = storeFactory(initialState);
  const setup = (props = {}) => {
    const setupProps = { ...defaultProps, ...props, handleSubmit };
    return render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <I18nextProvider i18n={i18n} defaultNS={"translation"}>
            <MemoryRouter>
              <SubmissionFormPage1Component {...setupProps} />
            </MemoryRouter>
          </I18nextProvider>
        </Provider>
      </ThemeProvider>
    );
  };

  describe("basic setup", () => {
    // Reset any runtime request handlers we may add during the tests.
    afterEach(() => server.resetHandlers());
    it("renders without error", () => {
      props = {
        ...defaultProps,
        apiSF: {
          ...defaultProps.apiSF,
          getSFEmployers: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
            )
        }
      };
      const { getByTestId } = setup(props);
      const component = getByTestId("component-submissionformpage1");
      expect(component).toBeInTheDocument();
    });
    it("renders CAPE case", () => {
      props = {
        ...defaultProps,
        location: {
          search: "?cape=true"
        },
        apiSF: {
          ...defaultProps.apiSF,
          getSFEmployers: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
            )
        }
      };
      const { getByTestId } = setup(props);
      const component = getByTestId("component-submissionformpage1");
      expect(component).toBeInTheDocument();
    });
    it("renders non-CAPE case", () => {
      props = {
        location: {
          search: "?cape=false"
        },
        apiSF: {
          ...defaultProps.apiSF,
          getSFEmployers: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
            )
        }
      };
      const { getByTestId } = setup(props);
      const component = getByTestId("component-submissionformpage1");
      expect(component).toBeInTheDocument();
    });
    it("renders Tab 1", () => {
      props = {
        tab: 0,
        apiSF: {
          ...defaultProps.apiSF,
          getSFEmployers: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
            )
        }
      };
      const { getByTestId } = setup(props);
      const component = getByTestId("component-submissionformpage1");
      expect(component).toBeInTheDocument();
    });
    it("renders Tab 2", () => {
      props = {
        tab: 1,
        apiSF: {
          ...defaultProps.apiSF,
          getSFEmployers: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
            )
        }
      };
      const { getByTestId } = setup(props);
      const component = getByTestId("component-submissionformpage1");
      expect(component).toBeInTheDocument();
    });
    it("renders Tab 3", () => {
      props = {
        tab: 2,
        apiSF: {
          ...defaultProps.apiSF,
          getSFEmployers: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
            )
        }
      };
      const { getByTestId } = setup(props);
      const component = getByTestId("component-submissionformpage1");
      expect(component).toBeInTheDocument();
    });
  });

  describe("componentDidMount", () => {
    it("calls getSFEmployers on componentDidMount", async () => {
      const getSFEmployersSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
        );
      // loadEmployersPicklistMock = jest.fn();
      props = {
        handleSubmit: jest.fn(),
        apiSF: {
          getSFEmployers: getSFEmployersSuccess
        },
        formValues: {
          // to get code coverage for retiree edge cases
          employerType: "Retirees"
        }
        // loadEmployersPicklist: loadEmployersPicklistMock
      };

      await setup(props);
      expect(getSFEmployersSuccess).toHaveBeenCalled();
    });
    it("handles error when getSFEmployers fails", async () => {
      handleErrorMock = jest.fn();
      const getSFEmployersError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "GET_SF_EMPLOYERS_FAILURE" })
        );
      props = {
        handleSubmit: jest.fn(),
        apiSF: {
          getSFEmployers: getSFEmployersError
        },
        handleError: handleErrorMock,
        formValues: {
          // to get code coverage for afh edge cases
          employerType: "adult foster home"
        }
      };
      // Notifier.openSnackbar = jest.fn();
      let testProps = {
        ...defaultProps,
        ...props,
        handleSubmit,
        apiSubmission,
        apiSF
      };
      await setup(props);
      expect(getSFEmployersError).toHaveBeenCalled();
    });
  });

  describe("componentDidUpdate", () => {
    afterEach(() => server.resetHandlers());
    it("calls loadEmployersPicklist on componentDidUpdate if employer list has not yet loaded", async () => {
      getSFEmployersSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
        );
      props = {
        submission: {
          ...defaultProps.submission,
          employerNames: [""],
          formPage1: {},
          payment: {
            cardAddingUrl: ""
          },
          employerObjects: [...employersPayload]
        },
        formValues: {
          // to get code coverage for community member edge cases
          employerType: "Community Member"
        },
        apiSF: {
          getSFEmployers: getSFEmployersSuccess
        },
        loadEmployersPicklist: loadEmployersPicklistMock
      };

      const ref = React.createRef();
      let setupProps = { ...defaultProps, ...props, handleSubmit };
      const { rerender } = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <SubmissionFormPage1Component {...setupProps} ref={ref} />
          </Provider>
        </ThemeProvider>
      );

      const tempLoadEmployersPicklist = ref.current.loadEmployersPicklist;
      ref.current.loadEmployersPicklist = loadEmployersPicklistMock;

      await rerender(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <SubmissionFormPage1Component {...setupProps} ref={ref} />
          </Provider>
        </ThemeProvider>
      );

      // testing that loadEmployersPicklist was called
      expect(loadEmployersPicklistMock).toHaveBeenCalled();
      loadEmployersPicklistMock.mockClear();
    });
    it("displays correct data in employer type dropdown if employer list has loaded", async () => {
      loadEmployersPicklistMock = jest
        .fn()
        .mockImplementation(() => ["Test1", "Test2", "Test3", "Test4"]);
      let getSFEmployersSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_SF_EMPLOYERS_SUCCESS" })
        );
      props = {
        ...defaultProps,
        apiSF: {
          ...defaultProps.apiSF,
          getSFEmployers: getSFEmployersSuccess
        },
        submission: {
          employerNames: ["Test1", "Test2", "Test3", "Test4"],
          employerObjects: [
            {
              Name: "seiu local 503 opeu" // coverage for edge casses
            }
          ],
          formPage1: {}
        },
        loadEmployersPicklist: loadEmployersPicklistMock,
        tab: 0
      };

      const ref = React.createRef();
      let setupProps = { ...defaultProps, ...props, handleSubmit };
      const { rerender } = render(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <SubmissionFormPage1Component
              {...setupProps}
              handleSubmit={handleSubmit}
              ref={ref}
            />
          </Provider>
        </ThemeProvider>
      );

      const newProps = {
        formValues: {
          employerType: "retired" // coverage for edge cases
        },
        submission: {
          ...props.submission,
          formPage1: {
            employerType: "seiu 503 staff" // coverage for edge cases
          }
        },
        apiSF: {
          ...defaultProps.apiSF,
          getSFEmployers: getSFEmployersSuccess
        }
      };

      setupProps = { ...defaultProps, ...props, ...newProps, handleSubmit };

      ref.current.loadEmployersPicklist = loadEmployersPicklistMock;
      ref.current.props.apiSF.getSFEmployers = getSFEmployersSuccess;

      await rerender(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <SubmissionFormPage1Component {...setupProps} ref={ref} />
          </Provider>
        </ThemeProvider>
      );

      // testing that employer type picklist displays 4 options
      const field = screen.getByTestId("select-employer-type");
      const select = within(field).getByRole("combobox");
      expect(select.length).toBe(4);
    });
  });
});
