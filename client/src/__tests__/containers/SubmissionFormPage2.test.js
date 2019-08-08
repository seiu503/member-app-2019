import React from "react";
import { mount, shallow } from "enzyme";
import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import { Provider } from "react-redux";

// Needed to create simple store to test connected component
import { INITIAL_STATE } from "../../store/reducers/submission";
import * as apiSForce from "../../store/actions/apiSFActions";
import {
  SubmissionFormPage2Connected,
  SubmissionFormPage2Container
} from "../../containers/SubmissionFormPage2";
import { getSFContactById } from "../../store/actions/apiSFActions";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store;
let wrapper;

let pushMock = jest.fn();

const initialState = {
  submission: {
    salesforceId: "1"
  },
  appState: {
    loading: false,
    error: ""
  },
  formValues: {}
};

const defaultProps = {
  submission: {
    error: null,
    loading: false,
    salesforceId: "1"
  },
  classes: {},
  apiSF: {
    getSFContactById: () => Promise.resolve({ type: "GET_SF_CONTACT_SUCCESS" })
  },
  apiSubmission: {
    classes: { test: "test" }
  },
  history: {
    push: pushMock
  }
};

const setup = (props = {}) => {
  store = mockStore(defaultProps);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<SubmissionFormPage2Container {...setupProps} />);
};

describe("<SubmissionFormPage2Container /> unconnected", () => {
  it("renders without error", () => {
    wrapper = setup();
    const component = findByTestAttr(
      wrapper,
      "container-submission-form-page-2"
    );
    expect(component.length).toBe(1);
  });

  it("renders connected component", () => {
    store = storeFactory(initialState);
    wrapper = mount(
      <Provider store={store}>
        <SubmissionFormPage2Connected {...defaultProps} />
      </Provider>
    );
    const component = findByTestAttr(
      wrapper,
      "container-submission-form-page-2"
    );
    expect(component.length).toBe(1);
  });

  it("should have access to expected props", () => {
    wrapper = setup();
    expect(wrapper.instance().props.submission.salesforceId).toBe("1");
  });

  test("calls `getSFContactById` on componentDidMount if SFid in state", () => {
    let props = {
      submission: {
        salesforceId: "1"
      },
      apiSF: { getSFContactById: getSFContactById }
    };
    store = storeFactory(initialState);
    const dispatchSpy = jest.spyOn(apiSForce, "getSFContactById");
    wrapper = mount(
      <Provider store={store}>
        <SubmissionFormPage2Connected {...defaultProps} {...props} />
      </Provider>
    );
    // console.log(dispatchSpy.mock.calls);
    const spyCall = dispatchSpy.mock.calls[0][0];
    expect(spyCall).toEqual("1");
  });

  // test("alert pops up if no SF Id", () => {
  //   let props = {
  //     submission: {
  //       error: null,
  //   loading: false,
  //       salesforceId: null
  //     },
  //     apiSF: { getSFContactById: getSFContactById }
  //   };
  //   store = storeFactory(initialState);
  //   window.alert = jest.fn();
  //   wrapper = setup(props)
  //   console.log(wrapper.instance().props.submission)
  //   console.log(window.alert.mock);
  //   expect(window.alert).toHaveBeenCalled();
  // })
});

// jest.spyOn(window, 'alert').mockImplementation(() => { });
// const formWrapper = wrapper.find(Form).dive();
// jest.spyOn(formWrapper.instance(), '_handleSubmit');
// formWrapper.find("form").simulate("submit");
// expect(formWrapper.instance()._handleSubmit).toBeCalled();
// expect(window.alert).toBeCalledWith(...);
