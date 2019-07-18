import React from "react";
import { shallow } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import FormThankyou from "../../components/FormThankyou";

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
  return shallow(<FormThankyou {...setupProps} />);
};

describe("<FormThankyou />", () => {
  it("renders without error", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "component-thankyou");
    expect(component.length).toBe(1);
  });
});
