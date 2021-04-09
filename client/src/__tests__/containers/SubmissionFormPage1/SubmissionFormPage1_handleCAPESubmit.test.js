import React from "react";
import { shallow } from "enzyme";
import moment from "moment";
import "jest-canvas-mock";
import * as formElements from "../../../components/SubmissionFormElements";

import { SubmissionFormPage1Container } from "../../../containers/SubmissionFormPage1";

let wrapper, handleErrorMock;

let pushMock = jest.fn(),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  executeMock = jest.fn().mockImplementation(() => Promise.resolve());

let updateSFContactSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_CONTACT_SUCCESS", payload: {} })
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

let getSFDJRSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "GET_SF_DJR_SUCCESS", payload: {} })
  );

let createSFDJRSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "CREATE_SF_DJR_SUCCESS", payload: {} })
  );

let updateSFDJRSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "UPDATE_SF_DJR_SUCCESS", payload: {} })
  );

let getUnioniseTokenSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "GET_UNIONISE_TOKEN_SUCCESS",
    payload: { access_token: "1234" }
  })
);

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

global.scrollTo = jest.fn();

const clearSigBoxMock = jest.fn();
let toDataURLMock = jest.fn();

const sigBox = {
  current: {
    toDataURL: toDataURLMock,
    clear: clearSigBoxMock
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
  },
  translate: jest.fn()
};

