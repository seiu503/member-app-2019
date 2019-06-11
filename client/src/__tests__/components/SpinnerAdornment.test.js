import React from "react";
import { shallow } from "enzyme";
import { SpinnerAdornment } from "../../components/SpinnerAdornment";
import CircularProgress from "@material-ui/core/CircularProgress";

describe("<SpinnerAdornment />", () => {
  it("renders without error", () => {
    const wrapper = shallow(<SpinnerAdornment classes={{}} />);
    expect(wrapper.length).toBe(1);
  });

  it("should render a CircularProgress", () => {
    const wrapper = shallow(<SpinnerAdornment classes={{}} />);
    expect(wrapper.find(CircularProgress)).toHaveLength(1);
  });
});
