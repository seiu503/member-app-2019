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
import * as formElements from "../../components/SubmissionFormElements";

import * as apiSForce from "../../store/actions/apiSFActions";
import {
  SubmissionFormPage1Connected,
  SubmissionFormPage1Container
} from "../../containers/SubmissionFormPage1";

import { handleInput } from "../../store/actions/apiSubmissionActions";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store, wrapper, trimSignatureMock, handleUploadMock, addSubmissionMock;

let pushMock = jest.fn(),
  handleInputMock = jest.fn(),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  handleErrorMock = jest.fn(),
  executeMock = jest.fn().mockImplementation(() => Promise.resolve());

let updateSFContactSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_CONTACT_SUCCESS", payload: {} })
  );

let updateSFContactError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "UPDATE_SF_CONTACT_FAILURE", payload: {} })
  );

let updateSubmissionSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS", payload: {} })
  );

let updateSubmissionError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "UPDATE_SUBMISSION_FAILURE", payload: {} })
  );

let lookupSFContactSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "LOOKUP_SF_CONTACT_SUCCESS",
    payload: { salesforce_id: "123" }
  })
);

let lookupSFContactError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "LOOKUP_SF_CONTACT_FAILURE", payload: {} })
  );

let createSFContactSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "CREATE_SF_CONTACT_SUCCESS",
    payload: { salesforce_id: "123" }
  })
);

let createSFContactError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "CREATE_SF_CONTACT_FAILURE", payload: {} })
  );

let createSFOMAError = jest
  .fn()
  .mockImplementation(() => Promise.reject({ type: "CREATE_SF_OMA_FAILURE" }));

let getSFContactByIdSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "GET_SF_CONTACT_SUCCESS",
    payload: {
      Birthdate: moment("01-01-1900", "MM-DD-YYYY"),
      firstName: "test",
      lastName: "test"
    }
  })
);

let getSFContactByDoubleIdSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "GET_SF_CONTACT_DID_SUCCESS",
    payload: {
      firstName: "test",
      lastName: "test"
    }
  })
);

let getSFContactByIdError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "GET_SF_CONTACT_FAILURE", payload: {} })
  );

let getSFContactByDoubleIdError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "GET_SF_CONTACT_DID_FAILURE", payload: {} })
  );

let addSubmissionSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
  );

let addSubmissionError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "ADD_SUBMISSION_FAILURE" })
  );

let createSubmissionSuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));

let getSFDJRSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_SF_DJR_SUCCESS", payload: {} })
  );

let getSFDJRError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "GET_SF_DJR_FAILURE", payload: {} })
  );

let createSFDJRSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS", payload: {} })
  );

let createSFDJRError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "CREATE_SF_DJR_FAILURE", payload: {} })
  );

let updateSFDJRSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_DJR_SUCCESS", payload: {} })
  );

let updateSFDJRError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "UPDATE_SF_DJR_FAILURE", payload: {} })
  );

let getIframeExistingSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_IFRAME_EXISTING_SUCCESS", payload: {} })
  );

let getIframeExistingError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "GET_IFRAME_EXISTING_FAILURE", payload: {} })
  );

let getIframeNewSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_IFRAME_URL_SUCCESS", payload: {} })
  );

let getIframeNewError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_IFRAME_URL_FAILURE", payload: {} })
  );

let getUnioniseTokenSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "GET_UNIONISE_TOKEN_SUCCESS",
    payload: { access_token: "1234" }
  })
);

let getUnioniseTokenError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_UNIONISE_TOKEN_FAILURE", payload: {} })
  );

// let refreshUnioniseTokenSuccess = jest
//   .fn()
//   .mockImplementation(() =>
//     Promise.resolve({ type: "REFRESH_UNIONISE_TOKEN_SUCCESS", payload: {} })
//   );

// let refreshUnioniseTokenError = jest
//   .fn()
//   .mockImplementation(() =>
//     Promise.resolve({ type: "REFRESH_UNIONISE_TOKEN_FAILURE", payload: {} })
//   );

let refreshRecaptchaMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));

let verifyRecaptchaScoreMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve(0.9));

let createSFCAPESuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "CREATE_SF_CAPE_SUCCESS",
    payload: { sf_cape_id: 123 }
  })
);

let createSFCAPEError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "CREATE_SF_CAPE_FAILURE" })
  );

let createCAPESuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "CREATE_CAPE_SUCCESS" }));

let createCAPEError = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "CREATE_CAPE_FAILURE" }));

let updateCAPESuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" }));

let updateCAPEError = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "UPDATE_CAPE_FAILURE" }));

let updateSFCAPESuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_CAPE_SUCCESS" })
  );

let updateSFCAPEError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_CAPE_FAILURE" })
  );

let postOneTimePaymentSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "POST_ONE_TIME_PAYMENT_SUCCESS",
    payload: { access_token: 123 }
  })
);

let postOneTimePaymentError = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "POST_ONE_TIME_PAYMENT_FAILURE" })
  );

let sigUrl = "http://www.example.com/png";
global.scrollTo = jest.fn();

const flushPromises = () => new Promise(setImmediate);
const clearSigBoxMock = jest.fn();
const toDataURLMock = jest.fn();

const sigBox = {
  current: {
    toDataURL: toDataURLMock,
    clear: clearSigBoxMock
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
    },
    cape: {},
    payment: {}
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
    getSFContactById: getSFContactByIdSuccess,
    getSFContactByDoubleId: getSFContactByDoubleIdSuccess,
    createSFOMA: () => Promise.resolve({ type: "CREATE_SF_OMA_SUCCESS" }),
    getIframeURL: () =>
      Promise.resolve({ type: "GET_IFRAME_URL_SUCCESS", payload: {} }),
    createSFDJR: createSFDJRSuccess,
    updateSFDJR: updateSFDJRSuccess,
    getSFDJRById: getSFDJRSuccess,
    updateSFContact: updateSFContactSuccess,
    createSFContact: createSFContactSuccess,
    lookupSFContact: lookupSFContactSuccess
  },
  apiSubmission: {
    handleInput: handleInputMock,
    clearForm: clearFormMock,
    setCAPEOptions: jest.fn(),
    addSubmission: () => Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
  },
  history: {
    push: pushMock
  },
  recaptcha: {
    execute: executeMock
  },
  refreshRecaptcha: refreshRecaptchaMock,
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
  actions: {
    setSpinner: jest.fn()
  }
};

const setup = (props = {}) => {
  store = mockStore(initialState);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<SubmissionFormPage1Container {...setupProps} />);
};

