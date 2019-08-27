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

let store,
  wrapper,
  trimSignatureMock,
  changeFieldValueMock,
  handleUploadMock,
  lookupSFContactMock,
  addSubmissionMock,
  createSFContactMock;

let pushMock = jest.fn();
changeFieldValueMock = jest.fn();

let sigUrl = "http://www.example.com/png";

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
      }),
    createSFOMA: () => Promise.resolve({ type: "CREATE_SF_OMA_SUCCESS" }),
    getIframeURL: () =>
      Promise.resolve({ type: "GET_IFRAME_URL_SUCCESS", payload: {} })
  },
  apiSubmission: {
    handleInput: jest.fn(),
    addSubmission: () => Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
  },
  history: {
    push: pushMock
  },
  reCaptchaRef: { ...reCaptchaRef },
  sigBox: { ...sigBox },
  content: {
    error: null
  },
  legal_language: {
    current: {
      innerHTML: "legal"
    }
  },
  direct_deposit: {
    current: {
      innerHTML: "deposit"
    }
  },
  direct_pay: {
    current: {
      innerHTML: "pay"
    }
  },
  changeFieldValue: changeFieldValueMock
};

const setup = (props = {}) => {
  store = mockStore(initialState);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<SubmissionFormPage1Container {...setupProps} />);
};

describe("<SubmissionFormPage1Container /> unconnected", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
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

  test("`handleOpen` opens modal", () => {
    wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
    wrapper.instance().handleOpen();
    expect(wrapper.instance().state.open).toBe(true);
  });

  test("`handleClose` closes modal", () => {
    wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
    wrapper.instance().handleClose();
    expect(wrapper.instance().state.open).toBe(false);
  });

  test("`handleUpload` calls apiContent.uploadImage", () => {
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

  test("`saveLegalLanguage` saves legal language to formValues", async function() {
    let props = {
      formValues: {
        directPayAuth: true,
        directDepositAuth: true,
        employerName: "homecare",
        paymentType: "card",
        employerType: "retired",
        preferredLanguage: "English"
      }
    };
    wrapper = shallow(
      <SubmissionFormPage1Container {...defaultProps} {...props} />
    );

    wrapper.update();
    wrapper.instance().saveLegalLanguage();
    expect(changeFieldValueMock.mock.calls[0][0]).toBe("legalLanguage");
    expect(changeFieldValueMock.mock.calls[0][1]).toBe(
      "legal<hr>deposit<hr>pay"
    );
  });

  test("`saveSignature` saves signature to formValues", async function() {
    changeFieldValueMock = jest.fn();
    let props = { changeFieldValue: changeFieldValueMock };
    handleUploadMock = jest
      .fn()
      .mockImplementation(() => Promise.resolve(sigUrl));

    wrapper = shallow(
      <SubmissionFormPage1Container {...defaultProps} {...props} />
    );
    wrapper.instance().state.signatureType = "draw";
    wrapper.instance().handleUpload = handleUploadMock;
    wrapper.update();
    wrapper
      .instance()
      .saveSignature()
      .then(() => {
        expect(changeFieldValueMock.mock.calls[0][0]).toBe("signature");
        expect(changeFieldValueMock.mock.calls[0][1]).toBe(sigUrl);
      });
  });

  test("`handleTab` calls saveLegalLanguage and saveSignature if newValue === 2", async function() {
    let saveLegalLanguageMock = jest.fn();
    let saveSignatureMock = jest
      .fn()
      .mockImplementation(() => Promise.resolve(sigUrl));
    let handleUploadMock = jest
      .fn()
      .mockImplementation(() => Promise.resolve(sigUrl));
    let props = {
      formValues: {
        directPayAuth: true,
        directDepositAuth: true,
        employerName: "homecare",
        paymentType: "card",
        employerType: "retired",
        preferredLanguage: "English"
      }
    };

    wrapper = shallow(
      <SubmissionFormPage1Container {...defaultProps} {...props} />
    );
    wrapper.instance().saveLegalLanguage = saveLegalLanguageMock;
    wrapper.instance().saveSignature = saveSignatureMock;
    wrapper.update();
    wrapper
      .instance()
      .handleTab(2)
      .then(() => {
        expect(saveLegalLanguageMock.mock.calls.length).toBe(1);
        expect(saveSignatureMock.mock.calls.length).toBe(1);
      });
  });

  test("`handleTab` sets state.tab - 2", () => {
    handleUploadMock = jest
      .fn()
      .mockImplementation(() => Promise.resolve(sigUrl));
    let props = {
      apiSubmission: {
        handleInput,
        addSubmission: jest
          .fn()
          .mockImplementation(() =>
            Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
          )
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
      }
    };

    wrapper = shallow(
      <SubmissionFormPage1Container {...defaultProps} {...props} />
    );
    wrapper.instance().state.signatureType = "write";
    wrapper
      .instance()
      .handleTab(2)
      .then(() => {
        expect(wrapper.instance().state.tab).toBe(2);
      });
  });

  test("`handleTab` sets state.tab - other", () => {
    handleUploadMock = jest
      .fn()
      .mockImplementation(() => Promise.resolve(sigUrl));
    addSubmissionMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
      );
    lookupSFContactMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ type: "LOOKUP_SF_CONTACT_SUCCESS" })
      );
    createSFContactMock = jest.fn().mockImplementation(() =>
      Promise.resolve({
        type: "CREATE_SF_CONTACT_SUCCESS"
      })
    );
    let props = {
      apiSubmission: { handleInput, addSubmission: addSubmissionMock },
      apiSF: {
        lookupSFContact: lookupSFContactMock,
        createSFContact: createSFContactMock
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
        signature: "typed signature"
      },
      reCaptchaRef: {
        current: {
          getValue: jest.fn().mockImplementation(() => "ref value")
        }
      }
    };

    wrapper = shallow(
      <SubmissionFormPage1Container {...defaultProps} {...props} />
    );
    wrapper.instance().state.signatureType = "write";
    wrapper
      .instance()
      .handleTab(1)
      .then(() => {
        expect(wrapper.instance().state.tab).toBe(1);
      });
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
