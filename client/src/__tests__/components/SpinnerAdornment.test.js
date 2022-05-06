import React from "react";
import { shallow } from "enzyme";
import SpinnerAdornment, {
  SpinnerAdornmentBase
} from "../../components/SpinnerAdornment";

import { CircularProgress } from "@mui/icons-material";

describe("<SpinnerAdornment />", () => {
  it("renders without error", () => {
    const wrapper = shallow(<SpinnerAdornment classes={{}} />);
    expect(wrapper.length).toBe(1);
  });

  it("renders a CircularProgress", () => {
    const wrapper = shallow(<SpinnerAdornment classes={{}} />);
    expect(wrapper.find(CircularProgress)).toHaveLength(1);
  });
});
