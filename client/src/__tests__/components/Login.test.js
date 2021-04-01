import React from "react";
import { shallow } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import Login from "../../components/Login";

const defaultProps = {
  classes: {}
};

/**
 * Factory function to create a ShallowWrapper for the FormThankyou component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  return shallow(<Login {...setupProps} />);
};

const oldWindowLocation = window.location;

describe.only("<Login />", () => {
  beforeAll(() => {
    delete window.location;

    window.location = Object.defineProperties(
      {},
      {
        ...Object.getOwnPropertyDescriptors(oldWindowLocation),
        assign: {
          configurable: true,
          value: jest.fn()
        }
      }
    );
  });
  afterAll(() => {
    window.location = oldWindowLocation;
  });
  beforeEach(() => {
    window.location.assign.mockReset();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("renders without error", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "component-login");
    expect(component.length).toBe(1);
  });
  it("assigns location on componentDidMount", () => {
    const wrapper = setup();
    // run lifecycle method
    wrapper.instance().componentDidMount();
    expect(window.location.assign.mock.calls.length).toBe(1);
  });
});
