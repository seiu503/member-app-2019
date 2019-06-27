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
import SubmissionForm, {
  SubmissionFormReduxForm
} from "../../containers/SubmissionForm";
import { findByTestAttr } from "../../utils/testUtils";

// variables
let wrapper,
  touched,
  error,
  addSubmissionMock,
  mockStore,
  addSubmissionErrorMock,
  handleSubmitMock,
  testData,
  store,
  submitting,
  loading;

// const SubmissionFormNaked = unwrap(SubmissionForm);

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
  }
};
const options = {
  untilSelector: "ContentTile"
};
const muiShallow = createShallow(options);

// setup for unwrapped, un-connected component
const unconnectedSetup = () => {
  const setUpProps = { handleSubmit: jest.fn(), ...defaultProps };
  return shallow(<SubmissionFormComponent {...setUpProps} />);
};

// setup for redux-form wrapped component... I think
const connectedSetup = (props = {}) => {
  // create basic store
  mockStore = createStore(combineReducers({ form: formReducer }));
  addSubmissionMock = jest.fn();
  addSubmissionErrorMock = jest.fn();
  handleSubmitMock = jest.fn();
  // props to pass to test subject
  props = {
    ...defaultProps,
    apiSubmission: {
      addSubmission: addSubmissionMock,
      addSubmissionError: addSubmissionErrorMock
    },
    handleSubmit: handleSubmitMock
  };

  // mockConnected component with props
  let subject = mount(
    <Provider store={mockStore} {...defaultProps}>
      <SubmissionFormReduxForm {...props} />
    </Provider>
  );
  return subject;
};

describe("Connected Form", () => {
  beforeEach(() => {
    submitting = false;
    touched = false;
    error = true;
    loading = false;
    wrapper = connectedSetup();
  });
  afterEach(() => {
    addSubmissionMock.mockRestore();
    addSubmissionErrorMock.mockRestore();
    handleSubmitMock.mockRestore();
  });
  test("calls handleSubmit", () => {
    testData = generateSampleValidate();
    const form = wrapper.find(`[id="submissionForm"]`);
    wrapper.setState({
      form: { values: generateSampleValidate }
    });
    console.log(wrapper.state);
    wrapper.simulate("submit");
    expect(handleSubmitMock.mock.calls.length).toBe(1);
  });
});

export const styles = theme => ({
  root: {
    margin: "40px 0"
  },
  container: {
    padding: "80px 0 140px 0"
  },
  head: {
    color: theme.palette.primary.light
  },
  form: {
    maxWidth: 600,
    margin: "auto"
  },
  group: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center"
  },
  input: {
    width: "100%",
    margin: "0 0 20px 0"
  },
  select: {
    width: "100%",
    margin: "0 0 20px 0"
  },
  formButton: {
    width: "100%",
    padding: 20
  },
  formControl: {
    width: "100%"
  },
  formControlLabel: {
    width: "100%"
  },
  formLabel: {
    margin: "10px 0"
  }
});
