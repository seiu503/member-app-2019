import React from "react";
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

let getAllSubmissionsMock = jest
    .fn()
    .mockImplementation(() =>
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
    currentContent: {
      id: "3",
      ...submissionData
    }
  },
  apiSubmission: {
    getAllSubmissions: getAllSubmissionsMock
  },
  classes: { test: "test" },
  history: {
    push: jest.fn()
  }
};

/**
 * Factory function to create a ShallowWrapper for the ContentLibrary component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  store = mockStore(defaultProps);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<SubmissionsTableUnconnected {...setupProps} store={store} />);
};

describe("<SubmissionsTable />", () => {
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

  describe("tests that require mocked redux actions", () => {
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

    test("calls `getAllSubmissions` prop on component update (new authToken)", () => {
      const prevProps = {
        ...defaultProps,
        appState: {
          authToken: null
        }
      };

      // run lifecycle method
      wrapper.instance().componentDidUpdate(prevProps);
      // expect the mock to have been called once
      expect(getAllSubmissionsMock.mock.calls.length).toBe(1);
    });

    test("calls `getAllSubmissions` prop on component update (new content)", () => {
      const prevProps = {
        submission: {
          allSubmissions: []
        },
        appState: {
          authToken: "12345"
        }
      };

      // run lifecycle method
      wrapper.instance().componentDidUpdate(prevProps);

      // expect the mock to have been called once
      expect(getAllSubmissionsMock.mock.calls.length).toBe(1);
    });

    // test negative branches for componentDidMount (doesn't call action if conditions not met)
  });
});
