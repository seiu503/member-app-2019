import React from "react";
import { shallow } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import ButtonWithSpinner from "../../components/ButtonWithSpinner";

const defaultProps = {
  loading: false,
  classes: {}
};

/**
 * Factory function to create a ShallowWrapper for the ButtonWithSpinner component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  return shallow(<ButtonWithSpinner {...setupProps} />);
};

describe("<ButtonWithSpinner />", () => {
  it("renders without error", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "component-button-with-spinner");
    expect(component.length).toBe(1);
  });

  it("renders a spinner if `loading` prop = true", () => {
    const wrapper = setup({ loading: true });
    const component = findByTestAttr(wrapper, "spinner-adornment");
    expect(component.length).toBe(1);
  });

  it("does not render a spinner if `loading` prop = false", () => {
    const wrapper = setup({ loading: false });
    const component = findByTestAttr(wrapper, "spinner-adornment");
    expect(component.length).toBe(0);
  });
});
