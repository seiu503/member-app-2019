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
    getSFContactById: () => Promise.resolve({ type: "GET_SF_CONTACT_SUCCESS" }),
    updateSFContact: () =>
      Promise.resolve({ type: "UPDATE_SF_CONTACT_SUCCESS" })
  },
  apiSubmission: {
    saveSubmissionId: jest.fn()
  },
  history: {
    push: pushMock
  },
  addTranslation: jest.fn(),
  actions: {
    setSpinner: jest.fn()
  },
  location: {
    search: "?cId=1&aId=3&sId=2"
  }
};

let getSFContactByIdError = jest
  .fn()
  .mockImplementation(() => Promise.reject({ type: "GET_SF_CONTACT_FAILURE" }));

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
    let props = {
      submission: {
        salesforceId: "1"
      },
      apiSF: { getSFContactById }
    };
    store = storeFactory(initialState);
    wrapper = mount(
      <Provider store={store}>
        <SubmissionFormPage2Connected {...defaultProps} {...props} />
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
      apiSF: { getSFContactById }
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
  test("handles error if `getSFContactById` throws", () => {
    getSFContactByIdError = jest
      .fn()
      .mockImplementation(() =>
        Promise.reject({ type: "GET_SF_CONTACT_FAILURE" })
      );
    let props = {
      submission: {
        salesforceId: "1"
      },
      apiSF: {
        getSFContactById: getSFContactByIdError
      }
    };
    wrapper = setup(props);
    wrapper.instance().componentDidMount();

    expect(getSFContactByIdError.mock.calls.length).toBe(1);
  });
});
