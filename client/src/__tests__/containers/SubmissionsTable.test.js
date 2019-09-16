import React from "react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { shallow, mount } from "enzyme";
import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import {
  SubmissionsTableUnconnected,
  SubmissionsTableConnected
} from "../../containers/SubmissionsTable";
import { generateSampleSubmission } from "../../../../app/utils/fieldConfigs";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();
const submissionData = generateSampleSubmission();

let store;

let getAllSubmissionsMock = jest.fn().mockImplementation(() =>
    Promise.resolve({
      type: "GET_ALL_SUBMISSIONS_SUCCESS",
      payload: [{ ...submissionData }]
    })
  ),
  getAllSubmissionsErrorMock = jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve({ type: "GET_ALL_SUBMISSIONS_FAILURE" })
    ),
  deleteSubmissionMock = jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve({ type: "DELETE_SUBMISSION_SUCCESS" })
    ),
  deleteSubmissionErrorMock = jest.fn().mockImplementation(() => {
    wrapper.instance().props.submission.error =
      "An error occurred and the submission was not deleted.";
    wrapper.instance().forceUpdate();
    return Promise.resolve({ type: "DELETE_SUBMISSION_FAILURE" });
  }),
  wrapper;

const initialState = {
  appState: {
    loggedIn: false,
    authToken: ""
  },
  submission: {
    error: "",
    loading: false,
    currentSubmission: {},
    allSubmissions: [{}]
  }
};

const defaultProps = {
  appState: {
    loggedIn: true,
    authToken: "12345"
  },
  submission: {
    filteredList: [],
    deleteDialogOpen: false,
    allSubmissions: [
      {
        id: "1",
        ...submissionData
      },
      {
        id: "2",
        ...submissionData
      }
    ],
    currentSubmission: {
      id: "3",
      ...submissionData
    }
  },
  apiSubmission: {
    getAllSubmissions: getAllSubmissionsMock,
    deleteSubmission: deleteSubmissionMock
  },
  classes: { test: "test" },
  history: {
    push: jest.fn()
  }
};

