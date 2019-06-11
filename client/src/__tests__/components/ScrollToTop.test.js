import React from "react";
import { shallow } from "enzyme";
import ScrollToTop from "../../components/ScrollToTop";

describe("<ScrollToTop />", () => {
  it("renders without error", () => {
    const wrapper = shallow(<ScrollToTop />);
    expect(wrapper.length).toBe(1);
  });
});
