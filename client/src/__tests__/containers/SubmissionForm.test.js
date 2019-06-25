import React from "react";
import { shallow, mount } from "enzyme";
import sinon from "sinon";
import configureStore from "redux-mock-store";

// Needed to create simple store to test connected component
import { reducer as formReducer } from "redux-form";
import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";
import { unwrap, createShallow } from "@material-ui/core/test-utils";

import {
  generateSampleSubmission,
  generateSampleValidate
} from "../../../../app/utils/fieldConfigs";
import validate from "../../utils/validators";
import SubmissionForm, {
  SubmissionFormUnconnected,
  SubmissionFormReduxForm
} from "../../containers/SubmissionForm";
import { findByTestAttr } from "../../utils/testUtils";

// variables
let store,
  wrapper,
  submitting,
  touched,
  error,
  loading,
  addSubmissionMock,
  addSubmissionErrorMock,
  testData,
  mockStore,
  handleSubmit;

const SubmissionFormNaked = unwrap(SubmissionForm);

// handleSubmit mock functions
const simpleHandleSubmitMock = jest.fn();

// create simple initial state
const defaultProps = {
  submission: {
    error: null,
    loading: false
  },
  initialValues: {
    mm: "",
    onlineCampaignSource: null
  },
  formValues: {
    mm: "",
    onlineCampaignSource: null
  },
  classes: { test: "test" },
  fields: {
    firstName: {
      value: "",
      touched: touched,
      error: error
    }
  },
  handleSubmit: simpleHandleSubmitMock
};

// setup for unwrapped, un-connected component
const unconnectedSetup = () => {
  return shallow(<SubmissionFormUnconnected {...defaultProps} />);
};

const options = {
  untilSelector: "ContentTile"
};
const muiShallow = createShallow(options);

// setup for redux-form wrapped component... I think
const connectedSetup = (props = {}) => {
  // create basic store
  mockStore = createStore(combineReducers({ form: formReducer }));

  // spy function to test submit was called NOT USING RIGHT NOW
  // handleSubmit = sinon.stub().returns(Promise.resolve());

  // props to pass to test subject
  props = {
    ...defaultProps
  };

  // mockConnected component with props
  let subject = mount(
    <Provider store={mockStore} {...defaultProps}>
      <SubmissionFormReduxForm {...props} />
    </Provider>
  );
  return subject;
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
});

describe("Redux-Form custom Validators", () => {
  beforeEach(() => {
    testData = generateSampleValidate();
  });
  test("no errors on well formed values", () => {
    expect(validate(testData)).toStrictEqual({});
  });
  test("adds required field to errors returned", () => {
    delete testData.firstName;
    expect(validate(testData)).toStrictEqual({ firstName: "Required" });
  });
  test("validates properly formed phone numbers", () => {
    testData.mobilePhone = 55;
    expect(validate(testData)).toStrictEqual({
      mobilePhone: "Invalid phone number (e.g. 555-123-456)"
    });
  });
  test("validates properly formed emails", () => {
    testData.homeEmail = "fake@email";
    expect(validate(testData)).toStrictEqual({
      homeEmail: "Invalid email address (e.g. sample@email.com)"
    });
  });
  test("validates properly formed zip codes", () => {
    testData.homePostalCode = 4444;
    expect(validate(testData)).toStrictEqual({
      homePostalCode: "Must be at exactly 5 characters long"
    });
  });
});

describe("Connected Form", () => {
  beforeEach(() => {
    submitting = false;
    touched = false;
    error = null;
    loading = false;
    addSubmissionMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
      );
    addSubmissionErrorMock = jest.fn().mockImplementation(() => {
      wrapper.instance().props.submission.error =
        "Sorry, something went wrong :(";
      wrapper.instance().forceUpdate();
      return Promise.reject("Sorry, something went wrong :(");
    });
    wrapper = connectedSetup();
  });
  afterEach(() => {
    addSubmissionMock.mockRestore();
    addSubmissionErrorMock.mockRestore();
    simpleHandleSubmitMock.mockRestore();
  });
  test("calls handleSubmit", () => {
    testData = generateSampleValidate();
    const form = wrapper.find(`[id="submissionForm"]`);
    // for (let key in testData) {
    //   let input = wrapper.find(`[id="${key}"]`)
    //   input.simulate('change', { target: { value: testData[key] } })
    // }
    form.simulate("submit");
    expect(simpleHandleSubmitMock.mock.calls.length).toBe(1);
  });
});