/**
 * Factory function to create a ShallowWrapper for the SubmissionsTable component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  store = mockStore(defaultProps);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<SubmissionsTableUnconnected {...setupProps} store={store} />);
};

const mountedSetup = route => {
  store = storeFactory(initialState);
  return mount(
    <Provider store={store}>
      <BrowserRouter initialEntries={[route]}>
        <SubmissionsTableConnected {...defaultProps} />
      </BrowserRouter>
    </Provider>
  );
};

describe("<SubmissionsTable />", () => {
  describe("basic setup", () => {
    beforeEach(() => {
      wrapper = setup();
    });

    afterEach(() => {
      jest.clearAllMocks();
      wrapper.instance().props.submission.error = "";
    });

    it("renders without error", () => {
      const component = findByTestAttr(wrapper, "component-submissions-table");
      expect(component.length).toBe(1);
    });

    it("renders connected component", () => {
      store = storeFactory(initialState);
      wrapper = shallow(
        <SubmissionsTableConnected {...defaultProps} store={store} />
      )
        .dive()
        .dive();
      const component = findByTestAttr(wrapper, "component-submissions-table");
      expect(component.length).toBe(1);
    });

    it("should have access to expected props", () => {
      wrapper = setup();
      // test that the state values were correctly passed as props
      expect(wrapper.instance().props.appState.loggedIn).toBe(true);
    });

    test("renders an alert dialog when `deleteDialogOpen` is true", () => {
      wrapper.setProps({
        submission: {
          ...defaultProps.submission,
          deleteDialogOpen: true
        }
      });
      const component = findByTestAttr(wrapper, "alert-dialog");
      expect(component.length).toBe(1);
    });

    test("`handleDeleteDialogOpen` method calls handleDeleteOpen prop", () => {
      // create a mock function so we can see whether it's called on click
      const handleDeleteOpenMock = jest.fn();

      wrapper.instance().props.apiSubmission.handleDeleteOpen = handleDeleteOpenMock;
      const submData = { ...defaultProps.submission.currentSubmission };

      wrapper.instance().handleDeleteDialogOpen(submData);

      // expect the mock to have been called once
      expect(handleDeleteOpenMock.mock.calls.length).toBe(1);
    });

    test("`deleteAndClose` method calls handleDeleteClose prop", () => {
      // create a mock function so we can see whether it's called on click
      const handleDeleteCloseMock = jest.fn();

      wrapper.instance().props.apiSubmission.handleDeleteClose = handleDeleteCloseMock;
      const submData = { ...defaultProps.submission.currentSubmission };

      wrapper.instance().deleteAndClose();

      // expect the mock to have been called once
      expect(handleDeleteCloseMock.mock.calls.length).toBe(1);
    });
  });

  describe("componentDidMount", () => {
    beforeEach(() => {
      wrapper = setup();
    });
    afterEach(() => {
      jest.clearAllMocks();
      wrapper.instance().props.submission.error = "";
    });

    test("calls `getAllSubmissions` prop on component mount", () => {
      // run lifecycle method
      wrapper.instance().componentDidMount();

      // expect the mock to have been called once
      expect(getAllSubmissionsMock.mock.calls.length).toBe(1);
    });

    test("`getAllSubmissions` handles error if API call fails", () => {
      // run lifecycle method
      const props = {
        apiSubmission: {
          getAllSubmissions: getAllSubmissionsErrorMock
        }
      };
      wrapper = setup(props);
      wrapper.instance().componentDidMount();

      // expect the mock to have been called once
      expect(getAllSubmissionsErrorMock.mock.calls.length).toBe(1);
    });

    test("`getAllSubmissions` handles error if API call throws", () => {
      getAllSubmissionsErrorMock = jest.fn().mockImplementation(() => {
        return Promise.reject(new Error());
      });
      // run lifecycle method
      const props = {
        apiSubmission: {
          getAllSubmissions: getAllSubmissionsErrorMock
        }
      };
      wrapper = setup(props);
      wrapper.instance().componentDidMount();

      // expect the mock to have been called once
      expect(getAllSubmissionsErrorMock.mock.calls.length).toBe(1);
    });
  });

  describe("deleteSubmission", () => {
    beforeEach(() => {
      wrapper = setup();
    });
    afterEach(() => {
      jest.clearAllMocks();
      wrapper.instance().props.submission.error = "";
    });
    test("`this.deleteSubmission` calls deleteSubmission prop func", () => {
      const submData = { ...defaultProps.submission.currentSubmission };
      wrapper.instance().deleteSubmission(submData);
      expect(deleteSubmissionMock.mock.calls.length).toBe(1);
    });

    test("`this.deleteSubmission` returns an error if deleteSubmission api call fails", () => {
      wrapper.instance().props.apiSubmission.deleteSubmission = deleteSubmissionErrorMock;
      const submData = { junkData: "that will fail" };
      wrapper.instance().deleteSubmission(submData);
      expect(wrapper.instance().props.submission.error).toBe(
        "An error occurred and the submission was not deleted."
      );
    });

    test("`this.deleteSubmission` returns an error if deleteSubmission api call throws", () => {
      deleteSubmissionErrorMock = jest.fn().mockImplementation(() => {
        return Promise.reject(new Error());
      });
      wrapper.instance().props.apiSubmission.deleteSubmission = deleteSubmissionErrorMock;
      const submData = { junkData: "that will fail" };
      wrapper.instance().deleteSubmission(submData);
      expect(deleteSubmissionErrorMock.mock.calls.length).toBe(1);
    });
  });

  describe("componentDidUpdate", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test("calls `getAllSubmissions` prop on component update (new authToken)", () => {
      const prevProps = {
        ...defaultProps,
        appState: {
          authToken: null
        },
        submission: {
          allSubmissions: [
            {
              id: "1",
              ...submissionData
            },
            {
              id: "2",
              ...submissionData
            }
          ]
        }
      };
      wrapper.instance().props.apiSubmission.getAllSubmissions = getAllSubmissionsMock;
      // run lifecycle method
      wrapper.instance().componentDidUpdate(prevProps);
      // expect the mock to have been called once
      expect(getAllSubmissionsMock.mock.calls.length).toBe(1);
    });

    test("`getAllSubmissions` handles error if API call fails", () => {
      const prevProps = {
        ...defaultProps,
        appState: {
          authToken: null
        },
        submission: {
          allSubmissions: [
            {
              id: "1",
              ...submissionData
            },
            {
              id: "2",
              ...submissionData
            }
          ]
        }
      };
      const props = {
        apiSubmission: {
          getAllSubmissions: getAllSubmissionsErrorMock
        }
      };
      wrapper = setup(props);
      wrapper.instance().componentDidUpdate(prevProps);

      // expect the mock to have been called once
      expect(getAllSubmissionsErrorMock.mock.calls.length).toBe(1);
    });

    test("calls `getAllSubmissions` prop on component update (new submissions)", () => {
      const prevProps = {
        submission: {
          allSubmissions: []
        },
        appState: {
          authToken: "12345"
        }
      };
      wrapper.instance().props.apiSubmission.getAllSubmissions = getAllSubmissionsMock;
      // run lifecycle method
      wrapper.instance().componentDidUpdate(prevProps);

      // expect the mock to have been called once
      expect(getAllSubmissionsMock.mock.calls.length).toBe(1);
    });

    test("`getAllSubmissions` handles error if API call throws", () => {
      getAllSubmissionsErrorMock = jest.fn().mockImplementation(() => {
        return Promise.reject(new Error());
      });
      const prevProps = {
        ...defaultProps,
        appState: {
          authToken: null
        },
        submission: {
          allSubmissions: [
            {
              id: "1",
              ...submissionData
            },
            {
              id: "2",
              ...submissionData
            }
          ]
        }
      };
      // run lifecycle method
      const props = {
        apiSubmission: {
          getAllSubmissions: getAllSubmissionsErrorMock
        }
      };
      wrapper = setup(props);
      wrapper.instance().componentDidUpdate(prevProps);

      // expect the mock to have been called once
      expect(getAllSubmissionsErrorMock.mock.calls.length).toBe(1);
    });
  });

  describe("mount", () => {
    // it("renders mounted component", () => {
    //   wrapper = mountedSetup(defaultProps);
    // });
  });

  // test negative branches for componentDidMount (doesn't call action if conditions not met)
});
