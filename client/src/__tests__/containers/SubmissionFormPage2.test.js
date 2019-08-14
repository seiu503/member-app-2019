import React from "react";
import { mount, shallow } from "enzyme";
import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import { Provider } from "react-redux";

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
  }
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
});
