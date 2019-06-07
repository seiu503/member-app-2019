import React from "react";
import { shallow } from "enzyme";
import { SpinnerAdornment } from "../../components/SpinnerAdornment";
import CircularProgress from "@material-ui/core/CircularProgress";

describe("<Spinner />", () => {
  it("renders without crashing", () => {
    shallow(<SpinnerAdornment classes={{}} />);
  });

  it("should render a CircularProgress", () => {
    const wrapper = shallow(<SpinnerAdornment classes={{}} />);
    expect(wrapper.find(CircularProgress)).toHaveLength(1);
  });
});
