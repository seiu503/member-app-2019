import React from "react";
import { shallow } from "enzyme";
import CustomSnackbarContent from "../../components/CustomSnackbarContent";

describe("<CustomSnackbarContent />", () => {
  it("renders without crashing", () => {
    shallow(<CustomSnackbarContent classes={{}} variant="success" />);
  });

  // this needs more tests
});
