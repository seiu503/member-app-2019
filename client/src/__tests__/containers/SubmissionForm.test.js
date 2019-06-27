import React from "react";
import { mount } from "enzyme";
import { unwrap } from "@material-ui/core/test-utils";

// Needed to create simple store to test connected component
import { reducer as formReducer } from "redux-form";
import submission from "../../store/reducers/submission";
import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";

import { generateSampleValidate } from "../../../../app/utils/fieldConfigs";
import SubmissionForm from "../../containers/SubmissionForm";

const SubmissionFormNaked = unwrap(SubmissionForm);

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
  classes: {}
};

let count = 0;
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
      handleSubmit
    };
    wrapper = mount(
      <Provider store={store}>
        <SubmissionFormNaked {...props} />
      </Provider>
    );
  });
  afterEach(() => {
    handleSubmit.mockRestore();
  });

  test("calls handleSubmit", () => {
    testData = generateSampleValidate();
    const form = wrapper.find(`[id="submissionForm"]`).first();
    form.simulate("submit", testData);
    expect(handleSubmit).toHaveBeenCalled();
  });
});
