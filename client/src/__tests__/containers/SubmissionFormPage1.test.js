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
import {
  SubmissionFormPage1Connected,
  SubmissionFormPage1Container
} from "../../containers/SubmissionFormPage1";
import { getSFContactById } from "../../store/actions/apiSFActions";
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

const formValues = {
  firstName: "firstName",
  lastName: "lastName",
  homeEmail: "homeEmail",
  homeStreet: "homeStreet",
  homeCity: "homeCity",
  homeZip: "homeZip",
  homeState: "homeState",
  signature: "signature",
  employerType: "employerType",
  employerName: "employerName",
  mobilePhone: "mobilePhone",
  mm: "12",
  dd: "01",
  yyyy: "1999",
  preferredLanguage: "English",
  textAuthOptOut: false
};

const defaultProps = {
  submission: {
    error: null,
    loading: false,
    formPage1: {
      signature: ""
    }
  },
  initialValues: {
    mm: "",
    onlineCampaignSource: null
  },
  formValues,
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
  sigBox: { ...sigBox },
  content: {
    error: null
  }
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
    expect(wrapper.instance().props.formValues.mm).toBe("12");
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
    let uploadImageMock = jest.fn().mockImplementation(() =>
      Promise.resolve({
        type: "UPLOAD_IMAGE_SUCCESS",
        payload: { content: "sigUrl" }
      })
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

  test("`handleTab` saves legalLanguage and signature if newValue === 2", async function() {
    let handleInputMock = jest.fn();
    let handleUploadMock = jest
      .fn()
      .mockImplementation(() => Promise.resolve("http://www.example.com/png"));
    let props = {
      apiSubmission: {
        handleInput: handleInputMock
      },
      legal_language: {
        current: {
          innerHTML: ""
        }
      },
      direct_deposit: {
        current: {
          innerHTML: ""
        }
      },
      direct_pay: {
        current: {
          innerHTML: ""
        }
      },
      formValues: {
        directPayAuth: true,
        directDepositAuth: true
      }
    };

    wrapper = shallow(
      <SubmissionFormPage1Container {...defaultProps} {...props} />
    );
    wrapper.instance().handleUpload = handleUploadMock;
    await wrapper.instance().handleTab({ target: "fake" }, 2, {
      directPayAuth: true,
      directDepositAuth: true,
      employerName: "homecare",
      paymentType: "card",
      employerType: "retired",
      preferredLanguage: "English"
    });
    // two calls to handleInput --
    // one for legal language, one for signature
    expect(handleInputMock.mock.calls.length).toBe(2);
  });

  test("`handleTab` sets state.tab - 2", () => {
    let props = {
      apiSubmission: { handleInput },
      legal_language: {
        current: {
          innerHTML: ""
        }
      },
      direct_deposit: {
        current: {
          innerHTML: ""
        }
      },
      direct_pay: {
        current: {
          innerHTML: ""
        }
      }
    };

    wrapper = shallow(
      <SubmissionFormPage1Container {...defaultProps} {...props} />
    );
    wrapper.instance().state.signatureType = "write";
    wrapper.instance().handleTab({ target: "fake" }, 2, formValues);
    expect(wrapper.instance().state.tab).toBe(2);
  });

  test("`handeTab` sets state.tab - other", () => {
    let props = {
      apiSubmission: { handleInput },
      legal_language: {
        current: {
          innerHTML: ""
        }
      },
      direct_deposit: {
        current: {
          innerHTML: ""
        }
      },
      direct_pay: {
        current: {
          innerHTML: ""
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
          innerHTML: ""
        }
      },
      direct_deposit: {
        current: {
          innerHTML: ""
        }
      },
      direct_pay: {
        current: {
          innerHTML: ""
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
});
