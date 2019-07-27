import React from "react";
import { mount, shallow } from "enzyme";
import { unwrap } from "@material-ui/core/test-utils";
import { findByTestAttr, storeFactory } from "../../utils/testUtils";

// Needed to create simple store to test connected component
import { reducer as formReducer } from "redux-form";
import submission, { INITIAL_STATE } from "../../store/reducers/submission";
import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";

import { generateSampleValidate } from "../../../../app/utils/fieldConfigs";
import SubmissionFormWrap, {
  SubmissionFormPage1Container
} from "../../containers/SubmissionFormPage1";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store;
let wrapper;

const initialState = {
  ...INITIAL_STATE
};

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
  location: {
    search: {
      id: ""
    }
  },
  classes: {},
  apiSF: {
    getSFEmployers: () => Promise.resolve({ type: "GET_SF_EMPLOYER_SUCCESS" })
  },
  history: {
    push: jest.fn()
  }
};

const unconnectedSetup = () => {
  const setupProps = { ...defaultProps };
  return shallow(<SubmissionFormPage1Container {...setupProps} />);
};

describe("<SubmissionFormPage1Container /> unconnected", () => {
  it("renders without error", () => {
    wrapper = unconnectedSetup();
    const component = findByTestAttr(
      wrapper,
      "container-submission-form-page-1"
    );
    expect(component.length).toBe(1);
  });
});
