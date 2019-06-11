import React from "react";
import { shallow } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import Spinner from "../../components/Spinner";

describe("<Spinner />", () => {
  it("renders without crashing", () => {
    const wrapper = shallow(<Spinner />);
    expect(wrapper.length).toBe(1);
  });

  it("render a CircularProgress", () => {
    const wrapper = shallow(<Spinner />);
    const spinner = findByTestAttr(wrapper, "component-spinner");
    expect(spinner.length).toBe(1);
  });
});
