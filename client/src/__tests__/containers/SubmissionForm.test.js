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

let store, wrapper;

const options = {
  untilSelector: "ContentTile"
};
const muiShallow = createShallow(options);
const mockStore = configureStore();

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
    addSubmission: jest.fn(),
    clearForm: jest.fn()
  },
  classes: { test: "test" },
  history: {
    push: jest.fn()
  },
  handleSubmit: jest.fn()
};

const setup = (props = {}) => {
  store = configureStore(defaultProps);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<SubmissionForm />, {
    ...setupProps,
    context: { store: mockStore() }
  });
};

describe("Unconnected <SubmissionForm />", () => {
  it("renders without error", () => {
    wrapper = shallow(<SubmissionFormUnconnected {...defaultProps} />);
    const component = findByTestAttr(wrapper, "component-submissionform");
    expect(component.length).toBe(1);
  });
});
