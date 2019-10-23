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

describe.only("<Login />", () => {
  it("renders without error", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "component-login");
    expect(component.length).toBe(1);
  });
  it("assigns location on componentDidMount", () => {
    // mock window.location method
    // beforeAll(() => {
    //   delete window.location;
    //   window.location = { assign: jest.fn() };
    // })
    // afterAll(() => {
    //   window.location = location;
    // });
    const spy = jest.spyOn(window.location, "assign");

    const wrapper = setup();
    // run lifecycle method
    wrapper.instance().componentDidMount();
    expect(spy).toHaveBeenCalled();
  });
});
