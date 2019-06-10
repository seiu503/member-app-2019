import React from "react";
import { shallow } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import Footer from "../../components/Footer";

const defaultProps = {
  classes: {}
};

/**
 * Factory function to create a ShallowWrapper for the Footer component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  return shallow(<Footer {...setupProps} />);
};

describe("<Footer />", () => {
  it("renders without error", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "component-footer");
    expect(component.length).toBe(1);
  });
});
