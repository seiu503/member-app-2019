import React from "react";
import { shallow } from "enzyme";
import NotFound from "../../components/NotFound";

describe("<NotFound />", () => {
  it("renders without crashing", () => {
    shallow(<NotFound classes={{}} />);
  });
});
