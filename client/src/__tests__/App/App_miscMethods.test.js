import React from "react";
import { shallow } from "enzyme";
import moment from "moment";

import "jest-canvas-mock";
// import * as formElements from "../../components/SubmissionFormElements";

import { AppUnconnected } from "../../App";

let wrapper;

let pushMock = jest.fn(),
  handleInputMock = jest.fn().mockImplementation(() => Promise.resolve({})),
  clearFormMock = jest.fn().mockImplementation(() => console.log("clearform")),
  executeMock = jest.fn().mockImplementation(() => Promise.resolve()),
  updateSubmissionError = jest.fn().mockImplementation(() => Promise.reject()),
  handleErrorMock = jest.fn();

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

let createSFContactSuccess = jest.fn().mockImplementation(() =>
  Promise.resolve({
    type: "CREATE_SF_CONTACT_SUCCESS",
    payload: { salesforce_id: "123" }
  })
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

let validateTokenSuccess = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: "VALIDATE_TOKEN_SUCCESS", payload: {} })
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

let createSFOMASuccess = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "CREATE_SF_OMA_SUCCESS" }));

let createSFOMAError = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ type: "CREATE_SF_OMA_FAILURE" }));

let refreshRecaptchaMock = jest
  .fn()
  .mockImplementation(() => Promise.resolve({}));

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
  appState: {},
  initialize: jest.fn(),
  addTranslation: jest.fn(),
  profile: {},
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
    createSFOMA: createSFOMASuccess,
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
    updateSubmission: () =>
      Promise.resolve({ type: "UPDATE_SUBMISSION_SUCCESS" }),
    addSubmission: () => Promise.resolve({ type: "ADD_SUBMISSION_SUCCESS" }),
    getAllSubmissions: () =>
      Promise.resolve({ type: "GET_ALL_SUBMISSIONS_SUCCESS" })
  },
  apiProfile: {
    validateToken: validateTokenSuccess
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
  lookupSFContact: lookupSFContactSuccess
};

const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  return shallow(<AppUnconnected {...setupProps} />);
};

