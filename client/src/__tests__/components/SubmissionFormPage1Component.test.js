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
  translate: jest.fn(),
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
          <SubmissionFormPage1Component {...setupProps} />
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

  // all the code below here should be covered in App tests. if these are not needed for coverage they can be deleted

  // describe("handleSubmit", () => {
  //   const notes = () => {
  // // Tab1 onSubmit = handleTab(1) (SubmissionFormPage1.jsx > 628)
  // //  // handleTab calls handleTab1() (async, w catch block) (SubmFormP1.jsx > 573)
  // //    // handleTab1 calls verifyRecapchaScore method (SubmFormP1.jsx > 228)
  // //     // verifyRecaptchaScore calls this.props.recaptcha.current.execute() (mocked in test props)
  // //     // verifyRecaptchaScore calls this.props.apiSubmission.verify() (mocked with msw) and returns a score back to handleTab1
  // //    // handleTab1 calls utils.ispaymentRequired (is this mocked? what's happening here?)
  // //    // handleTab1 calls apiSubmission.handleInput (mocked in test props?)
  // //    // handleTab1 checks for this.props.submission.salesforceId
  // //      // if yes, calls this.props.apiSF.updateSFContact (async, w catch block)
  // //        // if success, RETURN this.props.changeTab(1) (App.js > 864)
  // //        // if fail, handleError
  // //      // if no, calls this.props.lookupSFContact (async, w catch block) ==> (App.js > 354)
  // //        // lookup SFContact calls createSFContact
  // //          // createSFContact calls this.prepForContact
  // //        // if fail, handleError
  // //    // handleTab1 checks again for this.props.submission.salesforceId (should have been returned in lookup)
  // //      // if yes, calls this.props.apiSF.updateSFContact (async, w catch block) ?mocked w msw??
  // //        // if success, RETURN this.props.changeTab(1) (App.js > 864)
  // //        // if fail, handleError
  // //      // if no, calls this.props.lookupSFContact (async, w catch block) ?mocked w msw??
  // //        // if fail, handleError
  // //    // handleTab1 calls this.props.createSFContact (async, w catch block) mocked in test props
  // //      // if fail, handleError
  // //      // if success, RETURN this.props.changeTab(1) (App.js > 864)
  // //        // changeTab(1) sets App state to cause Tab 2 to render
  // // Tab2 onSubmit = handleTab(2) (SubmissionFormPage1.jsx > 628)
  // //  // handleTab calls handleTab2() (async, w catch block) (SubmFormP1.jsx > 550)
  // //    // handleTab2 checks for formValues.signature
  // //      // if false, handleError
  // //    // handleTab2 calls this.saveLegalLanguage() (mocked in test props)
  // //    // handleTab2 calls this.props.createSubmission (async, w catch block) (App.js > 684)
  // //      // createSubmission calls this.generateSubmissionBody (App.js > 561)
  // //         // generateSubmissionBody calls this.prepForContact (App.js > 410)
  // //         // generateSubmissionBody calls this.prepForSubmission (App.js > 525)
  // //      // createSubmission calls this.props.apiSubmission.addSubmission (async, w catch block)
  // //      // createSubmission calls this.props.apiSF.createSFOMA (async, w catch block)
  // //    // handleTab2 calls this.props.changeTab(2) (App.js > 864)
  //   };

  //   it("handles error if verifyRecaptchaScore fails", async () => {
  //     const verifyRecaptchaError = jest
  //       .fn()
  //       .mockImplementation(() => Promise.resolve(0));
  //     handleErrorMock = jest
  //       .fn()
  //       .mockImplementation(() => console.log("handleError"));
  //     formElements.handleError = handleErrorMock;
  //     props = {
  //       tab: 0,
  //       verifyRecaptchaScore: verifyRecaptchaError
  //     };
  //     // render form
  //     const user = userEvent.setup(props);
  //     const {
  //       getByTestId,
  //       getByRole,
  //       getByLabelText,
  //       getByText,
  //       debug
  //     } = await setup(props);

  //     const tab1Form = getByRole("form");

  //     // enter required data
  //     await waitFor(async () => {
  //       const employerType = await getByLabelText("Employer Type");
  //       const firstName = await getByLabelText("First Name");
  //       const lastName = await getByLabelText("Last Name");
  //       const homeEmail = await getByLabelText("Home Email");
  //       await fireEvent.change(employerType, {
  //         target: { value: "state homecare or personal support" }
  //       });
  //       await fireEvent.change(firstName, { target: { value: "test" } });
  //       await fireEvent.change(lastName, { target: { value: "test" } });
  //       await fireEvent.change(homeEmail, {
  //         target: { value: "test@test.com" }
  //       });
  //     });

  //     // simulate submit tab1
  //     await waitFor(async () => {
  //       const employerName = await getByLabelText("Employer Name");
  //       expect(employerName).toBeInTheDocument();
  //       await fireEvent.change(employerName, {
  //         target: {
  //           value: "homecare worker (aging and people with disabilities)"
  //         }
  //       });
  //       const tab1Form = await getByTestId("form-tab1");
  //       await fireEvent.submit(tab1Form, { ...testData });
  //     });

  //     // expect snackbar to be in document with error styling and correct message
  //     await waitFor(() => {
  //       const snackbar = getByTestId("component-basic-snackbar");
  //       const errorIcon = getByTestId("ErrorOutlineIcon");
  //       const message = getByText("verifyRecaptchaError");
  //       expect(snackbar).toBeInTheDocument();
  //       expect(message).toBeInTheDocument();
  //       expect(errorIcon).toBeInTheDocument();
  //     });
  //   });
  //   it("handles error if verifyRecaptchaScore throws", async () => {
  //     testData = generateSampleValidate();
  //     const verifyRecaptchaError = jest
  //       .fn()
  //       .mockImplementation(() => Promise.reject(0));
  //     props = {
  //       verifyRecaptchaScore: verifyRecaptchaError,
  //       handleError: handleErrorMock,
  //       updateSubmission: updateSubmissionSuccess,
  //       createSubmission: createSubmissionSuccess,
  //       renderHeadline: jest.fn(),
  //       tab: 0
  //     };
  //     handleErrorMock = jest
  //       .fn()
  //       .mockImplementation(() => console.log("handleError"));
  //     formElements.handleError = handleErrorMock;
  //     const setupProps = { ...defaultProps, ...props, handleSubmit };
  //     // render form
  //     const user = userEvent.setup();
  //     const { getByTestId, getByRole, debug } = await setup({ ...setupProps });

  //     // simulate submit
  //     await fireEvent.submit(getByTestId("form-tab1"), { ...testData });

  //     // expect handleError to have been called
  //     await waitFor(() => {
  //       expect(formElements.handleError).toHaveBeenCalled();
  //     });
  //   });
  //   it("calls handleError if payment required but no payment method added", async () => {
  //     updateSubmissionSuccess = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
  //       );
  //     testData = generateSampleValidate();
  //     createSubmissionSuccess = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "CREATE_SUBMISSION_SUCCESS" })
  //       );

  //     props = {
  //       tab: 1,
  //       submission: {
  //         payment: {
  //           activeMethodLast4: null
  //         },
  //         formPage1: {}
  //       },
  //       formValues: {
  //         ...testData,
  //         paymentType: "Card",
  //         paymentMethodAdded: false,
  //         employerId: "0014N00002ASaRyQAL"
  //       }
  //     };
  //     handleErrorMock = jest
  //       .fn()
  //       .mockImplementation(() => console.log("handleError"));
  //     formElements.handleError = handleErrorMock;

  //     const setupProps = { ...defaultProps, ...props, handleSubmit };
  //     // render form
  //     const user = userEvent.setup();
  //     const { getByTestId, getByRole, debug } = await setup({ ...setupProps });

  //     // simulate submit
  //     await fireEvent.submit(getByTestId("form-tab2"), { ...testData });

  //     // expect handleError to have been called
  //     await waitFor(() => {
  //       expect(formElements.handleError).toHaveBeenCalled();
  //     });
  //   });

  //   it("errors if there is no signature", async function() {
  //     updateSubmissionError = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "UPDATE_SUBMISSION_FAILURE" })
  //       );
  //     testData = generateSampleValidate();
  //     handleErrorMock = jest
  //       .fn()
  //       .mockImplementation(() => console.log("handleError"));
  //     formElements.handleError = handleErrorMock;
  //     createSubmissionSuccess = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "CREATE_SUBMISSION_SUCCESS" })
  //       );

  //     props = {
  //       tab: 1,
  //       submission: {
  //         formPage1: {
  //           paymentMethodAdded: true
  //         },
  //         payment: { cardAddingUrl: "" },
  //         error: "Error"
  //       },
  //       saveSubmissionErrors: saveSubmissionErrorsMock,
  //       createSubmission: createSubmissionSuccess,
  //       howManyTabs: 4,
  //       handleError: handleErrorMock,
  //       updateSubmission: updateSubmissionError,
  //       formValues: {
  //         employerId: "0014N00002ASaRzQAL",
  //         signature: null,
  //         employerType: "test"
  //       }
  //     };

  //     const setupProps = { ...defaultProps, ...props, handleSubmit };
  //     // render form
  //     const user = userEvent.setup();
  //     const { getByTestId, getByRole, debug } = await setup({ ...setupProps });

  //     // simulate submit
  //     await fireEvent.submit(getByTestId("form-tab2"), { ...testData });

  //     // expect handleError to have been called
  //     await waitFor(() => {
  //       expect(formElements.handleError).toHaveBeenCalled();
  //     });
  //   });

  //   it("provides error feedback after failed Submit", async function() {
  //     // imported function that creates dummy data for form
  //     testData = generateSampleValidate();
  //     // test function that will count calls as well as return error object
  //     let createSubmissionError = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "CREATE_SUBMISSION_FAILURE" })
  //       );

  //     // creating wrapper
  //     props = {
  //       apiSubmission: {
  //         updateSubmission: updateSubmissionError,
  //         handleInput: handleInputMock
  //       },
  //       submission: {
  //         payment: {
  //           activeMethodLast4: "1234",
  //           paymentErrorHold: false
  //         },
  //         formPage1: {}
  //       },
  //       createSubmission: createSubmissionError,
  //       formValues: {
  //         employerId: "0014N00002ASaS0QAL",
  //         employerType: "test"
  //       },
  //       tab: 1
  //     };

  //     formElements.handleError = handleErrorMock;

  //     const setupProps = { ...defaultProps, ...props, handleSubmit };
  //     // render form
  //     const user = userEvent.setup();
  //     const { getByTestId, getByRole, debug } = await setup({ ...setupProps });

  //     // simulate submit
  //     await fireEvent.submit(getByTestId("form-tab2"), { ...testData });

  //     // expect handleError to have been called
  //     await waitFor(() => {
  //       expect(formElements.handleError).toHaveBeenCalled();
  //     });
  //   });

  //   it("updates submission status after successful submit", async function() {
  //     // imported function that creates dummy data for form
  //     testData = generateSampleValidate();
  //     // test function that will count calls as well as return error object
  //     updateSubmissionSuccess = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
  //       );
  //     createSFOMASuccess = jest
  //       .fn()
  //       .mockImplementation(() => Promise.resolve());
  //     const updateSubmissionMethodSuccess = jest
  //       .fn()
  //       .mockImplementation(() => Promise.resolve());
  //     const handleInputMock = jest.fn();
  //     const ref = React.createRef();

  //     props = {
  //       tab: 1,
  //       apiSubmission: {
  //         updateSubmission: updateSubmissionSuccess,
  //         handleInput: handleInputMock
  //       },
  //       createSubmission: createSubmissionSuccess,
  //       ref: {
  //         current: {
  //           createSFOMA: createSFOMASuccess,
  //           updateSubmission: updateSubmissionSuccess
  //         }
  //       },
  //       submission: {
  //         error: null,
  //         formPage1: {}
  //       }
  //     };

  //     const setupProps = { ...defaultProps, ...props, handleSubmit };
  //     // render form
  //     const user = userEvent.setup();
  //     const { getByTestId, getByRole, debug } = await setup({ ...setupProps });

  //     // simulate submit
  //     await fireEvent.submit(getByTestId("form-tab2"), { ...testData });

  //     // expect updateSubmissionSuccess to have been called
  //     await waitFor(() => {
  //       expect(updateSubmissionSuccess).toHaveBeenCalled();
  //     });
  //   });

  //   it("handles error if updateSubmission fails", async function() {
  //     // imported function that creates dummy data for form
  //     testData = generateSampleValidate();
  //     // test function that will count calls as well as return error object
  //     updateSubmissionError = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "UPDATE_SUBMISSION_FAILURE" })
  //       );
  //     const handleInputMock = jest.fn();
  //     const updateSubmissionMethodSuccess = jest
  //       .fn()
  //       .mockImplementation(() => Promise.resolve());
  //     createSFOMASuccess = jest
  //       .fn()
  //       .mockImplementation(() => Promise.resolve());

  //     props = {
  //       tab: 1,
  //       apiSubmission: {
  //         updateSubmission: updateSubmissionError,
  //         createSubmission: createSubmissionSuccess,
  //         handleInput: handleInputMock
  //       },
  //       createSubmission: createSubmissionSuccess,
  //       updateSubmission: updateSubmissionMethodSuccess,
  //       ref: {
  //         current: {
  //           createSFOMA: createSFOMASuccess,
  //           updateSubmission: updateSubmissionSuccess
  //         }
  //       },
  //       submission: {
  //         error: null,
  //         formPage1: {}
  //       },
  //       createSFOMA: createSFOMASuccess
  //     };

  //     formElements.handleError = handleErrorMock;

  //     const setupProps = { ...defaultProps, ...props, handleSubmit };
  //     // render form
  //     const user = userEvent.setup();
  //     const { getByTestId, getByRole, debug } = await setup({ ...setupProps });

  //     // simulate submit
  //     await fireEvent.submit(getByTestId("form-tab2"), { ...testData });

  //     // expect handleError to have been called
  //     await waitFor(() => {
  //       expect(formElements.handleError).toHaveBeenCalled();
  //     });
  //   });

  //   it("handles error if updateSubmission throws", async function() {
  //     // imported function that creates dummy data for form
  //     testData = generateSampleValidate();
  //     // test function that will count calls as well as return error object
  //     let createSubmissionError = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.reject({ type: "CREATE_SUBMISSION_FAILURE" })
  //       );
  //     const createSubmissionMethodSuccess = jest
  //       .fn()
  //       .mockImplementation(() => Promise.resolve());
  //     createSFOMASuccess = jest
  //       .fn()
  //       .mockImplementation(() => Promise.resolve());

  //     props = {
  //       tab: 1,
  //       apiSubmission: {
  //         updateSubmission: updateSubmissionSuccess,
  //         createSubmission: createSubmissionError,
  //         handleInput: handleInputMock
  //       },
  //       createSubmission: createSubmissionMethodSuccess,
  //       ref: {
  //         current: {
  //           createSFOMA: createSFOMASuccess,
  //           updateSubmission: updateSubmissionSuccess
  //         }
  //       },
  //       submission: {
  //         error: null,
  //         formPage1: {}
  //       },
  //       createSFOMA: createSFOMASuccess,
  //       location: {
  //         search: "" // coverage for !CAPE
  //       },
  //       embed: true // coverage for embed render edge case
  //     };

  //     // simulate submit with dummy data
  //     formElements.handleError = handleErrorMock;

  //     const setupProps = { ...defaultProps, ...props, handleSubmit };
  //     // render form
  //     const user = userEvent.setup();
  //     const { getByTestId, getByRole, debug } = await setup({ ...setupProps });

  //     // simulate submit
  //     await fireEvent.submit(getByTestId("form-tab2"), { ...testData });

  //     // expect handleError to have been called
  //     await waitFor(() => {
  //       expect(formElements.handleError).toHaveBeenCalled();
  //     });
  //   });
  // });

  // describe("updateSubmission", () => {
  //   it("calls `handleError` if apiSubmission.updateSubmission fails", async function() {
  //     // test function that will count calls as well as return success object
  //     updateSubmissionError = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.reject({ type: "UPDATE_SUBMISSION_FAILURE" })
  //       );

  //     const props = {
  //       tab: 1,
  //       submission: {
  //         submissionId: "123",
  //         formPage1: {},
  //         payment: {}
  //       },
  //       apiSubmission: {
  //         updateSubmission: updateSubmissionError
  //       },
  //       handleError: handleErrorMock,
  //       apiSF: {
  //         createSFOMA: createSFOMASuccess,
  //         getSFEmployers: getSFEmployersSuccess
  //       },
  //       updateSubmission: updateSubmissionError
  //     };

  //     delete testData.signature;

  //     // simulate submit with dummy data
  //     formElements.handleError = handleErrorMock;

  //     const setupProps = { ...defaultProps, ...props, handleSubmit };
  //     // render form
  //     const user = userEvent.setup();
  //     const { getByTestId, getByRole, debug } = await setup({ ...setupProps });

  //     // simulate submit
  //     await fireEvent.submit(getByTestId("form-tab2"), { ...testData });

  //     // expect handleError to have been called
  //     await waitFor(() => {
  //       expect(formElements.handleError).toHaveBeenCalled();
  //     });
  //   });
  //   it("calls `handleError` if apiSubmission.updateSubmission throws", async function() {
  //     // test function that will count calls as well as return success object
  //     updateSubmissionError = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.reject({ type: "UPDATE_SUBMISSION_FAILURE" })
  //       );

  //     const props = {
  //       tab: 1,
  //       submission: {
  //         submissionId: "123",
  //         formPage1: {},
  //         payment: {}
  //       },
  //       apiSubmission: {
  //         updateSubmission: updateSubmissionError
  //       },
  //       handleError: handleErrorMock,
  //       apiSF: {
  //         createSFOMA: createSFOMASuccess,
  //         getSFEmployers: getSFEmployersSuccess
  //       },
  //       updateSubmission: updateSubmissionError
  //     };

  //     delete testData.signature;

  //     // simulate submit with dummy data
  //     formElements.handleError = handleErrorMock;

  //     const setupProps = { ...defaultProps, ...props, handleSubmit };
  //     // render form
  //     const user = userEvent.setup();
  //     const { getByTestId, getByRole, debug } = await setup({ ...setupProps });

  //     // simulate submit
  //     await fireEvent.submit(getByTestId("form-tab2"), { ...testData });

  //     // expect handleError to have been called
  //     await waitFor(() => {
  //       expect(formElements.handleError).toHaveBeenCalled();
  //     });
  //   });
  // });

  // describe("createSubmission", () => {
  //   it("calls `handleTab` if apiSubmission.updateSubmission succeeds", async function() {
  //     // imported function that creates dummy data for form
  //     testData = generateSampleValidate();
  //     // test function that will count calls as well as return success object
  //     const createSubmissionSuccess = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "CREATE_SUBMISSION_SUCCESS" })
  //       );

  //     const updateSubmissionSuccess = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
  //       );

  //     const createSFOMASuccess = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "CREATE_SF_OMA_SUCCESS" })
  //       );

  //     const props = {
  //       tab: 1,
  //       submission: {
  //         submissionId: "123",
  //         formPage1: {},
  //         payment: {}
  //       },
  //       apiSubmission: {
  //         createSubmission: createSubmissionSuccess,
  //         updateSubmission: updateSubmissionSuccess
  //       },
  //       handleError: handleErrorMock,
  //       handleTab: handleTabMock,
  //       apiSF: {
  //         createSFOMA: createSFOMASuccess,
  //         getSFEmployers: getSFEmployersSuccess
  //       },
  //       createSubmission: createSubmissionSuccess,
  //       createSFOMA: createSFOMASuccess
  //     };

  //     delete testData.signature;

  //     // simulate submit with dummy data
  //     formElements.handleError = handleErrorMock;

  //     const setupProps = { ...defaultProps, ...props, handleSubmit };
  //     // render form
  //     const user = userEvent.setup();
  //     const { getByTestId, getByRole, debug } = await setup({ ...setupProps });

  //     // simulate submit
  //     await fireEvent.submit(getByTestId("form-tab2"), { ...testData });

  //     // expect handleTab to have been called
  //     await waitFor(() => {
  //       expect(handleTabMock).toHaveBeenCalled();
  //     });
  //   });
  //   it("calls `handleError` if apiSF.createSFOMA throws", async function() {
  //     // imported function that creates dummy data for form
  //     testData = generateSampleValidate();
  //     // test function that will count calls as well as return success object
  //     const createSubmissionSuccess = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "CREATE_SUBMISSION_SUCCESS" })
  //       );
  //     const createSFOMAError = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.reject({ type: "CREATE_SF_OMA_FAILURE" })
  //       );
  //     const updateSubmissionSuccess = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" })
  //       );

  //     const props = {
  //       tab: 1,
  //       submission: {
  //         submissionId: "123",
  //         formPage1: {},
  //         payment: {}
  //       },
  //       apiSubmission: {
  //         createSubmission: createSubmissionSuccess,
  //         updateSubmission: updateSubmissionSuccess
  //       },
  //       handleError: handleErrorMock,
  //       apiSF: {
  //         createSFOMA: createSFOMAError,
  //         getSFEmployers: getSFEmployersSuccess
  //       },
  //       createSubmission: createSubmissionSuccess,
  //       updateSubission: updateSubmissionSuccess
  //     };

  //     delete testData.signature;

  //     // simulate submit with dummy data
  //     formElements.handleError = handleErrorMock;

  //     const setupProps = { ...defaultProps, ...props, handleSubmit };
  //     // render form
  //     const user = userEvent.setup();
  //     const { getByTestId, getByRole, debug } = await setup({ ...setupProps });

  //     // simulate submit
  //     await fireEvent.submit(getByTestId("form-tab2"), { ...testData });

  //     // expect handleError to have been called
  //     await waitFor(() => {
  //       expect(formElements.handleError).toHaveBeenCalled();
  //     });
  //   });
  //   it("calls `handleError` if apiSubmission.createSubmission fails", async function() {
  //     // imported function that creates dummy data for form
  //     testData = generateSampleValidate();
  //     // test function that will count calls as well as return success object
  //     const createSubmissionSuccess = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "CREATE_SUBMISSION_SUCCESS" })
  //       );

  //     const createSFOMASuccess = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "CREATE_SF_OMA_SUCCESS" })
  //       );

  //     const updateSubmissionError = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "UPDATE_SUBMISSION_FAILURE" })
  //       );

  //     const props = {
  //       tab: 1,
  //       submission: {
  //         submissionId: "123",
  //         formPage1: {},
  //         payment: {}
  //       },
  //       apiSubmission: {
  //         createSubmission: createSubmissionSuccess,
  //         updateSubmission: updateSubmissionError
  //       },
  //       handleError: handleErrorMock,
  //       apiSF: {
  //         createSFOMA: createSFOMASuccess,
  //         getSFEmployers: getSFEmployersSuccess
  //       },
  //       createSubmission: createSubmissionSuccess,
  //       createSFOMA: createSFOMASuccess
  //     };

  //     delete testData.signature;

  //     // simulate submit with dummy data
  //     formElements.handleError = handleErrorMock;

  //     const setupProps = { ...defaultProps, ...props, handleSubmit };
  //     // render form
  //     const user = userEvent.setup();
  //     const { getByTestId, getByRole, debug } = await setup({ ...setupProps });

  //     // simulate submit
  //     await fireEvent.submit(getByTestId("form-tab2"), { ...testData });

  //     // expect handleError to have been called
  //     await waitFor(() => {
  //       expect(formElements.handleError).toHaveBeenCalled();
  //     });
  //   });
  //   it("calls `handleError` if apiSubmission.createSubmission throws", async function() {
  //     // imported function that creates dummy data for form
  //     testData = generateSampleValidate();
  //     // test function that will count calls as well as return success object
  //     const createSubmissionError = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.reject({ type: "CREATE_SUBMISSION_FAILURE" })
  //       );

  //     const props = {
  //       tab: 1,
  //       submission: {
  //         submissionId: "123",
  //         formPage1: {},
  //         payment: {}
  //       },
  //       apiSubmission: {
  //         createSubmission: createSubmissionError
  //       },
  //       handleError: handleErrorMock,
  //       apiSF: {
  //         createSFOMA: createSFOMASuccess,
  //         getSFEmployers: getSFEmployersSuccess
  //       },
  //       createSubmission: createSubmissionError
  //     };

  //     delete testData.signature;

  //     // simulate submit with dummy data
  //     formElements.handleError = handleErrorMock;

  //     const setupProps = { ...defaultProps, ...props, handleSubmit };
  //     // render form
  //     const user = userEvent.setup();
  //     const { getByTestId, getByRole, debug } = await setup({ ...setupProps });

  //     // simulate submit
  //     await fireEvent.submit(getByTestId("form-tab2"), { ...testData });

  //     // expect handleError to have been called
  //     await waitFor(() => {
  //       expect(formElements.handleError).toHaveBeenCalled();
  //     });
  //   });
  // });

  // describe("createSFOMA", () => {
  //   it("handles error if createSFOMA prop fails", async function() {
  //     let createSFOMAError = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "CREATE_SF_OMA_FAILURE" })
  //       );
  //     let generateSubmissionBodyMock = jest
  //       .fn()
  //       .mockImplementation(() => Promise.resolve({}));
  //     const ref = React.createRef();

  //     const props = {
  //       tab: 1,
  //       submission: {
  //         submissionId: "123",
  //         salesforceId: "456",
  //         formPage1: {},
  //         payment: {},
  //         error: "test"
  //       },
  //       apiSubmission: {
  //         updateSubmission: updateSubmissionError
  //       },
  //       handleError: handleErrorMock,
  //       apiSF: {
  //         createSFOMA: createSFOMAError,
  //         getSFEmployers: getSFEmployersSuccess
  //       },
  //       formValues: {
  //         employerType: "test"
  //       },
  //       ref: {
  //         current: {
  //           generateSubmissionBody: generateSubmissionBodyMock
  //         }
  //       }
  //     };

  //     // simulate submit with dummy data
  //     formElements.handleError = handleErrorMock;

  //     const setupProps = { ...defaultProps, ...props, handleSubmit };
  //     // render form
  //     const user = userEvent.setup();
  //     const { getByTestId, getByRole, debug } = await setup({ ...setupProps });

  //     // simulate submit
  //     await fireEvent.submit(getByTestId("form-tab2"), { ...testData });

  //     // expect createSFOMAError to have been called
  //     await waitFor(() => {
  //       expect(createSFOMAError).toHaveBeenCalled();
  //     });
  //   });

  //   it("handles error if createSFOMA prop throws", async function() {
  //     let createSFOMAError = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.reject({ type: "CREATE_SF_OMA_FAILURE" })
  //       );
  //     let generateSubmissionBodyMock = jest
  //       .fn()
  //       .mockImplementation(() => Promise.resolve({}));
  //     formElements.handleError = handleErrorMock;
  //     // creating wrapper
  //     const props = {
  //       tab: 1,
  //       submission: {
  //         submissionId: "123",
  //         salesforceId: "456",
  //         formPage1: {},
  //         payment: {}
  //       },
  //       apiSubmission: {
  //         updateSubmission: updateSubmissionError
  //       },
  //       handleError: handleErrorMock,
  //       apiSF: {
  //         createSFOMA: createSFOMAError,
  //         getSFEmployers: getSFEmployersSuccess
  //       },
  //       formValues: {
  //         employerType: "test"
  //       },
  //       ref: {
  //         current: {
  //           generateSubmissionBody: generateSubmissionBodyMock
  //         }
  //       }
  //     };
  //     // simulate submit with dummy data
  //     formElements.handleError = handleErrorMock;

  //     const setupProps = { ...defaultProps, ...props, handleSubmit };
  //     // render form
  //     const user = userEvent.setup();
  //     const { getByTestId, getByRole, debug } = await setup({ ...setupProps });

  //     // simulate submit
  //     await fireEvent.submit(getByTestId("form-tab2"), { ...testData });

  //     // expect handelError to have been called
  //     await waitFor(() => {
  //       expect(formElements.handleError).toHaveBeenCalled();
  //     });
  //   });
  // });
});
