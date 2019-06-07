import React from "react";
import { shallow } from "enzyme";
import Spinner from "../../components/Spinner";
import CircularProgress from "@material-ui/core/CircularProgress";

describe("<Spinner />", () => {
  it("renders without crashing", () => {
    shallow(<Spinner />);
  });

  it("should render a CircularProgress", () => {
    const wrapper = shallow(<Spinner />);
    expect(wrapper.find(CircularProgress)).toHaveLength(1);
  });
});
