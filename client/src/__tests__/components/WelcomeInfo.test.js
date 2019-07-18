import React from "react";
import { shallow } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import WelcomeInfo from "../../components/WelcomeInfo";
import { unwrap } from "@material-ui/core/test-utils";

const defaultProps = {
  classes: {}
};

/**
 * Factory function to create a ShallowWrapper for the WelcomeInfo component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  const WelcomeInfoNaked = unwrap(WelcomeInfo);
  return shallow(<WelcomeInfoNaked {...setupProps} />);
};

describe("<WelcomeInfo />", () => {
  it("renders without error", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "component-welcome-info");
    expect(component.length).toBe(1);
  });
});
