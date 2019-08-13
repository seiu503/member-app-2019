import React from "react";
import { shallow } from "enzyme";

import { findByTestAttr } from "../../utils/testUtils";
import NavTabs from "../../components/NavTabs";

// variables
let wrapper;

// initial props for form
const defaultProps = {
  classes: { test: "test" },
  handleTab: jest.fn(),
  tab: 1
};

describe("<NavTabs />", () => {
  const setup = () => {
    return shallow(<NavTabs {...defaultProps} />);
  };

  // smoke test
  describe("basic setup", () => {
    beforeEach(() => {
      wrapper = setup();
    });

    it("renders without error", () => {
      const component = findByTestAttr(wrapper, "component-navtabs");
      expect(component.length).toBe(1);
    });
  });
});
