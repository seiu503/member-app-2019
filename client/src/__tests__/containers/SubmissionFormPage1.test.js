import React from "react";
import { mount, shallow } from "enzyme";
import moment from "moment";
import {
  findByTestAttr,
  storeFactory,
  fakeDataURI
} from "../../utils/testUtils";
import { Provider } from "react-redux";
import "jest-canvas-mock";

import * as apiSForce from "../../store/actions/apiSFActions";
import * as apiContent from "../../store/actions/apiContentActions";
import {
  SubmissionFormPage1Connected,
  SubmissionFormPage1Container
} from "../../containers/SubmissionFormPage1";
import { getSFContactById } from "../../store/actions/apiSFActions";
import { uploadImage } from "../../store/actions/apiContentActions";
import { handleInput } from "../../store/actions/apiSubmissionActions";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store, wrapper, trimSignatureMock;

let pushMock = jest.fn();

const reCaptchaRef = {
  current: {
    getValue: jest.fn()
  }
};

const sigBox = {
  current: {
    toDataURL: jest.fn(),
    clear: jest.fn()
  }
};

const initialState = {
  appState: {
    loading: false,
    error: ""
  }
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
    search: "id=1"
  },
  classes: {},
  apiSF: {
    getSFEmployers: () => Promise.resolve({ type: "GET_SF_EMPLOYER_SUCCESS" }),
    getSFContactById: () =>
      Promise.resolve({
        type: "GET_SF_CONTACT_SUCCESS",
        payload: { Birthdate: moment("01-01-1900", "MM-DD-YYYY") }
      })
  },
  apiSubmission: {
    classes: { test: "test" }
  },
  history: {
    push: pushMock
  },
  reCaptchaRef: { ...reCaptchaRef },
  sigBox: { ...sigBox }
};

const setup = (props = {}) => {
  store = mockStore(initialState);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<SubmissionFormPage1Container {...setupProps} />);
};

