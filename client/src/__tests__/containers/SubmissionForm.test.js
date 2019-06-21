import React from "react";
import { shallow } from "enzyme";
import { unwrap, createShallow } from "@material-ui/core/test-utils";
import { BrowserRouter as Router } from "react-router-dom";
import configureStore from "redux-mock-store";

import SubmissionForm, {
  SubmissionFormUnconnected,
  SubmissionFormReduxForm
} from "../../containers/SubmissionForm";
import { findByTestAttr } from "../../utils/testUtils";
import * as utils from "../../utils";

// variables
let store,
  wrapper,
  submitting,
  touched,
  error,
  addSubmissionMock,
  addSubmissionErrorMock,
  handleSubmit;

// create fake store
const mockStore = configureStore();

// handleSubmit mock functions
const simpleHandleSubmitMock = jest.fn();

// create any initial state needed
const defaultProps = {
  submission: {
    error: null
  },
  initialValues: {
    mm: "",
    onlineCampaignSource: null
  },
  formValues: {
    mm: "",
    onlineCampaignSource: null
  },
  apiSubmission: {
    addSubmission: addSubmissionMock
  },
  classes: { test: "test" },
  submitting: submitting,
  fields: {
    firstName: {
      value: "",
      touched: touched,
      error: error
    }
  },
  handleSubmit: simpleHandleSubmitMock
};

// eventually going to use to unwrap mui
const options = {
  untilSelector: "ContentTile"
};
const muiShallow = createShallow(options);

// setup for redux-form wrapped component... I think
const reduxFormSetup = (props = {}) => {
  store = mockStore(defaultProps);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<SubmissionFormReduxForm />, {
    ...setupProps,
    context: { store: store }
  });
};

// setup for unwrapped, un-connected component
const unconnectedSetup = () => {
  return shallow(<SubmissionFormUnconnected {...defaultProps} />);
};

describe("Unconnected <SubmissionForm />", () => {
  beforeEach(() => {
    wrapper = unconnectedSetup();
  });
  afterEach(() => {
    simpleHandleSubmitMock.mockRestore();
  });
  it("renders without error", () => {
    const component = findByTestAttr(wrapper, "component-submissionform");
    expect(component.length).toBe(1);
  });
  it("has access to `submission error` prop", () => {
    expect(wrapper.instance().props.submission.error).toBe(null);
  });
  it("has access to `classes` prop", () => {
    expect(typeof wrapper.instance().props.classes).toBe("object");
    expect(wrapper.instance().props.classes.test).toBe("test");
  });
  it("has access to `initialValues` prop", () => {
    expect(typeof wrapper.instance().props.formValues).toBe("object");
    expect(wrapper.instance().props.initialValues.mm).toBe("");
    expect(wrapper.instance().props.initialValues.onlineCampaignSource).toBe(
      null
    );
  });
  it("calls handleSubmit when form is submitted", () => {
    console.log(wrapper.debug());
    const form = wrapper.find(`[id="submissionForm"]`).first();
    form.simulate("submit");
    expect(simpleHandleSubmitMock.mock.calls.length).toBe(1);
  });

  // describe("tests that require mocked redux actions", () => {
  //   beforeEach(() => {
  //     submitting = false
  //     touched = false
  //     error = null
  //     addSubmissionMock = jest
  //     .fn()
  //     .mockImplementation(() =>
  //       Promise.resolve({type: "ADD_SUBMISSION_SUCCESS"}))
  //     addSubmissionErrorMock = jest
  //     .fn()
  //     .mockImplementation(() => {
  //       wrapper.instance().props.submission.error =
  //       "Sorry, something went wrong :(";
  //     wrapper.instance().forceUpdate();
  //     return Promise.reject(
  //       "Sorry, something went wrong :("
  //     );
  //   });
  //     wrapper = unconnectedSetup()
  //   });
  //   afterEach(() => {
  //     addSubmissionMock.mockRestore();
  //     addSubmissionErrorMock.mockRestore();
  //   });
  // });
});

// describe("ReduxForm Wrapped <SubmissionForm />", () => {
//   beforeEach(() => {
//     wrapper = reduxFormSetup()
//     console.log(wrapper.debug())
//   });
//   it("sets the form to `submission`", () => {

//   });
//   it("validates", () => {

//   });

// });