const setup = (props = {}) => {
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

  describe("handleCAPESubmit", () => {
    beforeEach(() => {
      handleErrorMock = jest.fn();
    });
    afterEach(() => {
      pushMock.mockClear();
      createCAPESuccess.mockClear();
      jest.restoreAllMocks();
    });

    test("`handleCAPESubmit` calls createCAPE if !capeid", async () => {
      formElements.handleError = jest.fn();
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(0.9));
      postOneTimePaymentSuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "POST_ONE_TIME_PAYMENT_SUCCESS",
          payload: { access_token: 123 }
        })
      );
      getUnioniseTokenSuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "GET_UNIONISE_TOKEN_SUCCESS",
          payload: { access_token: "1234" }
        })
      );
      createCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_CAPE_SUCCESS" })
        );
      createSFCAPESuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_CAPE_SUCCESS",
          payload: { sf_cape_id: 123 }
        })
      );
      updateCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" })
        );
      let props = {
        formValues: {
          capeAmount: 10,
          capeAmountOther: undefined,
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

      wrapper = setup(props);
      let generateCAPEBodyMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({}));
      wrapper.instance().generateCAPEBody = generateCAPEBodyMock;
      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      await wrapper.instance().handleCAPESubmit();

      await wrapper
        .instance()
        .verifyRecaptchaScore()
        .catch(err => {
          console.log(err);
        });
      await generateCAPEBodyMock();
      await createSFCAPESuccess()
        .then(() => {
          expect(createCAPESuccess.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if recaptcha verification fails", () => {
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(0.1));
      formElements.handleError = jest.fn();

      wrapper = setup();

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

    test("`handleCAPESubmit` handles error if paymentRequired && newCardNeeded && !paymentMethodAdded", () => {
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
            paymentMethodAdded: false,
            newCardNeeded: true
          }
        }
      };

      wrapper = setup(props);

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
      updateCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" })
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

      wrapper = setup(props);

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
      createSFCAPESuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_CAPE_SUCCESS",
          payload: { sf_cape_id: 123 }
        })
      );
      createCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_CAPE_SUCCESS" })
        );
      updateCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" })
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
          },
          cape: {}
        },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess
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
        lookupSFContact: lookupSFContactSuccess
      };

      wrapper = setup(props);

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
          console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if createSFCape prop fails", () => {
      formElements.handleError = jest.fn();
      createCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_CAPE_SUCCESS" })
        );
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

      wrapper = setup(props);
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
          console.log(err);
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

      wrapper = setup(props);

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
          console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if createCAPE prop fails", () => {
      formElements.handleError = jest.fn();
      createSFCAPESuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_CAPE_SUCCESS",
          payload: { sf_cape_id: 123 }
        })
      );
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
          },
          cape: {}
        },
        apiSF: {
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess
        },
        apiSubmission: {
          createCAPE: createCAPEError,
          updateCAPE: updateCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      wrapper = setup(props);

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
          console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if createCAPE prop throws", () => {
      formElements.handleError = jest.fn();
      createSFCAPESuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_CAPE_SUCCESS",
          payload: { sf_cape_id: 123 }
        })
      );
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
          createCAPE: createCAPEError,
          updateCAPE: updateCAPESuccess
        },
        cape_legal: {
          current: {
            innerHTML: ""
          }
        },
        reset: jest.fn()
      };

      wrapper = setup(props);

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
          console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if postOneTimePayment prop throws", () => {
      handleErrorMock = jest.fn();
      formElements.handleError = handleErrorMock;
      createSFCAPESuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_CAPE_SUCCESS",
          payload: { sf_cape_id: 123 }
        })
      );
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

      wrapper = setup(props);

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
          await createSFCAPESuccess();
          await createCAPESuccess();
          await postOneTimePaymentError();
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if updateCAPE prop throws", () => {
      handleErrorMock = jest.fn();
      formElements.handleError = handleErrorMock;
      updateCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "UPDATE_CAPE_FAILURE" })
        );
      createSFCAPESuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_CAPE_SUCCESS",
          payload: { sf_cape_id: 123 }
        })
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

      wrapper = setup(props);

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
          await createSFCAPESuccess();
          await createCAPESuccess();
          await postOneTimePaymentSuccess();
          await updateCAPEError();
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if updateSFCAPE prop throws", async () => {
      createCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_CAPE_SUCCESS" })
        );

      createCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_CAPE_FAILURE" })
        );
      handleErrorMock = jest.fn();
      formElements.handleError = handleErrorMock;
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(0.9));
      updateSFCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "UPDATE_SF_CAPE_FAILURE" })
        );
      createSFCAPESuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_CAPE_SUCCESS",
          payload: { sf_cape_id: 123 }
        })
      );
      updateCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" })
        );

      updateCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_FAILURE" })
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

      wrapper = setup(props);

      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      await wrapper.instance().handleCAPESubmit();
      await wrapper
        .instance()
        .verifyRecaptchaScore()
        .catch(err => {
          console.log(err);
        });
      await createSFCAPESuccess();
      await createCAPESuccess();
      await postOneTimePaymentSuccess();
      await updateCAPESuccess();
      await updateSFCAPEError()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
        })
        .catch(err => {
          console.log(err);
        });
    });

    test("`handleCAPESubmit` handles error if updateSFCAPE prop fails", async () => {
      handleErrorMock = jest
        .fn()
        .mockImplementation(() => console.log("handleError"));
      verifyRecaptchaScoreMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve(0.9));
      formElements.handleError = handleErrorMock;
      updateCAPESuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_CAPE_SUCCESS" })
        );
      updateSFCAPEError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SF_CAPE_FAILURE" })
        );
      createSFCAPESuccess = jest.fn().mockImplementation(() =>
        Promise.resolve({
          type: "CREATE_SF_CAPE_SUCCESS",
          payload: { sf_cape_id: 123 }
        })
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
            id: undefined,
            activeMethodLast4: "1234"
          }
        },
        apiSF: {
          updateSFCAPE: updateSFCAPEError,
          lookupSFContact: lookupSFContactSuccess,
          createSFCAPE: createSFCAPESuccess,
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

      wrapper = setup(props);

      wrapper.instance().verifyRecaptchaScore = verifyRecaptchaScoreMock;
      await wrapper.instance().handleCAPESubmit();
      await wrapper
        .instance()
        .verifyRecaptchaScore()
        .catch(err => {
          console.log(err);
        });
      await createSFCAPESuccess();
      await createCAPESuccess();
      await postOneTimePaymentSuccess();
      await updateCAPESuccess();
      await updateSFCAPEError()
        .then(() => {
          expect(handleErrorMock.mock.calls.length).toBe(1);
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

      wrapper = setup(props);

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
          console.log(err);
        });
    });
  });
});