describe("<SubmissionFormPage1Container /> unconnected", () => {
  it("renders without error", () => {
    wrapper = setup();
    const component = findByTestAttr(
      wrapper,
      "container-submission-form-page-1"
    );
    expect(component.length).toBe(1);
  });

  it("renders connected component", () => {
    store = storeFactory(initialState);
    wrapper = mount(
      <Provider store={store}>
        <SubmissionFormPage1Connected {...defaultProps} />
      </Provider>
    );
    const component = findByTestAttr(
      wrapper,
      "container-submission-form-page-1"
    );
    expect(component.length).toBe(1);
  });

  it("should have access to expected props", () => {
    wrapper = setup();
    expect(wrapper.instance().props.formValues.mm).toBe("");
  });

  test("calls `getSFContactById` on componentDidMount if id in query", () => {
    let props = {
      location: {
        search: "id=1"
      },
      apiSF: { getSFContactById: getSFContactById }
    };
    store = storeFactory(initialState);
    const dispatchSpy = jest.spyOn(apiSForce, "getSFContactById");
    wrapper = mount(
      <Provider store={store}>
        <SubmissionFormPage1Connected {...defaultProps} {...props} />
      </Provider>
    );
    // console.log(dispatchSpy.mock.calls);
    const spyCall = dispatchSpy.mock.calls[0][0];
    expect(spyCall).toEqual("1");
  });

  test("`handeOpen` opens modal", () => {
    wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
    wrapper.instance().handleOpen();
    expect(wrapper.instance().state.open).toBe(true);
  });

  test("`handeClose` closes modal", () => {
    wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
    wrapper.instance().handleClose();
    expect(wrapper.instance().state.open).toBe(false);
  });

  test("`handeUpload` calls apiContent.uploadImage", () => {
    let uploadImageMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "UPLOAD_IMAGE_SUCCESS" })
      );
    let props = {
      apiContent: { uploadImage: uploadImageMock }
    };

    wrapper = shallow(
      <SubmissionFormPage1Container {...defaultProps} {...props} />
    );

    let blob = new Blob([""], { type: "image/jpg" });
    blob["lastModifiedDate"] = "";
    blob["name"] = "filename";
    let fakeFile = blob;
    trimSignatureMock = jest.fn().mockImplementation(() => fakeFile);
    wrapper.instance().trimSignature = trimSignatureMock;
    wrapper.instance().handleUpload("firstname", "lastname");
    expect(uploadImageMock.mock.calls.length).toBe(1);
  });

  test("`handeTab` saves legalLanguage and signature if newValue === 2", () => {
    let handleInputMock = jest.fn();
    let props = {
      apiSubmission: { handleInput: handleInputMock },
      legal_language: {
        current: {
          textContent: ""
        }
      }
    };

    wrapper = shallow(
      <SubmissionFormPage1Container {...defaultProps} {...props} />
    );

    wrapper.instance().handleTab({ target: "fake" }, 2, {});
    expect(handleInputMock.mock.calls.length).toBe(1);
  });

  test("`handeTab` sets state.tab (2)", () => {
    let props = {
      apiSubmission: { handleInput: handleInput },
      legal_language: {
        current: {
          textContent: ""
        }
      }
    };

    wrapper = shallow(
      <SubmissionFormPage1Container {...defaultProps} {...props} />
    );
    wrapper.instance().state.signatureType = "write";
    wrapper.instance().handleTab({ target: "fake" }, 2, {});
    expect(wrapper.instance().state.tab).toBe(2);
  });

  test("`handeTab` sets state.tab (other)", () => {
    let props = {
      apiSubmission: { handleInput: handleInput },
      legal_language: {
        current: {
          textContent: ""
        }
      }
    };

    wrapper = shallow(
      <SubmissionFormPage1Container {...defaultProps} {...props} />
    );
    wrapper.instance().state.signatureType = "write";
    wrapper.instance().handleTab({ target: "fake" }, 1, {});
    expect(wrapper.instance().state.tab).toBe(1);
  });

  test("`dataURItoBlob` returns Blob", () => {
    let props = {
      legal_language: {
        current: {
          textContent: ""
        }
      }
    };
    wrapper = shallow(
      <SubmissionFormPage1Container {...defaultProps} {...props} />
    );
    const testBlob = wrapper.instance().dataURItoBlob(fakeDataURI);
    expect(typeof testBlob).toBe("object");
    expect(testBlob.type).toBe("image/jpeg");
  });

  test("`handleTab` saves sigUrl", () => {
    let props = {
      apiSubmission: { handleInput: handleInput },
      legal_language: {
        current: {
          textContent: ""
        }
      },
      formValues: {
        firstName: "first",
        lastName: "last"
      }
    };

    wrapper = shallow(
      <SubmissionFormPage1Container {...defaultProps} {...props} />
    );
    const handleUploadMock = jest.fn().mockImplementation(() => {
      console.log("handleUploadMock");
      return "url";
    });
    wrapper.instance().handleUpload = handleUploadMock;
    wrapper.update();
    wrapper.instance().state.signatureType = "draw";
    wrapper.instance().handleTab({ target: "fake" }, 1, {});
    expect(wrapper.instance().state.tab).toBe(1);
  });

  // it("calls handleUpload if signatureType is 'draw'", () => {
  //     testData = generateSampleValidate();
  //     addSubmissionSuccess = jest
  //       .fn()
  //       .mockImplementation(() =>
  //         Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
  //       );
  //     // creating wrapper
  //     wrapper = unconnectedSetup();
  //     wrapper.setProps({tab: 2})
  //     wrapper.instance().state.signatureType = "draw";
  //     wrapper.instance().handleUpload = jest.fn();
  //     wrapper.update();
  //     // simulate submit with dummy data
  //     console.log(wrapper.debug());
  //     wrapper.find("ReduxForm").simulate("submit", { ...testData });
  //     // testing that submit was called
  //     expect(wrapper.instance().handleUpload.mock.calls.length).toBe(1);
  //   });
});
