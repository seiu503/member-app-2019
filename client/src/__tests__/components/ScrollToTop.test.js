import React from "react";
import { shallow } from "enzyme";
import ScrollToTop from "../../components/ScrollToTop";

describe("<ScrollToTop />", () => {
  it("renders without crashing", () => {
    shallow(<ScrollToTop />);
  });
});