describe("<SubmissionFormPage1Container /> unconnected", () => {
  beforeEach(() => {
    // console.log = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("render", () => {
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
  });

  describe("componentDidMount", () => {
    test("calls `getSFContactByDoubleId` on componentDidMount if id in query", () => {
      let props = {
        location: {
          search: "cId=1&aId=2"
        },
        apiSF: {
          getSFContactByDoubleId: getSFContactByDoubleIdSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        },
        submission: {
          formPage1: {
            firstName: "test",
            lastName: "test"
          },
          cape: {},
          payment: {}
        }
      };
      store = storeFactory(initialState);
      const dispatchSpy = jest.spyOn(apiSForce, "getSFContactByDoubleId");
      wrapper = mount(
        <Provider store={store}>
          <SubmissionFormPage1Connected {...defaultProps} {...props} />
        </Provider>
      );
      const spyCall = dispatchSpy.mock.calls[0][0];
      expect(spyCall).toEqual("1");
      wrapper.instance().componentDidMount();
      return getSFContactByDoubleIdSuccess()
        .then(() => {
          expect(wrapper.instance().handleOpen).toHaveBeenCalled();
        })
        .catch(err => {
          // console.log(err)
        });
    });

    test("handles error if `getSFContactByDoubleId` fails", () => {
      formElements.handleError = jest.fn();
      let props = {
        location: {
          search: "cId=1&aId=2"
        },
        apiSF: {
          getSFContactByDoubleId: getSFContactByDoubleIdError,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
      };
      store = storeFactory(initialState);

      wrapper = setup(props);

      wrapper.instance().componentDidMount();
      return getSFContactByDoubleIdError()
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err)
        });
    });

    test("calls `handleOpen` on componentDidMount if firstName and lastName returned from getSFContactByDoubleId", () => {
      let props = {
        location: {
          search: "cId=1&aId=2"
        },
        apiSF: {
          getSFContactByDoubleId: getSFContactByDoubleIdSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        },
        apiSubmission: {
          setCAPEOptions: jest.fn()
        },
        submission: {
          formPage1: {
            firstName: "test",
            lastName: "test"
          },
          payment: {
            currentCAPEFromSF: 0
          },
          cape: {}
        }
      };
      store = storeFactory(initialState);
      wrapper = wrapper = setup(props);

      let handleOpenMock = jest.fn();
      wrapper.instance().handleOpen = handleOpenMock;

      wrapper.instance().componentDidMount();
      return getSFContactByDoubleIdSuccess()
        .then(() => {
          expect(handleOpenMock).toHaveBeenCalled();
        })
        .catch(err => {
          console.log(err);
        });
    });
  });

  describe("saveSignature", () => {
    test("`saveSignature` saves signature to formValues", async function() {
      handleInputMock = jest.fn();
      let props = { apiSubmission: { handleInput: handleInputMock } };
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
          expect(handleInputMock.mock.calls[0][0]).toEqual({
            target: { name: "signature", value: sigUrl }
          });
        });
    });
    test("`saveSignature` handles error if handleUpload fails", async function() {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error("Error")));

      formElements.handleError = jest.fn();

      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().handleUpload = handleUploadMock;
      wrapper.update();
      wrapper
        .instance()
        .saveSignature()
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
  });

  describe("suggestedAmountOnChange", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    test("`suggestedAmountOnChange` calls getIframeNew if cape && paymentRequired", () => {
      let getIframeURLMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      let props = {
        location: {
          search: "?cape=true"
        },
        submission: {
          formPage1: {
            employerType: "retired"
          },
          payment: {
            memberShortId: "123"
          },
          cape: {}
        }
      };
      const fakeEvent = {
        target: {
          value: "test"
        }
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.instance().suggestedAmountOnChange(fakeEvent);
      expect(getIframeURLMock.mock.calls.length).toBe(1);
    });

    test("`suggestedAmountOnChange` does not call getIframeNew if capeAmount ==='Other'", () => {
      let getIframeNewMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      let props = {
        location: {
          search: "?cape=true"
        },
        submission: {
          formPage1: {
            employerType: "retired"
          }
        }
      };
      const fakeEvent = {
        target: {
          value: "Other"
        }
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.instance().getIframeNew = getIframeNewMock;
      wrapper.instance().suggestedAmountOnChange(fakeEvent);
      expect(getIframeNewMock.mock.calls.length).toBe(0);
    });
  });

  describe("handleEmployerTypeChange", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    test("`handleEmployerTypeChange` calls getIframeNew if paymentRequired", async function() {
      let getIframeURLMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      let handleInputMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      let props = {
        submission: {
          formPage1: {
            employerType: "fake"
          }
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        location: {
          search: "?cape=true"
        }
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.instance().handleEmployerTypeChange("retired");
      expect(handleInputMock.mock.calls.length).toBe(1);
      await handleInputMock();
      expect(getIframeURLMock.mock.calls.length).toBe(1);
    });

    test("`suggestedAmountOnChange` does not call getIframeNew if !paymentRequired", () => {
      let getIframeNewMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      let props = {
        submission: {
          formPage1: {
            employerType: "fake"
          }
        },
        apiSubmission: {
          handleInput: jest.fn().mockImplementation(() => Promise.resolve({}))
        }
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.instance().getIframeNew = getIframeNewMock;
      wrapper.instance().handleEmployerTypeChange("homecare");
      expect(getIframeNewMock.mock.calls.length).toBe(0);
    });
  });

  describe("saveSubmissionErrors", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    test("`saveSubmissionErrors` calls updateSubmission prop", async function() {
      let props = {
        apiSubmission: {
          updateSubmission: updateSubmissionSuccess
        },
        submission: {
          currentSubmission: {
            submission_errors: "blah"
          }
        }
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper
        .instance()
        .saveSubmissionErrors("12345", "updateSFDJR", "Error message");
      expect(updateSubmissionSuccess.mock.calls.length).toBe(1);
    });

    test("`saveSubmissionErrors` handles error if updateSubmission fails", async function() {
      let props = {
        apiSubmission: {
          updateSubmission: updateSubmissionError
        },
        submission: {
          currentSubmission: {
            submission_errors: null
          }
        }
      };
      formElements.handleError = jest.fn();
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper
        .instance()
        .saveSubmissionErrors("12345", "updateSFDJR", "Error message");
      expect(updateSubmissionError.mock.calls.length).toBe(1);
      await updateSubmissionError().catch(err => {
        // console.log(err);
      });
      expect(formElements.handleError.mock.calls.length).toBe(1);
    });

    test("`saveSubmissionErrors` handles error if updateSubmission throws", async function() {
      updateSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "UPDATE_SUBMISSION_FAILURE" })
        );
      let props = {
        apiSubmission: {
          updateSubmission: updateSubmissionError
        },
        submission: {
          currentSubmission: {
            submission_errors: null
          }
        }
      };
      formElements.handleError = jest.fn();
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper
        .instance()
        .saveSubmissionErrors("12345", "updateSFDJR", "Error message");
      await updateSubmissionError().catch(err => {
        // console.log(err);
      });
      expect(formElements.handleError.mock.calls.length).toBe(1);
    });
  });

  describe("handleUpload", () => {
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

    test("`handleUpload` handles uploadImage error", async function() {
      formElements.handleError = jest.fn();
      let uploadImageMock = jest.fn().mockImplementation(() =>
        Promise.reject({
          type: "UPLOAD_IMAGE_FAILURE"
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
      await wrapper.instance().handleUpload("firstname", "lastname");
      expect(formElements.handleError.mock.calls.length).toBe(1);
    });

    test("`handleUpload` handles uploadImage failure", async function() {
      formElements.handleError = jest.fn();
      let uploadImageMock = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "UPLOAD_IMAGE_FAILURE"
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
      await wrapper.instance().handleUpload("firstname", "lastname");
      expect(formElements.handleError.mock.calls.length).toBe(1);
    });
  });

  describe("createSubmission", () => {
    test("`createSubmission` handles error if prop function fails", async function() {
      handleInputMock = jest.fn();
      formElements.handleError = jest.fn();
      addSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "ADD_SUBMISSION_FAILURE" })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock,
          addSubmission: addSubmissionError
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            legalLanguage: "jjj"
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" }),
          createSFOMA: () => Promise.resolve({ type: "CREATE_SF_OMA_SUCCESS" })
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      let generateSubmissionBodyMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      wrapper.instance().generateSubmissionBody = generateSubmissionBodyMock;
      wrapper.update();
      wrapper
        .instance()
        .createSubmission()
        .then(async () => {
          await generateSubmissionBodyMock;
          await addSubmissionError;
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`createSubmission` calls saveSubmissionErrors if !paymentRequired and createSFOMA throws", async function() {
      handleInputMock = jest.fn();
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock,
          addSubmission: addSubmissionSuccess
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            paymentRequired: false
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" }),
          createSFOMA: createSFOMAError
        }
      };
      let saveSubmissionErrorsMock = jest.fn();
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().saveSubmissionErrors = saveSubmissionErrorsMock;

      wrapper.update();
      wrapper
        .instance()
        .createSubmission()
        .then(async () => {
          await createSFOMAError;
          expect(saveSubmissionErrorsMock.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`createSubmission` calls saveSubmissionErrors if !paymentRequired and createSFOMA fails", async function() {
      handleInputMock = jest.fn();
      formElements.handleError = jest.fn();
      createSFOMAError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SF_OMA_FAILURE" })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock,
          addSubmission: addSubmissionSuccess
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            paymentRequired: false
          }
        },
        apiSF: {
          createSFContact: createSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" }),
          createSFOMA: createSFOMAError
        }
      };
      let saveSubmissionErrorsMock = jest.fn();
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().saveSubmissionErrors = saveSubmissionErrorsMock;

      wrapper.update();
      wrapper
        .instance()
        .createSubmission()
        .then(async () => {
          await createSFOMAError;
          expect(saveSubmissionErrorsMock.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
  });

  describe("lookupSFContact", () => {
    test("`lookupSFContact` calls lookupSFContact prop if required fields populated", async function() {
      let props = {
        formValues: {
          firstName: "string",
          lastName: "string",
          employerName: "homecare",
          homeEmail: "test@test.com"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: null
        },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().setCAPEOptions = jest.fn();

      wrapper.update();
      wrapper
        .instance()
        .lookupSFContact()
        .then(() => {
          expect(lookupSFContactSuccess.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`lookupSFContact` handles error if lookupSFContact prop throws", async function() {
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      let props = {
        formValues: {
          firstName: "string",
          lastName: "string",
          employerName: "homecare",
          homeEmail: "test@test.com"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: null,
          formPage1: {
            prefillEmployerId: "123"
          }
        },
        apiSF: {
          lookupSFContact: lookupSFContactError,
          createSFContact: createSFContactSuccess
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().setCAPEOptions = jest.fn();

      // wrapper.update();
      wrapper
        .instance()
        .lookupSFContact()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`lookupSFContact` calls createSFContact if lookupSFContact finds no match", async function() {
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          firstName: "string",
          lastName: "string",
          employerName: "homecare",
          homeEmail: "test@test.com"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: null,
          formPage1: {
            prefillEmployerId: null
          }
        },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      let createSFContactMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      wrapper.instance().setCAPEOptions = jest.fn();
      wrapper.instance().createSFContact = createSFContactMock;

      wrapper.update();
      wrapper
        .instance()
        .lookupSFContact()
        .then(async () => {
          await lookupSFContactSuccess;
          expect(createSFContactMock.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`lookupSFContact` handles error if createSFContact throws", async function() {
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          firstName: "string",
          lastName: "string",
          employerName: "homecare",
          homeEmail: "test@test.com"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: null,
          formPage1: {
            prefillEmployerId: "123"
          }
        },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      let createSFContactMock = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error()));
      wrapper.instance().setCAPEOptions = jest.fn();
      wrapper.instance().createSFContact = createSFContactMock;

      wrapper.update();
      wrapper
        .instance()
        .lookupSFContact()
        .then(async () => {
          await lookupSFContactSuccess;
          await createSFContactMock;
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
  });

  describe("createSFContact", () => {
    test("`createSFContact` handles error if prop function fails", async function() {
      handleInputMock = jest.fn();
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            prefillEmployerId: "1"
          }
        },
        apiSF: {
          createSFContact: createSFContactError,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .createSFContact()
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
  });

  describe("updateSFContact", () => {
    test("`updateSFContact` calls updateSFContact prop function", async function() {
      handleInputMock = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            prefillEmployerId: null
          }
        },
        apiSF: {
          updateSFContact: updateSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .updateSFContact()
        .then(() => {
          expect(updateSFContactSuccess.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });

    test("`updateSFContact` handles error if prop function fails", async function() {
      handleInputMock = jest.fn();
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            prefillEmployerId: "1"
          }
        },
        apiSF: {
          updateSFContact: updateSFContactError,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .updateSFContact()
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
  });

  describe("getSFDJRById", () => {
    test("`getSFDJRById` calls getSFDJRById prop function", async function() {
      handleInputMock = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123"
        },
        apiSF: {
          updateSFContact: updateSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" }),
          getSFDJRById: getSFDJRSuccess
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getSFDJRById()
        .then(() => {
          expect(getSFDJRSuccess.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });

    test("`getSFDJRById` handles error if prop function throws", async function() {
      handleInputMock = jest.fn();
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123"
        },
        apiSF: {
          updateSFContact: updateSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" }),
          getSFDJRById: getSFDJRError
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getSFDJRById()
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });

    test("`getSFDJRById` handles error if prop function fails", async function() {
      handleInputMock = jest.fn();
      formElements.handleError = jest.fn();
      getSFDJRError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_SF_DJR_FAILURE", payload: {} })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123"
        },
        apiSF: {
          updateSFContact: updateSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" }),
          getSFDJRById: getSFDJRError
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getSFDJRById()
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
  });

  describe("createSFDJR", () => {
    test("`createSFDJR` calls createSFDJR prop function", async function() {
      handleInputMock = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          }
        },
        apiSF: {
          updateSFContact: updateSFContactSuccess,
          createSFDJR: createSFDJRSuccess,
          getSFDJRById: getSFDJRSuccess
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .createSFDJR()
        .then(() => {
          expect(createSFDJRSuccess.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });

    test("`createSFDJR` handles error if prop function fails", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      createSFDJRError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SF_DJR_FAILURE", payload: {} })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          error: "Error"
        },
        apiSF: {
          createSFDJR: createSFDJRError
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .createSFDJR()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`createSFDJR` handles error if prop function throws", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      createSFDJRError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "CREATE_SF_DJR_FAILURE", payload: {} })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          error: "Error"
        },
        apiSF: {
          createSFDJR: createSFDJRError
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .createSFDJR()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err)
        });
    });
  });

  describe("updateSFDJR", () => {
    test("`updateSFDJR` calls updateSFDJR prop function", async function() {
      handleInputMock = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          }
        },
        apiSF: {
          updateSFContact: updateSFContactSuccess,
          createSFDJR: createSFDJRSuccess,
          updateSFDJR: updateSFDJRSuccess
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .updateSFDJR()
        .then(() => {
          expect(updateSFDJRSuccess.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });

    test("`updateSFDJR` handles error if prop function fails", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      updateSFDJRError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SF_DJR_FAILURE", payload: {} })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          error: "Error"
        },
        apiSF: {
          updateSFDJR: updateSFDJRError
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .updateSFDJR()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`updateSFDJR` handles error if prop function throws", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      updateSFDJRError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "UPDATE_SF_DJR_FAILURE", payload: {} })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          error: "Error"
        },
        apiSF: {
          updateSFDJR: updateSFDJRError
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .updateSFDJR()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err)
        });
    });
  });

  describe("getCAPEBySFId", () => {
    test("`getCAPEBySFId` calls getCAPEBySFId prop function", async function() {
      const getCAPEBySFIdSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_CAPE_BY_SFID_SUCCESS" })
        );
      let props = {
        submission: {
          salesforceId: "123"
        },
        apiSubmission: {
          getCAPEBySFId: getCAPEBySFIdSuccess
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getCAPEBySFId()
        .then(() => {
          expect(getCAPEBySFIdSuccess.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });

    test("`getCAPEBySFId` handles error if prop function throws", async function() {
      handleInputMock = jest.fn();
      formElements.handleError = jest.fn();
      const getCAPEBySFIdError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "GET_CAPE_BY_SFID_FAILURE" })
        );
      let props = {
        submission: {
          salesforceId: "123"
        },
        apiSubmission: {
          getCAPEBySFId: getCAPEBySFIdError
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getCAPEBySFId()
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });

    test("`getCAPEBySFId` handles error if prop function fails", async function() {
      handleInputMock = jest.fn();
      formElements.handleError = jest.fn();
      const getCAPEBySFIdError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_CAPE_BY_SFID_FAILURE", payload: {} })
        );
      let props = {
        submission: {
          salesforceId: "123"
        },
        apiSubmission: {
          getCAPEBySFId: getCAPEBySFIdError
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getCAPEBySFId()
        .then(() => {
          // this error is not returned to client
          // expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
  });

  describe("verifyRecaptchaScore", () => {
    test("verifyRecaptchaScore calls `recaptcha.execute`", async function() {
      const props = {
        recaptcha: {
          execute: executeMock
        }
      };
      wrapper = setup(props);
      await wrapper.instance().verifyRecaptchaScore();
      expect(executeMock.mock.calls.length).toBe(1);
    });
    test("verifyRecaptchaScore calls `apiSubmission.verify`", async function() {
      const verifySuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "VERIFY_SUCCESS", payload: { score: 0.9 } })
        );
      const props = {
        recaptcha: {
          execute: executeMock
        },
        submission: {
          formPage1: {
            reCaptchaValue: 123
          }
        },
        apiSubmission: {
          verify: verifySuccess
        }
      };
      wrapper = setup(props);
      await wrapper.instance().verifyRecaptchaScore();
      expect(verifySuccess.mock.calls.length).toBe(1);
    });
    test("verifyRecaptchaScore handles error if `apiSubmission.verify` throws", async function() {
      const verifyError = jest
        .fn()
        .mockImplementation(() => Promise.reject({ type: "VERIFY_FAILURE" }));
      const props = {
        recaptcha: {
          execute: executeMock
        },
        submission: {
          formPage1: {
            reCaptchaValue: 123
          }
        },
        apiSubmission: {
          verify: verifyError
        }
      };
      wrapper = setup(props);
      await wrapper.instance().verifyRecaptchaScore();
      await verifyError;
      expect(handleErrorMock.mock.calls.length).toBe(1);
    });
  });

  describe("getIframeExisting", () => {
    test("`getIframeExisting` calls getIframeExisting prop function", async function() {
      handleInputMock = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          }
        },
        apiSF: {
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: getUnioniseTokenSuccess
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getIframeExisting()
        .then(() => {
          expect(getIframeExistingSuccess.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });

    test("`getIframeExisting` handles error if prop function fails", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      getIframeExistingError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_IFRAME_EXISTING_FAILURE", payload: {} })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          error: "Error"
        },
        apiSF: {
          getIframeExisting: getIframeExistingError
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getIframeExisting()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`getIframeExisting` handles error if prop function throws", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      getIframeExistingError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "GET_IFRAME_EXISTING_FAILURE", payload: {} })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          error: "Error"
        },
        apiSF: {
          getIframeExisting: getIframeExistingError
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getIframeExisting()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err)
        });
    });
  });

  describe("getIframeNew", () => {
    test("`getIframeNew` calls getIframeURL prop function (cape === true)", async function() {
      handleInputMock = jest.fn();
      let props = {
        formValues: {
          firstName: "firstName",
          lastName: "lastName",
          homeStreet: "homeStreet",
          homeCity: "city",
          homeState: "state",
          homeZip: "zip",
          birthdate: new Date(),
          homeEmail: "test@test.com",
          mobilePhone: "1234567890",
          preferredLanguage: "Spanish",
          textAuthOptOut: false,
          capeAmountOther: 11
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          submissionId: "123"
        },
        apiSF: {
          getIframeURL: getIframeNewSuccess
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getIframeNew(true, "Other")
        .then(() => {
          expect(getIframeNewSuccess.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });

    test("`getIframeNew` handles error if getIframeURL prop function fails", async function() {
      handleInputMock = jest.fn();
      let props = {
        formValues: {
          firstName: "firstName",
          lastName: "lastName",
          homeStreet: "homeStreet",
          homeCity: "city",
          homeState: "state",
          homeZip: "zip",
          birthdate: new Date(),
          homeEmail: "test@test.com",
          mobilePhone: "1234567890",
          preferredLanguage: "Spanish",
          textAuthOptOut: false,
          capeAmountOther: 11
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          submissionId: "123"
        },
        apiSF: {
          getIframeURL: getIframeNewError
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getIframeNew(true, 13)
        .then(() => {
          expect(getIframeNewError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`getIframeNew` handles error if getIframeURL prop function throws", async function() {
      handleInputMock = jest.fn();
      getIframeNewError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "GET_IFRAME_URL_FAILURE" })
        );
      let props = {
        formValues: {
          firstName: "firstName",
          lastName: "lastName",
          homeStreet: "homeStreet",
          homeCity: "city",
          homeState: "state",
          homeZip: "zip",
          birthdate: new Date(),
          homeEmail: "test@test.com",
          mobilePhone: "1234567890",
          preferredLanguage: "Spanish",
          textAuthOptOut: false,
          capeAmountOther: 11
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          submissionId: "123"
        },
        apiSF: {
          getIframeURL: getIframeNewError
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getIframeNew(true, 13)
        .then(() => {
          expect(getIframeNewError.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
  });

  describe("getIframeURL", () => {
    test("`getIframeURL` calls getIframeURL prop function", async function() {
      handleInputMock = jest.fn();
      getIframeNewSuccess.mockClear();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock,
          createCAPE: createCAPESuccess
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          cape: {
            id: "456"
          }
        },
        apiSF: {
          getIframeURL: getIframeNewSuccess,
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: getUnioniseTokenSuccess
        },
        cape_legal: {
          current: {
            innerHTML: "string"
          }
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getIframeNew()
        .then(() => {
          expect(getIframeNewSuccess.mock.calls.length).toBe(1);
          return getUnioniseTokenSuccess()
            .then(() => {})
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    });

    test("`getIframeURL` handles error if prop function fails", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      getIframeNewError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_IFRAME_URL_FAILURE", payload: {} })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          error: "Error",
          cape: {
            id: "456"
          }
        },
        apiSF: {
          getIframeURL: getIframeNewError,
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ type: "GET_UNIONISE_TOKEN_SUCCESS" })
            )
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getIframeURL()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`getIframeURL` handles error if prop function throws", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      getIframeNewError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "GET_IFRAME_URL_FAILURE", payload: {} })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          error: "Error",
          cape: {
            id: "456"
          }
        },
        apiSF: {
          getIframeURL: getIframeNewError,
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ type: "GET_UNIONISE_TOKEN_SUCCESS" })
            )
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getIframeURL()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err)
        });
    });
    test("`getIframeURL` handles error if getUnioniseToken fails", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          error: "Error",
          cape: {
            id: "456"
          }
        },
        apiSF: {
          getIframeURL: getIframeNewError,
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: jest
            .fn()
            .mockImplementation(() =>
              Promise.reject({ type: "GET_UNIONISE_TOKEN_FAILURE" })
            )
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getIframeURL()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err)
        });
    });
    test("`getIframeURL` calls getIframeNew if no memberShortId in state", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      let getIframeNewMock = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: null
          },
          error: "Error",
          cape: {
            id: "456"
          }
        },
        apiSF: {
          getIframeURL: getIframeNewError,
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: jest
            .fn()
            .mockImplementation(() =>
              Promise.reject({ type: "GET_UNIONISE_TOKEN_FAILURE" })
            )
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().getIframeNew = getIframeNewMock;
      wrapper.update();
      wrapper
        .instance()
        .getIframeURL()
        .then(() => {
          expect(getIframeNewMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err)
        });
    });
    test("`getIframeURL` calls getCAPEBySFId if cape & salesforceId & !memberShortId", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      const getCAPEBySFIdSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_CAPE_BY_SFID_SUCCESS" })
        );
      let getIframeNewMock = jest.fn();
      let props = {
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English",
          capeAmount: 10
        },
        apiSubmission: {
          handleInput: handleInputMock,
          getCAPEBySFId: getCAPEBySFIdSuccess,
          createCAPE: createCAPESuccess
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: null
          },
          error: "Error",
          cape: {
            id: "456"
          }
        },
        apiSF: {
          getIframeURL: getIframeNewSuccess,
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ type: "GET_UNIONISE_TOKEN_SUCCESS" })
            )
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().getCAPEBySFId = getCAPEBySFIdSuccess;
      wrapper.instance().getSFDJRById = jest.fn();
      wrapper.update();
      wrapper
        .instance()
        .getIframeURL(true)
        .then(() => {
          expect(getCAPEBySFIdSuccess.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err)
        });
    });
    test("`getIframeURL` calls lookupSFContact if !salesforceId", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      const getCAPEBySFIdSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_CAPE_BY_SFID_SUCCESS" })
        );
      let lookupSFContactMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      let props = {
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English",
          capeAmount: 10
        },
        apiSubmission: {
          handleInput: handleInputMock,
          getCAPEBySFId: getCAPEBySFIdSuccess,
          createCAPE: createCAPESuccess
        },
        submission: {
          salesforceId: null,
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: null
          },
          error: "Error",
          cape: {
            id: "456"
          }
        },
        apiSF: {
          getIframeURL: getIframeNewSuccess,
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ type: "GET_UNIONISE_TOKEN_SUCCESS" })
            )
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().getCAPEBySFId = getCAPEBySFIdSuccess;
      wrapper.instance().getSFDJRById = jest.fn();
      wrapper.instance().lookupSFContact = lookupSFContactMock;
      wrapper.update();
      wrapper
        .instance()
        .getIframeURL(true)
        .then(() => {
          expect(lookupSFContactMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err)
        });
    });
    test("`getIframeURL` handles error if getIframeNew throws", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      const getCAPEBySFIdSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_CAPE_BY_SFID_SUCCESS" })
        );
      let getIframeNewMock = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error()));
      let props = {
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English",
          capeAmount: 10
        },
        apiSubmission: {
          handleInput: handleInputMock,
          getCAPEBySFId: getCAPEBySFIdSuccess,
          createCAPE: createCAPESuccess
        },
        submission: {
          salesforceId: null,
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: null
          },
          error: "Error",
          cape: {
            id: "456"
          }
        },
        apiSF: {
          getIframeURL: getIframeNewSuccess,
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ type: "GET_UNIONISE_TOKEN_SUCCESS" })
            )
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().getCAPEBySFId = getCAPEBySFIdSuccess;
      wrapper.instance().getSFDJRById = jest.fn();
      wrapper.instance().getIframeNew = getIframeNewMock;
      wrapper.update();
      wrapper
        .instance()
        .getIframeURL()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err)
        });
    });
  });

  describe("postOneTimePayment", () => {
    test("`postOneTimePayment` calls postOneTimePayment prop function", async function() {
      handleInputMock = jest.fn();
      getIframeNewSuccess.mockClear();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English",
          capeAmount: "Other"
        },
        apiSubmission: {
          handleInput: handleInputMock,
          createCAPE: createCAPESuccess
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          cape: {
            id: "456"
          }
        },
        apiSF: {
          getIframeURL: getIframeNewSuccess,
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: getUnioniseTokenSuccess,
          postOneTimePayment: postOneTimePaymentSuccess
        },
        cape_legal: {
          current: {
            innerHTML: "string"
          }
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .postOneTimePayment()
        .then(async () => {
          await getUnioniseTokenSuccess;
          expect(postOneTimePaymentSuccess.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`postOneTimePayment` handles error if getUnioniseToken throws", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      getUnioniseTokenError = jest.fn().mockImplementation(() =>
        Promise.reject({
          type: "GET_UNIONISE_TOKEN_FAILURE",
          payload: { access_token: null }
        })
      );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English",
          capeAmountOther: 10
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: null
          },
          error: "Error",
          cape: {
            id: "456",
            memberShortId: "123"
          }
        },
        apiSF: {
          getIframeURL: getIframeNewError,
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: getUnioniseTokenError,
          postOneTimePayment: postOneTimePaymentSuccess
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .postOneTimePayment()
        .then(async () => {
          await getUnioniseTokenError;
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err)
        });
    });
    test("`postOneTimePayment` handles error if prop function throws", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      postOneTimePaymentError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "POST_ONE_TIME_PAYMENT_FAILURE", payload: {} })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          error: "Error",
          cape: {
            id: "456"
          }
        },
        apiSF: {
          getIframeURL: getIframeNewError,
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: getUnioniseTokenSuccess,
          postOneTimePayment: postOneTimePaymentError
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .postOneTimePayment()
        .then(async () => {
          await getUnioniseTokenSuccess;
          await postOneTimePaymentError;
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err)
        });
    });
    test("`postOneTimePayment` handles error if prop function fails", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      postOneTimePaymentError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "POST_ONE_TIME_PAYMENT_FAILURE" })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          error: "Error",
          cape: {
            id: "456"
          }
        },
        apiSF: {
          getIframeURL: getIframeNewError,
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: getUnioniseTokenSuccess,
          postOneTimePayment: postOneTimePaymentError
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .postOneTimePayment()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err)
        });
    });
  });

  describe("toggleCardAddingFrame", () => {
    test("`toggleCardAddingFrame` calls getIframeURL if value = `Add new card`", () => {
      let getIframeURLMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.instance().toggleCardAddingFrame("Add new card");
      expect(getIframeURLMock.mock.calls.length).toBe(1);
    });

    test("`toggleCardAddingFrame` does not call getIframeURL if value !== `Add new card`", () => {
      let getIframeURLMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.instance().toggleCardAddingFrame("Use existing");
      expect(getIframeURLMock.mock.calls.length).toBe(0);
    });

    test("`toggleCardAddingFrame` handles error if getIframeURL fails", () => {
      let getIframeURLError = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error()));
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().getIframeURL = getIframeURLError;
      wrapper.instance().toggleCardAddingFrame("Add new card");
      expect(getIframeURLError.mock.calls.length).toBe(1);
    });
  });

  describe("getUnioniseToken", () => {
    test("`getUnioniseToken` calls getUnioniseToken prop function", async function() {
      handleInputMock = jest.fn();
      getUnioniseTokenSuccess.mockClear();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          }
        },
        apiSF: {
          getIframeURL: getIframeNewSuccess,
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: getUnioniseTokenSuccess
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getUnioniseToken()
        .then(() => {
          expect(getUnioniseTokenSuccess.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });

    test("`getUnioniseToken` handles error if prop function fails", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      getUnioniseTokenError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_UNIONISE_TOKEN_FAILURE", payload: {} })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          error: "Error"
        },
        apiSF: {
          getIframeURL: getIframeNewError,
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: getUnioniseTokenError
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getUnioniseToken()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => console.log(err));
    });
    test("`getUnioniseToken` handles error if prop function throws", async function() {
      handleInputMock = jest.fn();
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      getUnioniseTokenError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "GET_UNIONISE_TOKEN_FAILURE", payload: {} })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            medicaidResidents: 1,
            paymentType: "Card"
          },
          payment: {
            memberShortId: "1234"
          },
          error: "Error"
        },
        apiSF: {
          getIframeURL: getIframeNewSuccess,
          getIframeExisting: getIframeExistingSuccess,
          getUnioniseToken: getUnioniseTokenError
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .getUnioniseToken()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err)
        });
    });
  });

  describe("handleTab1", () => {
    test("`handleTab1` handles error if updateSFContact fails", async function() {
      handleInputMock = jest.fn();
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123"
        },
        apiSF: {
          updateSFContact: updateSFContactError,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;

      wrapper.update();
      wrapper
        .instance()
        .handleTab1()
        .then(async () => {
          await verifyRecaptchaScoreMock();
          await handleInputMock();
          return updateSFContactError().then(() => {
            expect(formElements.handleError.mock.calls.length).toBe(1);
          });
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleTab1` handles error if lookupSFContact fails", async function() {
      handleInputMock = jest.fn();
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: null
        },
        apiSF: {
          updateSFContact: updateSFContactSuccess,
          lookupSFContact: lookupSFContactError,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper.update();
      wrapper
        .instance()
        .handleTab1()
        .then(async () => {
          await verifyRecaptchaScoreMock();
          await handleInputMock();
          return lookupSFContactError().then(() => {
            expect(formElements.handleError.mock.calls.length).toBe(1);
          });
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleTab1` navigates to tab 1 if salesforceId found in state", async function() {
      handleInputMock = jest.fn();
      clearFormMock = jest.fn();
      updateSFContactSuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SF_CONTACT_SUCCESS", payload: {} })
        );
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock,
          clearForm: clearFormMock,
          verify: () =>
            Promise.resolve({ type: "VERIFY_SUCCESS", payload: { score: 0.9 } })
        },
        submission: {
          salesforceId: "123",
          formPage1: {
            reCaptchaValue: ""
          }
        },
        apiSF: {
          updateSFContact: updateSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        },
        recaptcha: {
          execute: jest.fn()
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      const changeTabMock = jest.fn();
      wrapper.instance().changeTab = changeTabMock;
      wrapper.update();
      wrapper
        .instance()
        .handleTab1()
        .then(async () => {
          await verifyRecaptchaScoreMock();
          await handleInputMock();
          return updateSFContactSuccess().then(() => {
            expect(changeTabMock.mock.calls.length).toBe(1);
          });
        })
        .catch(err => console.log(err));
    });
  });

  describe("misc methods", () => {
    beforeEach(() => {
      handleInputMock = jest.fn();
    });
    afterEach(() => {
      handleInputMock.mockClear();
    });

    test("`handleOpen` opens modal", () => {
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().handleOpen();
      expect(wrapper.instance().state.open).toBe(true);
    });

    test("`handleCAPEOpen` opens alert dialog", () => {
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().handleCAPEOpen();
      expect(wrapper.instance().state.capeOpen).toBe(true);
    });

    test("`handleClose` closes modal", () => {
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().handleClose();
      expect(wrapper.instance().state.open).toBe(false);
    });

    test("`handleEmployerChange` sets prefillEmployerChanged state to true", () => {
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().handleEmployerChange();
      expect(wrapper.instance().state.prefillEmployerChanged).toBe(true);
    });

    test("`handleCloseAndClear` closes modal, clears form, resets window.location", async () => {
      let originalReplaceState = window.history.replaceState;
      let replaceStateMock = jest.fn();
      clearFormMock = jest.fn();
      window.history.replaceState = replaceStateMock;
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().props.apiSubmission.clearForm = clearFormMock;
      await wrapper.instance().handleCloseAndClear();
      expect(wrapper.instance().state.open).toBe(false);
      expect(clearFormMock.mock.calls.length).toBe(1);

      window.history.replaceState = originalReplaceState;
    });

    test("`handleCAPEClose` closes alert dialog", () => {
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().handleCAPEClose();
      expect(wrapper.instance().state.capeOpen).toBe(false);
    });

    test("`closeDialog` calls handleCAPEClose and this.props.history.push", () => {
      const props = {
        history: {
          push: pushMock
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().closeDialog();
      expect(wrapper.instance().state.capeOpen).toBe(false);
      expect(pushMock).toHaveBeenCalled();
    });

    test("`mobilePhoneOnBlur` calls handleEmployerTypeChange", () => {
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      const handleEmployerTypeChangeMock = jest.fn();
      wrapper.instance().handleEmployerTypeChange = handleEmployerTypeChangeMock;
      wrapper.instance().mobilePhoneOnBlur();
      expect(handleEmployerTypeChangeMock).toHaveBeenCalled();
    });

    test("`setCAPEOptions` calls this.props.apiSubmission.setCAPEOptions", () => {
      const setCAPEOptionsMock = jest.fn();
      const props = {
        apiSubmission: {
          setCAPEOptions: setCAPEOptionsMock
        },
        submission: {
          payment: {
            currentCAPEFromSF: 20
          }
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().setCAPEOptions();
      expect(setCAPEOptionsMock).toHaveBeenCalled();
    });

    test("`checkCAPEPaymentLogic` sets displayCAPEPaymentFields to true and calls handleEmployerTypeChange and handleDonationFrequencyChange", async () => {
      const handleEmployerTypeChangeMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(""));
      const handleDonationFrequencyChangeMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(""));
      const props = {
        formValues: {
          employerType: "retired",
          donationFrequency: "Monthly"
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().handleEmployerTypeChange = handleEmployerTypeChangeMock;
      wrapper.instance().handleDonationFrequencyChange = handleDonationFrequencyChangeMock;
      wrapper.update();
      await wrapper.instance().checkCAPEPaymentLogic();
      expect(handleEmployerTypeChangeMock).toHaveBeenCalled();
      expect(handleDonationFrequencyChangeMock).toHaveBeenCalled();
      expect(wrapper.instance().state.displayCAPEPaymentFields).toBe(true);
    });

    test("`clearSignature` calls sigBox.clear", () => {
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().clearSignature();
      expect(clearSigBoxMock.mock.calls.length).toBe(1);
    });

    test("`trimSignature` calls sigBox.toDataURL", () => {
      const dataURItoBlobMock = jest.fn();
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().dataURItoBlob = dataURItoBlobMock;
      wrapper.instance().trimSignature();
      expect(toDataURLMock.mock.calls.length).toBe(1);
      expect(dataURItoBlobMock.mock.calls.length).toBe(1);
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

    test("`toggleSignatureInputType` changes signature type in state", async function() {
      wrapper = setup();
      wrapper.instance().state.signatureType = "draw";
      await wrapper.instance().toggleSignatureInputType();
      await wrapper.update();
      expect(wrapper.state("signatureType")).toEqual("write");
    });

    test("`calculateAFHDuesRate` calls handleInput", async function() {
      let props = {
        formValues: {
          afhDuesRate: null
        },
        apiSubmission: {
          handleInput: handleInputMock
        }
      };
      wrapper = setup(props);
      const residents = 1;
      await wrapper.instance().calculateAFHDuesRate(residents);
      expect(handleInputMock.mock.calls[0][0]).toEqual({
        target: { name: "afhDuesRate", value: 17.59 }
      });
    });

    test("`saveLegalLanguage` saves legal language to formValues", async function() {
      handleInputMock = jest.fn();
      let props = {
        formValues: {
          directPayAuth: true,
          directDepositAuth: true,
          employerName: "homecare",
          paymentType: "card",
          employerType: "retired",
          preferredLanguage: "English"
        },
        apiSubmission: {
          handleInput: handleInputMock
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .saveLegalLanguage()
        .then(() => {
          expect(handleInputMock.mock.calls[0][0]).toEqual({
            target: { name: "legalLanguage", value: "legal<hr>deposit<hr>pay" }
          });
        })
        .catch(err => console.log(err));
    });

    test("`generateCAPEBody` displays CAPE Payment fields if no donation amount chosen", async () => {
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      await wrapper.instance().generateCAPEBody(null, null);
      expect(wrapper.instance().state.displayCAPEPaymentFields).toBe(true);
    });
  });

  describe("handleDonationFrequencyChange", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    test("`handleDonationFrequencyChange` returns without calling anything if !capeAmount && !capeAmountOther", () => {
      const props = {
        submission: {
          formPage1: {
            paymentRequired: false
          },
          payment: {
            activeMethodLast4: null
          },
          cape: {
            activeMethodLast4: "1234"
          }
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        formValues: {
          capeAmount: null,
          capeAmountOther: null
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().handleDonationFrequencyChange();
      expect(handleInputMock).not.toHaveBeenCalled();
    });
    test("`handleDonationFrequencyChange` calls handleInput to set newCardNeeded to `true` if !validMethod", () => {
      const props = {
        submission: {
          formPage1: {
            paymentRequired: true
          },
          payment: {
            activeMethodLast4: "1234",
            paymentErrorHold: true
          },
          cape: {
            activeMethodLast4: null
          }
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        formValues: {
          capeAmount: 10
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().handleDonationFrequencyChange();
      expect(handleInputMock).toHaveBeenCalledWith({
        target: { name: "newCardNeeded", value: true }
      });
    });
    test("`handleDonationFrequencyChange` calls handleInput to set paymentRequired to `true` if donationFrequency === 'One-Time'", async () => {
      const props = {
        submission: {
          formPage1: {
            paymentRequired: true,
            donationFrequency: "One-Time"
          },
          payment: {
            activeMethodLast4: "1234",
            paymentErrorHold: false
          },
          cape: {
            activeMethodLast4: null
          }
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        formValues: {
          capeAmount: 10
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      const getIframeURLMock = jest.fn();
      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.instance().handleDonationFrequencyChange("One-Time");
      expect(handleInputMock.mock.calls[1][0]).toEqual({
        target: { name: "paymentRequired", value: true }
      });
      await handleInputMock();
      expect(getIframeURLMock).toHaveBeenCalled();
    });
    test("`handleDonationFrequencyChange` calls handleInput to set paymentRequired to `false` if dFrequency === 'Monthly' && checkoff", async () => {
      handleInputMock = jest.fn();
      const props = {
        submission: {
          formPage1: {
            paymentRequired: false,
            donationFrequency: "Monthly"
          },
          payment: {
            activeMethodLast4: "1234"
          },
          cape: {
            activeMethodLast4: null
          }
        },
        apiSubmission: {
          handleInput: handleInputMock
        },
        formValues: {
          capeAmount: 10
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      const getIframeURLMock = jest.fn();
      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.instance().handleDonationFrequencyChange("Monthly");
      expect(handleInputMock.mock.calls[0][0]).toEqual({
        target: { name: "paymentRequired", value: false }
      });
    });
  });

  describe("handleCAPESubmit", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    test("`handleCAPESubmit` handles error if recaptcha verification fails", () => {
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(0.1));
      formElements.handleError = jest.fn();

      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);

      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper
        .instance()
        .handleCAPESubmit(true)
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if paymentRequired && !paymentMethodAdded", () => {
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(0.9));
      formElements.handleError = jest.fn();

      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: false
          }
        }
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper
        .instance()
        .handleCAPESubmit()
        .then(async () => {
          await wrapper.instance().verifyRecaptchaScore();
          expect(formElements.handleError.mock.calls.length).toBe(1);
        });
    });

    test("`handleCAPESubmit` handles error if lookupSFContact prop throws", () => {
      formElements.handleError = jest.fn();
      lookupSFContactError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "LOOKUP_SF_CONTACT_FAILURE" })
        );
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true
          },
          salesforceId: null,
          payment: {
            memberShortId: "123"
          }
        },
        apiSF: {
          lookupSFContact: lookupSFContactError,
          createSFCAPE: createSFCAPESuccess
        },
        apiSubmission: {
          createCAPE: createCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper
        .instance()
        .handleCAPESubmit()
        .then(async () => {
          await wrapper
            .instance()
            .verifyRecaptchaScore()
            .catch(err => {
              console.log(err);
            });
          await lookupSFContactError();
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if createSFContact method throws", () => {
      formElements.handleError = jest.fn();
      lookupSFContactError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "LOOKUP_SF_CONTACT_FAILURE" })
        );
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true
          },
          salesforceId: null,
          payment: {
            memberShortId: "123"
          }
        },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess
        },
        apiSubmission: {
          createCAPE: createCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper.instance().createSFContact = createSFContactError;
      wrapper
        .instance()
        .handleCAPESubmit()
        .then(async () => {
          await wrapper
            .instance()
            .verifyRecaptchaScore()
            .catch(err => {
              console.log(err);
            });
          await lookupSFContactSuccess();
          await createSFContactError();
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if createSFCape prop fails", () => {
      formElements.handleError = jest.fn();
      createSFCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SF_CAPE_FAILURE" })
        );
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true
          },
          salesforceId: "123",
          payment: {
            memberShortId: "123"
          },
          error: "Error"
        },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPEError
        },
        apiSubmission: {
          createCAPE: createCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      let generateCAPEBodyMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      wrapper.instance().generateCAPEBody = generateCAPEBodyMock;
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper
        .instance()
        .handleCAPESubmit()
        .then(async () => {
          await wrapper
            .instance()
            .verifyRecaptchaScore()
            .catch(err => {
              console.log(err);
            });
          await generateCAPEBodyMock;
          await createSFCAPEError;
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if createSFCape prop throws", () => {
      formElements.handleError = jest.fn();
      createSFCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "CREATE_SF_CAPE_FAILURE" })
        );
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true,
            donationFrequency: "One-Time"
          },
          salesforceId: "123",
          payment: {
            memberShortId: null
          },
          cape: {
            memberShortId: "123"
          }
        },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPEError
        },
        apiSubmission: {
          createCAPE: createCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      let generateCAPEBodyMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper.instance().generateCAPEBody = generateCAPEBodyMock;
      wrapper
        .instance()
        .handleCAPESubmit()
        .then(async () => {
          await generateCAPEBodyMock;
          await createSFCAPEError;
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if createCAPE prop fails", () => {
      formElements.handleError = jest.fn();
      createCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_CAPE_FAILURE" })
        );
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true
          },
          salesforceId: "123",
          payment: {
            memberShortId: "123"
          }
        },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess
        },
        apiSubmission: {
          createCAPE: createCAPEError
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper
        .instance()
        .handleCAPESubmit()
        .then(async () => {
          await wrapper
            .instance()
            .verifyRecaptchaScore()
            .catch(err => {
              console.log(err);
            });
          await createSFCAPESuccess;
          await createCAPEError;
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if createCAPE prop throws", () => {
      formElements.handleError = jest.fn();
      createCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "CREATE_CAPE_FAILURE" })
        );
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true
          },
          salesforceId: "123",
          payment: {
            memberShortId: "123"
          },
          cape: {
            id: undefined
          }
        },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess,
          getUnioniseToken: getUnioniseTokenSuccess,
          postOneTimePayment: postOneTimePaymentSuccess
        },
        apiSubmission: {
          createCAPE: createCAPEError
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper
        .instance()
        .handleCAPESubmit()
        .then(async () => {
          await wrapper
            .instance()
            .verifyRecaptchaScore()
            .catch(err => {
              console.log(err);
            });
          await createSFCAPESuccess;
          await createCAPEError;
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if postOneTimePayment prop throws", () => {
      formElements.handleError = jest.fn();
      postOneTimePaymentError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "POST_ONE_TIME_PAYMENT_FAILURE" })
        );
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true
          },
          salesforceId: "123",
          payment: {
            memberShortId: "123"
          },
          cape: {
            id: undefined
          }
        },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess,
          getUnioniseToken: getUnioniseTokenSuccess,
          postOneTimePayment: postOneTimePaymentError
        },
        apiSubmission: {
          createCAPE: createCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper
        .instance()
        .handleCAPESubmit()
        .then(async () => {
          await wrapper
            .instance()
            .verifyRecaptchaScore()
            .catch(err => {
              console.log(err);
            });
          await createSFCAPESuccess;
          await createCAPESuccess;
          await postOneTimePaymentError;
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if updateCAPE prop throws", () => {
      formElements.handleError = jest.fn();
      updateCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "UPDATE_CAPE_FAILURE" })
        );
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true
          },
          salesforceId: "123",
          payment: {
            memberShortId: "123"
          },
          cape: {
            id: undefined
          }
        },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess,
          getUnioniseToken: getUnioniseTokenSuccess,
          postOneTimePayment: postOneTimePaymentSuccess
        },
        apiSubmission: {
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPEError
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper
        .instance()
        .handleCAPESubmit()
        .then(async () => {
          await wrapper
            .instance()
            .verifyRecaptchaScore()
            .catch(err => {
              console.log(err);
            });
          await createSFCAPESuccess;
          await createCAPESuccess;
          await postOneTimePaymentSuccess;
          await updateCAPEError;
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if updateSFCAPE prop throws", () => {
      formElements.handleError = jest.fn();
      updateSFCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "UPDATE_SF_CAPE_FAILURE" })
        );
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true,
            donationFrequency: "One-Time"
          },
          salesforceId: "123",
          payment: {
            memberShortId: "123"
          },
          cape: {
            id: undefined,
            oneTimePaymentId: "123"
          }
        },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess,
          getUnioniseToken: getUnioniseTokenSuccess,
          postOneTimePayment: postOneTimePaymentSuccess,
          updateSFCAPE: updateSFCAPEError
        },
        apiSubmission: {
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper
        .instance()
        .handleCAPESubmit()
        .then(async () => {
          await wrapper
            .instance()
            .verifyRecaptchaScore()
            .catch(err => {
              console.log(err);
            });
          await createSFCAPESuccess;
          await createCAPESuccess;
          await postOneTimePaymentSuccess;
          await updateCAPESuccess;
          await updateSFCAPEError;
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if updateSFCAPE prop fails", () => {
      formElements.handleError = jest.fn();
      updateSFCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SF_CAPE_FAILURE" })
        );
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true
          },
          salesforceId: "123",
          payment: {
            memberShortId: "123"
          },
          cape: {
            id: undefined
          }
        },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess,
          getUnioniseToken: getUnioniseTokenSuccess,
          postOneTimePayment: postOneTimePaymentSuccess,
          updateSFCAPE: updateSFCAPEError
        },
        apiSubmission: {
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper
        .instance()
        .handleCAPESubmit()
        .then(async () => {
          await wrapper
            .instance()
            .verifyRecaptchaScore()
            .catch(err => {
              console.log(err);
            });
          await createSFCAPESuccess;
          await createCAPESuccess;
          await postOneTimePaymentSuccess;
          await updateCAPESuccess;
          await updateSFCAPEError;
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err);
        });
    });

    test("`handleCAPESubmit` calls createCAPE if !capeid", () => {
      formElements.handleError = jest.fn();
      createCAPESuccess.mockRestore();
      createCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_CAPE_SUCCESS" })
        );
      let props = {
        formValues: {
          capeAmount: 10,
          donationFrequency: "One-Time"
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true
          },
          salesforceId: null,
          payment: {
            memberShortId: null
          },
          cape: {
            id: undefined,
            memberShortId: "123"
          }
        },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess,
          updateSFCAPE: updateSFCAPESuccess,
          getUnioniseToken: getUnioniseTokenSuccess,
          postOneTimePayment: postOneTimePaymentSuccess
        },
        apiSubmission: {
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      let generateCAPEBodyMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      wrapper.instance().generateCAPEBody = generateCAPEBodyMock;
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper
        .instance()
        .handleCAPESubmit()
        .then(async () => {
          await wrapper
            .instance()
            .verifyRecaptchaScore()
            .catch(err => {
              console.log(err);
            });
          await generateCAPEBodyMock;
          expect(createCAPESuccess.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleCAPESubmit` redirects to thankyou page if standalone", () => {
      formElements.handleError = jest.fn();
      let props = {
        formValues: {
          capeAmount: 10
        },
        submission: {
          formPage1: {
            paymentRequired: true,
            paymentMethodAdded: true
          },
          salesforceId: "123",
          payment: {
            memberShortId: "123"
          },
          cape: {
            id: "234"
          }
        },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess,
          getUnioniseToken: getUnioniseTokenSuccess,
          postOneTimePayment: postOneTimePaymentSuccess,
          updateSFCAPE: updateSFCAPESuccess
        },
        apiSubmission: {
          createCAPE: createCAPESuccess,
          updateCAPE: updateCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn(),
        history: {
          push: pushMock
        }
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      wrapper
        .instance()
        .handleCAPESubmit(true)
        .then(async () => {
          await wrapper
            .instance()
            .verifyRecaptchaScore()
            .catch(err => {
              console.log(err);
            });
          await createSFCAPESuccess;
          await createCAPESuccess;
          await updateCAPESuccess;
          await updateSFCAPESuccess;
          expect(pushMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err);
        });
    });
  });

  describe("handleTab2", () => {
    test("`handleTab2` handles error if saveSignature fails", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const saveSignatureMock = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error()));
      formElements.handleError = jest.fn();
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
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().saveSignature = saveSignatureMock;
      wrapper
        .instance()
        .handleTab2()
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBe(1);
        });
    });

    test("`handleTab2` handles error if getIframeURL fails", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const saveSignatureMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const getIframeURLMock = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error()));
      formElements.handleError = jest.fn();
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
        },
        formValues: {
          employerType: "community member"
        }
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().saveSignature = saveSignatureMock;
      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.update();
      wrapper
        .instance()
        .handleTab2()
        .then(() => {
          return getIframeURLMock().then(async function() {
            console.log("772");
            await flushPromises();
            expect(formElements.handleError.mock.calls.length).toBe(1);
          });
        })
        .catch(err => {
          // console.log(err);
        });
    });

    test("`handleTab2` calculates AFH dues rate if employerType === 'afh'", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const saveSignatureMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const calculateAFHDuesRateMock = jest.fn();
      formElements.handleError = jest.fn();
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
        },
        formValues: {
          employerType: "adult foster home",
          preferredLanguage: "Spanish"
        }
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().saveSignature = saveSignatureMock;
      wrapper.instance().calculateAFHDuesRate = calculateAFHDuesRateMock;
      wrapper
        .instance()
        .handleTab2()
        .then(() => {
          expect(calculateAFHDuesRateMock.mock.calls.length).toBe(1);
        });
    });

    test("`handleTab2` calls getSFDJRById if paymentRequired === true", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const saveSignatureMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const calculateAFHDuesRateMock = jest.fn();
      formElements.handleError = jest.fn();
      const getIframeURLMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const getSFDJRByIdMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ payload: {} }));
      let props = {
        apiSubmission: {
          handleInput,
          addSubmission: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
            )
        },
        apiSF: {
          getSFDJRById: getSFDJRSuccess
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
          employerType: "adult foster home",
          preferredLanguage: "Spanish"
        },
        submission: {
          formPage1: {
            paymentRequired: true
          },
          payment: {
            memberShortId: "1234"
          }
        }
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().saveSignature = saveSignatureMock;
      wrapper.instance().calculateAFHDuesRate = calculateAFHDuesRateMock;
      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.instance().getSFDJRById = getSFDJRByIdMock;
      wrapper
        .instance()
        .handleTab2()
        .then(() => {
          expect(getSFDJRByIdMock.mock.calls.length).toBe(1);
        });
    });

    test("`handleTab2` handles error if getSFDJRById throws", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const saveSignatureMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const calculateAFHDuesRateMock = jest.fn();
      formElements.handleError = jest.fn();
      const getIframeURLMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const getSFDJRByIdMock = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error()));
      let props = {
        apiSubmission: {
          handleInput,
          addSubmission: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
            )
        },
        apiSF: {
          getSFDJRById: getSFDJRSuccess
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
          employerType: "adult foster home",
          preferredLanguage: "Spanish"
        },
        submission: {
          formPage1: {
            paymentRequired: true
          },
          payment: {
            memberShortId: "1234"
          }
        }
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().saveSignature = saveSignatureMock;
      wrapper.instance().calculateAFHDuesRate = calculateAFHDuesRateMock;
      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.instance().getSFDJRById = getSFDJRByIdMock;
      wrapper
        .instance()
        .handleTab2()
        .then(() => {
          expect(getSFDJRByIdMock.mock.calls.length).toBe(1);
        });
    });

    test("`handleTab2` handles error if getIframeURL throws", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const saveSignatureMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const calculateAFHDuesRateMock = jest.fn();
      formElements.handleError = jest.fn();
      const getIframeURLMock = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error()));
      const getSFDJRByIdMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ payload: {} }));
      let props = {
        apiSubmission: {
          handleInput,
          addSubmission: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
            )
        },
        apiSF: {
          getSFDJRById: getSFDJRSuccess
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
          employerType: "adult foster home",
          preferredLanguage: "Spanish"
        },
        submission: {
          formPage1: {
            paymentRequired: true
          },
          payment: {
            memberShortId: "1234"
          }
        }
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().saveSignature = saveSignatureMock;
      wrapper.instance().calculateAFHDuesRate = calculateAFHDuesRateMock;
      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.instance().getSFDJRById = getSFDJRByIdMock;
      wrapper
        .instance()
        .handleTab2()
        .then(() => {
          expect(getSFDJRByIdMock.mock.calls.length).toBe(1);
        });
    });

    test("`handleTab2` handles error if createSubmission throws", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const saveSignatureMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      const calculateAFHDuesRateMock = jest.fn();
      formElements.handleError = jest.fn();
      const getIframeURLMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      const getSFDJRByIdMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ payload: {} }));
      const createSubmissionMock = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error()));
      let props = {
        apiSubmission: {
          handleInput,
          addSubmission: addSubmissionSuccess
        },
        apiSF: {
          getSFDJRById: getSFDJRSuccess
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
          employerType: "adult foster home",
          preferredLanguage: "Spanish"
        },
        submission: {
          formPage1: {
            paymentRequired: true
          },
          payment: {
            memberShortId: "1234"
          }
        }
      };

      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().state.signatureType = "draw";
      wrapper.instance().saveSignature = saveSignatureMock;
      wrapper.instance().calculateAFHDuesRate = calculateAFHDuesRateMock;
      wrapper.instance().getIframeURL = getIframeURLMock;
      wrapper.instance().getSFDJRById = getSFDJRByIdMock;
      wrapper.instance().createSubmission = createSubmissionMock;
      wrapper
        .instance()
        .handleTab2()
        .then(() => {
          expect(createSubmissionMock.mock.calls.length).toBe(1);
        });
    });
  });

  describe("handleTab", () => {
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
      wrapper.instance().createSubmission = createSubmissionSuccess;
      wrapper
        .instance()
        .handleTab(2)
        .then(() => {
          return createSubmissionSuccess().then(() => {
            expect(wrapper.instance().state.tab).toBe(2);
          });
        })
        .catch(err => console.log(err));
    });

    test("`handleTab` sets state.tab - 0", () => {
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

      wrapper = setup(props);
      wrapper.instance().state.signatureType = "write";
      wrapper.instance().handleTab(0);
      expect(wrapper.instance().state.tab).toBe(0);
    });

    test("`handleTab` called with 1 calls handleTab1", () => {
      handleUploadMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(sigUrl));
      addSubmissionMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" })
        );
      let props = {
        apiSubmission: { handleInput, addSubmission: addSubmissionMock },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFContact: createSFContactSuccess,
          updateSFContact: updateSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
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
      const handleTab1Mock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );
      wrapper.instance().state.signatureType = "write";
      wrapper.instance().handleTab1 = handleTab1Mock;
      wrapper.update();
      wrapper
        .instance()
        .handleTab(1)
        .then(() => {
          expect(handleTab1Mock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleTab` handles error if handleTab1 fails", () => {
      const handleTab1Mock = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error()));
      let props = {
        apiSubmission: { handleInput, addSubmission: addSubmissionMock },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFContact: createSFContactSuccess,
          updateSFContact: updateSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
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
      wrapper.instance().handleTab1 = handleTab1Mock;
      handleErrorMock.mockClear();
      formElements.handleError = handleErrorMock;
      wrapper.update();
      wrapper
        .instance()
        .handleTab(1)
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleTab` handles error if handleTab2 fails", () => {
      const handleTab2Mock = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error()));
      let props = {
        apiSubmission: { handleInput, addSubmission: addSubmissionMock },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFContact: createSFContactSuccess,
          updateSFContact: updateSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
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
      wrapper.instance().handleTab2 = handleTab2Mock;
      formElements.handleError = handleErrorMock;
      wrapper.update();
      wrapper
        .instance()
        .handleTab(2)
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBeGreaterThan(1);
        })
        .catch(err => {
          console.log(err);
        });
    });
  });
});