describe("<App />", () => {
  beforeEach(() => {
    // console.log = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("misc methods", () => {
    beforeEach(() => {
      handleInputMock = jest.fn().mockImplementation(() => Promise.resolve(""));
    });
    afterEach(() => {
      handleInputMock.mockClear();
    });

    test("`prepForContact` sets employerId conditionally based on prefillEmployerChanged state key", () => {
      const props = {
        submission: {
          formPage1: {
            prefillEmployerId: "1234"
          },
          payment: {}
        }
      };
      const body = {
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
        capeAmountOther: 11,
        employerName: "homecare"
      };
      wrapper = setup(props);
      wrapper.instance().state.prefillEmployerChanged = true;
      wrapper.update();
      wrapper.instance().prepForContact(body);
    });

    test("`updateLanguage` calls this.props.setActiveLanguage", () => {
      const setActiveLanguageMock = jest.fn();
      const props = {
        setActiveLanguage: setActiveLanguageMock
      };
      wrapper = setup(props);
      const fakeEvent = {
        target: {
          value: "English"
        }
      };
      wrapper.instance().updateLanguage(fakeEvent);
      const fakeRef = {
        current: {
          value: "Español"
        }
      };
      wrapper.instance().language_picker = fakeRef;
      wrapper.instance().updateLanguage(fakeEvent);
      //^^ doing this twice to hit branches with userSelectedLanguage
      expect(setActiveLanguageMock).toHaveBeenCalled();
    });

    test("`prepForSubmission` sets salesforceId conditionally based on query string, redux store, and passed values", () => {
      const props = {
        submission: {
          salesforceId: "1234",
          formPage1: {
            legalLanguage: "abc"
          },
          payment: {}
        },
        location: {
          search: "&cId=1234"
        }
      };
      const body = {
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
        capeAmountOther: 11,
        employerName: "homecare"
      };
      wrapper = setup(props);
      wrapper.instance().prepForSubmission(body);
    });

    test("`updateSubmission` uses defaults if no passedId or passedUpdates", () => {
      const props = {
        submission: {
          salesforceId: "1234",
          formPage1: {
            legalLanguage: "abc"
          },
          submissionId: "5678",
          payment: {}
        },
        location: {
          search: "&cId=1234"
        }
      };
      wrapper = setup(props);
      wrapper.instance().updateSubmission();
    });

    test("`saveSubmissionErrors` handles error if updateSubmission throws", () => {
      const props = {
        submission: {
          salesforceId: "1234",
          formPage1: {
            legalLanguage: "abc"
          },
          submissionId: "5678",
          currentSubmission: {},
          payment: {}
        },
        location: {
          search: "&cId=1234"
        }
      };
      wrapper = setup(props);
      wrapper.instance().updateSubmission = updateSubmissionError;
      wrapper.instance().saveSubmissionErrors();
    });

    test("`generateSubmissionBody` uses back end fieldnames if !firstName", () => {
      const props = {
        submission: {
          salesforceId: "1234",
          formPage1: {
            legalLanguage: "abc"
          },
          submissionId: "5678",
          currentSubmission: {},
          payment: {}
        },
        location: {
          search: "&cId=1234"
        }
      };
      const values = {};
      wrapper = setup(props);
      wrapper.instance().updateSubmission = updateSubmissionError;
      wrapper.instance().generateSubmissionBody(values, true);
    });

    test("`resubmitSubmission` calls createSFOMA prop", () => {
      const props = {
        submission: {
          salesforceId: "1234",
          formPage1: {
            legalLanguage: "abc"
          },
          submissionId: "5678",
          currentSubmission: {},
          payment: {}
        }
      };
      wrapper = setup(props);
      wrapper.instance().resubmitSubmission(formValues);
      expect(createSFOMASuccess).toHaveBeenCalled();
    });

    test("`resubmitSubmission` handles error if createSFOMA fails", () => {
      const props = {
        submission: {
          salesforceId: "1234",
          formPage1: {
            legalLanguage: "abc"
          },
          submissionId: "5678",
          currentSubmission: {},
          payment: {}
        },
        apiSF: {
          ...defaultProps.apiSF,
          createSFOMA: createSFOMAError
        }
      };
      wrapper = setup(props);
      wrapper.instance().resubmitSubmission(formValues);
      expect(createSFOMAError).toHaveBeenCalled();
    });

    test("`resubmitSubmission` handles error if createSFOMA throws", () => {
      createSFOMAError = jest.fn().mockImplementation(() => Promise.reject());
      const props = {
        submission: {
          salesforceId: "1234",
          formPage1: {
            legalLanguage: "abc"
          },
          submissionId: "5678",
          currentSubmission: {},
          payment: {}
        },
        apiSF: {
          ...defaultProps.apiSF,
          createSFOMA: createSFOMAError
        }
      };
      wrapper = setup(props);
      wrapper.instance().resubmitSubmission(formValues);
      expect(createSFOMAError).toHaveBeenCalled();
    });

    test("`resubmitSubmission` handles error if updateSubmission fails", async () => {
      updateSubmissionError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "UPDATE_SUBMISSION_FAILURE" })
        );
      createSFOMASuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SF_OMA_SUCCESS" })
        );
      const props = {
        submission: {
          salesforceId: "1234",
          formPage1: {
            legalLanguage: "abc"
          },
          submissionId: "5678",
          currentSubmission: {},
          payment: {}
        },
        apiSF: {
          ...defaultProps.apiSF,
          createSFOMA: createSFOMASuccess
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          updateSubmission: updateSubmissionError
        }
      };
      wrapper = setup(props);
      wrapper.instance().resubmitSubmission(formValues);
      await createSFOMASuccess()
        .then(async () => {
          await updateSubmissionError().catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    });
    test("`resubmitSubmission` handles error if updateSubmission throws", async () => {
      createSFOMASuccess = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "CREATE_SF_OMA_SUCCESS" })
        );
      updateSubmissionError = jest
        .fn()
        .mockImplementation(() => Promise.reject());
      const props = {
        submission: {
          salesforceId: "1234",
          formPage1: {
            legalLanguage: "abc"
          },
          submissionId: "5678",
          currentSubmission: {},
          payment: {}
        },
        apiSubmission: {
          ...defaultProps.apiSubmission,
          updateSubmission: updateSubmissionError
        },
        apiSF: {
          ...defaultProps.apiSF,
          createSFOMA: createSFOMASuccess
        }
      };
      formValues.id = "1234";
      wrapper = setup(props);
      wrapper.instance().resubmitSubmission(formValues);
      await createSFOMASuccess()
        .then(async () => {
          await updateSubmissionError().catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    });
  });
});
