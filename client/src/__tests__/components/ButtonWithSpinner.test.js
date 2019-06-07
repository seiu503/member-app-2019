import React from "react";
import { shallow } from "enzyme";
import ButtonWithSpinner from "../../components/ButtonWithSpinner";
import Button from "@material-ui/core/Button";

describe("<ButtonWithSpinner />", () => {
  it("renders without crashing", () => {
    shallow(<ButtonWithSpinner classes={{}} />);
  });

  it("should render a Button", () => {
    const wrapper = shallow(<ButtonWithSpinner classes={{}} />);
    expect(wrapper.find(Button)).toHaveLength(1);
  });
});
