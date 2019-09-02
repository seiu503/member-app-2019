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
import { getSFContactById } from "../../store/actions/apiSFActions";
import { handleInput } from "../../store/actions/apiSubmissionActions";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store,
  wrapper,
  trimSignatureMock,
  handleUploadMock,
  lookupSFContactMock,
  addSubmissionMock,
  createSFContactMock,
  updateSFContactMock;

let pushMock = jest.fn(),
  handleInputMock = jest.fn(),
  handleErrorMock = jest.fn();

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

let getSFContactByIdError = jest
  .fn()
  .mockImplementation(() =>
    Promise.reject({ type: "GET_SF_CONTACT_FAILURE", payload: {} })
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

let sigUrl = "http://www.example.com/png";
global.scrollTo = jest.fn();

const flushPromises = () => new Promise(setImmediate);
const clearSigBoxMock = jest.fn();
const toDataURLMock = jest.fn();

const reCaptchaRef = {
  current: {
    getValue: jest.fn()
  }
};

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
      Promise.resolve({ type: "GET_IFRAME_URL_SUCCESS", payload: {} }),
    createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" }),
    updateSFDJR: () => Promise.resolve({ type: "UPDATE_SF_DJR_SUCCESS" }),
    getSFDJRById: () => Promise.resolve({ type: "GET_SF_DJR_SUCCESS" }),
    updateSFContact: updateSFContactSuccess,
    createSFContact: createSFContactSuccess,
    lookupSFContact: lookupSFContactSuccess
  },
  apiSubmission: {
    handleInput: handleInputMock,
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
  }
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
    test("calls `getSFContactById` on componentDidMount if id in query", () => {
      let props = {
        location: {
          search: "id=1"
        },
        apiSF: {
          getSFContactById: getSFContactById,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
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

    test("handles error if `getSFContactById` fails", () => {
      formElements.handleError = jest.fn();
      let props = {
        location: {
          search: "id=1"
        },
        apiSF: {
          getSFContactById: getSFContactByIdError,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
      };
      store = storeFactory(initialState);

      wrapper = setup(props);

      wrapper.instance().componentDidMount();
      return getSFContactByIdError()
        .then(() => {
          expect(formElements.handleError.mock.calls.length).toBe(1);
        })
        .catch(err => {
          // console.log(err)
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
          salesforceId: "123"
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
          salesforceId: "123"
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

    test("`getSFDJRById` handles error if prop function fails", async function() {
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
  });

  describe("createSFDJR", () => {
    test("`getSFDJRById` calls createSFDJR prop function", async function() {
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

    // test("`createSFDJR` handles error if prop function fails", async function() {
    //   handleInputMock = jest.fn();
    //   formElements.handleError = jest.fn();
    //   let props = {
    //     formValues: {
    //       directPayAuth: true,
    //       directDepositAuth: true,
    //       employerName: "homecare",
    //       paymentType: "card",
    //       employerType: "retired",
    //       preferredLanguage: "English"
    //     },
    //     apiSubmission: {
    //       handleInput: handleInputMock
    //     },
    //     submission: {
    //       salesforceId: "123",
    //       formPage1: {
    //         medicaidResidents: 1,
    //         paymentType: "Card"
    //       },
    //       payment: {
    //         memberShortId: '1234'
    //       },
    //       error: 'Error'
    //     },
    //     apiSF: {
    //       createSFDJR: createSFDJRError
    //     }
    //   };
    //   wrapper = shallow(
    //     <SubmissionFormPage1Container {...defaultProps} {...props} />
    //   );

    //   wrapper.update();
    //   wrapper
    //     .instance()
    //     .createSFDJR()
    //     .then(() => {
    //       console.log(formElements.handleError.mock.calls);
    //       expect(formElements.handleError.mock.calls.length).toBe(1);
    //     })
    //     .catch(err => console.log(err));
    // });
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

      wrapper.update();
      wrapper
        .instance()
        .handleTab1()
        .then(() => {
          return updateSFContactError().then(() => {
            expect(formElements.handleError.mock.calls.length).toBe(1);
          });
        })
        .catch(err => {
          // console.log(err);
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
          updateSFContact: updateSFContactError,
          lookupSFContact: lookupSFContactError,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
        }
      };
      wrapper = shallow(
        <SubmissionFormPage1Container {...defaultProps} {...props} />
      );

      wrapper.update();
      wrapper
        .instance()
        .handleTab1()
        .then(() => {
          return lookupSFContactError().then(() => {
            expect(formElements.handleError.mock.calls.length).toBe(1);
          });
        })
        .catch(err => {
          // console.log(err);
        });
    });

    test("`handleTab1` navigates to tab 1 if salesforceId found in state", async function() {
      handleInputMock = jest.fn();
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
          handleInput: handleInputMock
        },
        submission: {
          salesforceId: "123"
        },
        apiSF: {
          updateSFContact: updateSFContactSuccess,
          createSFDJR: () => Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS" })
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
      const changeTabMock = jest.fn();
      wrapper.instance().changeTab = changeTabMock;
      wrapper.update();
      wrapper
        .instance()
        .handleTab1()
        .then(() => {
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

    test("`handleClose` closes modal", () => {
      wrapper = shallow(<SubmissionFormPage1Container {...defaultProps} />);
      wrapper.instance().handleClose();
      expect(wrapper.instance().state.open).toBe(false);
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

    test("`handleTab2` calculates AFH dues rate if employerType = 'afh'", () => {
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
