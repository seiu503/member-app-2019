import React from "react";
import { mount, shallow } from "enzyme";
import { unwrap } from "@material-ui/core/test-utils";

// Needed to create simple store to test connected component
import { reducer as formReducer } from "redux-form";
import submission from "../../store/reducers/submission";
import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";

import { generateSampleValidate } from "../../../../app/utils/fieldConfigs";
import SubmissionFormWrap from "../../containers/SubmissionFormPage1";

// const SubmissionFormUnwrapped = unwrap(SubmissionFormWrap);

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
      id: "0036100001gYL0HAAW"
    }
  },
  classes: {},
  apiSF: {
    getSFEmployers: () => Promise.resolve({ type: "GET_SF_EMPLOYER_SUCCESS" })
  }
};

describe("Connected Form", () => {
  let store, handleSubmit, wrapper, testData;

  beforeEach(() => {
    store = createStore(
      combineReducers({
        form: formReducer,
        submission
      })
    );
    handleSubmit = jest.fn().mockName("handleSubmit");
    const props = {
      ...defaultProps,
      handleSubmit,
      apiSF: {
        getSFEmployers: () =>
          Promise.resolve({ type: "GET_SF_EMPLOYER_SUCCESS" })
      }
    };
    // wrapper = mount(
    //   <Provider store={store}>
    //     <SubmissionFormWrap {...props} />
    //   </Provider>
    // );
    wrapper = shallow(<SubmissionFormWrap {...props} />);
  });
  afterEach(() => {
    handleSubmit.mockRestore();
  });

  test("calls handleSubmit", () => {
    testData = generateSampleValidate();
    const form = wrapper.find(`[id="submissionFormPage1"]`).first();
    form.simulate("submit", testData);
    expect(handleSubmit).toHaveBeenCalled();
  });
});
