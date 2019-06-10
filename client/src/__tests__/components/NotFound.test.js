import React from "react";
import { shallow } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import NotFound from "../../components/NotFound";

const defaultProps = {
  classes: {}
};

/**
 * Factory function to create a ShallowWrapper for the NotFound component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  return shallow(<NotFound {...setupProps} />);
};

describe("<NotFound />", () => {
  it("renders without error", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "component-not-found");
    expect(component.length).toBe(1);
  });
});
