import React from "react";
import { shallow } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import { GenerateURLUnconnected } from "../../containers/GenerateURL";
import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();
let store;

const defaultProps = {
  content: {
    selectedContent: {
      h: 1,
      i: 3,
      b: 3
    }
  },
  classes: {
    bannerStrip: ""
  }
};

/**
 * Factory function to create a ShallowWrapper for the Logout component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  store = mockStore(defaultProps);
  const setupProps = { ...defaultProps, ...props };
  return shallow(<GenerateURLUnconnected {...setupProps} store={store} />);
};

let origQueryCommandSupported;
let origExecCommand;
let execCommandMock = jest.fn();
describe("<GenerateURL />", () => {
  beforeEach(() => {
    origQueryCommandSupported = document.queryCommandSupported;
    origExecCommand = document.execCommand;
    document.queryCommandSupported = jest.fn().mockImplementation(() => true);
    document.execCommand = execCommandMock;
  });
  afterEach(() => {
    document.queryCommandSupported = origQueryCommandSupported;
    document.execCommand = origExecCommand;
    execCommandMock.mockRestore();
  });
  it("renders without error", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "component-generate-url");
    expect(component.length).toBe(1);
  });

  it("has access to `content` prop", () => {
    const wrapper = setup();
    expect(typeof wrapper.instance().props.content).toBe("object");
  });

  it("has access to `classes` prop", () => {
    const wrapper = setup();
    expect(typeof wrapper.instance().props.classes).toBe("object");
  });

  it("should receive correct props from redux store", () => {
    const wrapper = setup();
    expect(wrapper.instance().props.content.selectedContent.h).toBe(1);
  });

  it("`copyToClipboard` calls `execCommand(copy)`", () => {
    const wrapper = setup();
    const fakeEvent = {
      target: {
        focus: jest.fn()
      }
    };
    const inputRef = {
      current: {
        select: jest.fn()
      }
    };
    wrapper.instance().input = inputRef;
    wrapper.instance().copyToClipboard(fakeEvent);
    expect(execCommandMock.mock.calls.length).toBe(1);
  });
});
