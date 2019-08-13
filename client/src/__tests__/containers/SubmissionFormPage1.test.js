import React from "react";
import { mount, shallow } from "enzyme";
import moment from "moment";
import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import { Provider } from "react-redux";

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
    wrapper
      .instance()
      .dataURItoBlob(
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCABkAlIDASIAAhEBAxEB/8QAHQABAAIBBQEAAAAAAAAAAAAAAAcIBgECBAUJA//EADUQAAEDBAEDAwMCBQIHAAAAAAABAgMEBQYRBwgSIRMxQQkUIiNRFRYyYXEkkTZCQ1JTobH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A9UwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAK+dXnWDiPS1jNHAltlyTO8j7oMaxmj2+ermX8WySNbtzYkeqJtEVzl/FqKu9BO8t4tMF0p7HPdKSO5VcMlRT0b52pPLFGrUkeyNV7nNar2Iqomk7m790OYUz6Q+lTlBnIM3Vt1Y3+a68p3aCRlotDZnLTYxSS+p3QsRHK3uVkjmJGm2xorvL3uVzbmAAAAAAAAAAAAAAAAAAAAAAAAAADGs85M474ttCX7kjOLHjFvc7sZUXWujpmPdtPxar1TuXynhNr5AyUGMcd8m8fctY43L+NMwteSWZ00lN95b6hJY2ysXTmO15a5Noul0unNX2VFXJwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAjXqK52xLpv4jvnLGYSI+ntcbWUlG2RrZa6revbFTxI5U7nOXyut6Y17vZqlW+hLp8y7kLKq7rp6lqX7vPMyX1sXt1REnp2a2KxGwzMYqfhI5n4xonlsX5Kquld24zyVQR/UA64LZxtSxNr+HOCXPqL/Vse9aa7XZ6s76VHN0jtPYyL+zYqlyO1I1F9EYooqeJkEETI442oxjGNRGtaiaRERPZEQDeAAAAAAAAAAAAAAAAAAABxLrdrVYrdUXi93Okt9BSMWSoqquZsMMTE93Pe5Ua1P7qoHLBFtDz/AGDMlfBw/YLtnbkVjW3ChhWns/5KiK7+ITI2GRrUXbvQ9Z3jSNVfByqvEuW8xZKzJOQ2YjRSvVEocUhZJU+l2IitfXVUblVVdtdxQxOaioiOVU71DMskyzFcNtr7zl+S2qx0Ef8AXVXKtjpYW/5fIqNT/ci2bqv45ueo+McfzTkuR2u12JY/NU0iovsv383pUXn3T9f2RVO+sHTlwvYLumSuwWjvV/RUd/G8gfJd7l3a1tKmrdJIz/DXNansiIiIhJQEMRXTqqzqWJtJi+H8W2xz0dJPdKt1/uqs7Xr2pT06xU0Tld6aKv3EyInfraq1U4Ft6aOHsFuVfzXy3canO8mtcEtyq8py/wBKoW3RRsc6R1NCxjYKSJjUVUbExO1E3tXbcs7FSfqg8yR8T9J+Q2ikVr7xn724rQxdvcqsna5al3bpfaBsrUX4c9nzoDHvpdxQ5Rg/KXOVFZm2S3ckZ/cK+2WqBvp09NRRI1GK2NHK1j1e+Vr+33WNPhERLrkNdHXD9ZwR004FxldYmR3S22z7i5ta1E7ayokdPMxVRE7ux8rmb+UYhMoAArD1O9ePGnBE83H2GxScg8r1Wqe24jZGPqpm1Lv6UqViRyxKn9XpJuVydumoju9Al7m3nbjLp6wipz/lLIorZbodtgiT86ismRqqkMEe9veuvbwie6qieTFOlnq14v6uMTuuVcb094oVslalDXUF3hiiqYlcxHRyaikkarHp3Ii929seiomvNaOJuinlvn7LqPqE+oHkq3l0TfvLTx1A57bfbkRrfT+4ja7sbpEVXQM7u9e31ZH7fEvR/RrprXc7Xzbn1ubDAl+yimibSxI1rYYI2zyxojUY1Gt/1TkTWk/Hw1mvIejwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFY+vLqKunDXGdLgnHEslRyjyZUpjmKUdK9fuYZJlSN9Y1E8p6fe1Gqn/UfH4VEdqzM00VPE+eeVkcUbVe973IjWtRNqqqvsiIUT6U45urXqnzbrFvjFrMPwyebEOOWytcxjWsT9asZG5VTucyRfz2nmZU0it00LG9KHTvaemXhu18d09TFcLzI59wyG7NR3dcrlL5llVXfkqJ4Y3el7WNVU2qkxAAAAAAAAAAAAAAAAHFuVzttmoZrpeLhTUNFTN75qmpmbFFG393PcqIif5Uhms6qscyOWa3cC4bf+Wa6OV1P91YY2xWWOVN7SS6zq2mVEVPPpOlcn/aq+AJwI65O6guI+IZ4LZmmXQtvdb4obDb4ZK+7VzvhsNFA18z97RNo3tTflUTyYTJxn1Icrp38q8sQce2WbfdjvHrnLVuYvdps14qGJJ3ac1Hfbww+Wrp3nZn3GHBPEnDcM6cdYNbrXV1iqtbcla6e4VrlXauqKuVXTzKq+dvevlQMBgzPqg5cVP5GwK38SY7L3avOZMSvvU0ap4dDaoJEjgX381E6qnjcK+x3Fi6XOP8A76nyHlK4XjlPIYHJK24ZhO2rgglRF/KmoGtbR0vuuvSha7225y+SYwBoiI1Ea1ERETSInwagAAAAPOjqyuNNzF9S3gPgjIJaOnx/Eo/5jVtW1O2trHK+pWFUVFRzXNoKdiNdraukT5TfouVW61ehu39UjrNnGI5nU4XyPjELqe2XmFX+nNArlckM3YqSM7XOerZGLtvqP21+0RAtQqo1Fc5URETaqvwV55w6+ulvgSGaHKeSaS8XiJiubZceVtwrHr5/Fex3pRO8e0sjP/aFOKT6X/WlyClLjfOnWFJU4vTtZ/p4L3dbxpUVfxbBUpDGmk0iOVV1+2kRFtFwl9MvpO4UqobxHhc2ZXmBE7K/KpWVqRu2ju5lOjW07VRUTTljV7deHeVVQhSLmTrq68YUoeCsZl4M4xrEasmW3J8iXGup3b/Olka1rlX8Ha9Dt0qoizIilmOl/op4e6Xba6rx6jkyHMK39S55Xd42S3CeVzf1Eidr9CJyq5exqqqoqd75FTuJ9jjjhjbFFG1jGNRrWtTSNRPZET4Q3ADx1xLJ+SfpLc/5nZr7gFyynizLJIX0lbTSuja6Brnup5GSORWevGkskT2P7e9WqqLrtcvsUfCtoaK5UslDcaOCqppU1JDPGj2PTe9K1fC+UQDpePM1tvJGBY7yDZ6WspqHJbXS3amhrIlinjinibI1r2r7ORHIi62n7KqaUyE2sYyJjY42NYxiI1rWppERPZEQ3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVc+pJzI7iDpVyWK11lTDkGaOZitmSlTcrpqlF9VU0qObqnZPpzdqjlZ8qhLXThxNQ8G8GYXxZRQNjdYrTDFWKju71Kx6epUv2qJvumfIqePCKieNFQfqdUvIeI8k8M9QMuBS5pxjxtcHXC+WyF7u2GpWaJWzTtRNI1WtYjHqjmo9qtfpHojrK8J9a3TXz1a6OqwzlGzUtzq2ojrHdqqOiuUb18Kz0JHIsml/5o+5vlPPkCcgaNc1yba5FTap4X5T3NQAAAAAADosqz3BsEpPv83zOxY9Ta3611uMNJHrz57pXNT4X/AGIfruuTp2kqJrbguTXTkW6xI9f4fhFkq73K7t+EfTxrEm1VETukTe/HhFVAn0FdJuYOrbPFSLi7pjo8Ro5VT07vyNf4oXNb+62+gWaXevh0rPPj91T4TdMfMXJUiy8/9UOTVtBIvcuO4LTpjdv0vvFJMx0lXOzXj8pW/H99hnPKHVPwdxLcmY3keZx1+Tzu9OmxqxwSXS8VEmtoxtJTo+RqrpfL0a3+5ilLmnVjy8yN+F8eWrh/H6jtcl1zFUuV7fEq+8dsp3pFA/X/AJ51VNrthJHFfBPD3CNudbOKuO7LjjJW9s81LT7qahN7/WqH7llXfy97jPAIbsfS7hMlTT3vle+3/lS+QS/cpV5bVNnpIplarVdBbomsooETud29sPciL/Uq7VZgp6eno6eKkpII4IIGNjiijajWMYiaRrUTwiIiaREPoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPjWUdHcaSaguFJDVUtQx0U0M0aPjkYqaVrmr4VFTwqKVK5M+ld0dcj1j7jTYTcMPqpXd0j8Zr1pY3efZIJGyQsT4/BjS3YA85qr6QVVidVLWcF9WWc4Yver443wue728IstNNTqi+35dq+Pg3U3Rv9TTGpUixnrmp66CNERj7vV1kz1RE15SWGbzr93L58+/k9FwBRSzdMv1MZ5ETIeuq0UTNrtaLH4qpUT48Pgi/+mbRdJnVjVQthvv1DMvn/ACRXLQYhQ0SqifCKkjlT3X5/bx4LagCpkvRRzBXVCS3Pr05ocxE7VbR1ENLtPn+hNb/vo1i+npZq/wD426quonKGKv5U9dnT207k2iqnY2NFRF0qeHey+Ne5bIAV4w76ffSBhdYl0puFbTeLgqo99XkE093fI5PZzm1T5Gb/AMNT2Qnu1We02GgitdjtdJbqKBvbFTUkDYYo0/ZrGoiIn+EOYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//Z"
      );
  });

  test("`handeTab` saves sigUrl", () => {
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
});
