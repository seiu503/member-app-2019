import React from "react";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";

import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import { generateSampleValidate } from "../../../../app/utils/fieldConfigs";
import { Tab3, Tab3Form } from "../../components/Tab3";
import * as Notifier from "../../containers/Notifier";
import { INITIAL_STATE } from "../../store/reducers/submission";
// variables
let wrapper,
  wrapperDive,
  wrapperDiveDive,
  store,
  handleSubmit,
  apiSubmission,
  apiSF,
  handleSubmitMock,
  addSubmission,
  addSubmissionSuccess,
  addSubmissionError,
  props,
  testData,
  component,
  sfLookupError,
  sfEmployerLookupSuccess,
  sfEmployerLookupFailure,
  getSFEmployersSuccess,
  error,
  touched;

// initial props for form
const defaultProps = {
  onSubmit: jest.fn(),
  classes: { test: "test" },
  reCaptchaChange: jest.fn(),
  reCaptchaRef: { current: {} },
  loading: false,
  pristine: false,
  invalid: false
};

describe("<Tab3 />", () => {
  // assigning handlesubmit as a callback so it can be passed form's onSubmit assignment or our own test function
  // gain access to touched and error to test validation
  // will assign our own test functions to replace action/reducers for apiSubmission prop
  beforeEach(() => {
    touched = false;
    error = null;
    handleSubmit = fn => fn;
    apiSubmission = {};
    apiSF = {};
  });

  // create wrapper with default props and assigned values from above as props
  // const unconnectedSetup = props => {
  //   const setUpProps = { ...defaultProps, handleSubmit, apiSubmission, apiSF };
  //   return shallow(<Tab3Form {...setUpProps} {...props} />);
  // };
  //
  const initialState = {
    appState: {},
    profile: {},
    content: {},
    submission: {},
    form: {}
  };

  store = storeFactory(initialState);
  const setup = props => {
    const setUpProps = { ...defaultProps, handleSubmit, apiSubmission, apiSF };
    return mount(
      <Provider store={store}>
        <Tab3Form {...setUpProps} {...props} />
      </Provider>
    );
  };

  // smoke test and making sure we have access to correct props
  describe("basic setup", () => {
    beforeEach(() => {
      handleSubmit = fn => fn;
      wrapper = setup();
      // wrapperDive = wrapper.dive();
      // wrapperDiveDive = wrapper.dive().dive();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    const props = {
      handleSubmit: fn => fn,
      classes: {}
    };

    it("renders without error", () => {
      const component = findByTestAttr(wrapper, "component-tab3");
      expect(component.length).toBe(1);
    });

    it("calls handleSubmit on submit", () => {
      wrapper = shallow(<Tab3 {...props} />);
      handleSubmitMock = jest.fn();
      handleSubmit = handleSubmitMock;

      // imported function that creates dummy data for form
      testData = generateSampleValidate();

      wrapper.setProps({ handleSubmit: handleSubmitMock });
      component = wrapper.find("form");
      component.simulate("submit", { ...testData });
      expect(handleSubmit.mock.calls.length).toBe(1);
    });
  });
});
