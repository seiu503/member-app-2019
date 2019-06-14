import React from "react";
import { shallow, mount } from "enzyme";
import SpinnerAdornment, {
  SpinnerAdornmentBase,
  withStylesProps,
  styles
} from "../../components/SpinnerAdornment";
import CircularProgress from "@material-ui/core/CircularProgress";

describe("<SpinnerAdornment />", () => {
  it("renders without error", () => {
    const wrapper = shallow(<SpinnerAdornment classes={{}} />);
    expect(wrapper.length).toBe(1);
  });

  it("renders a CircularProgress", () => {
    const wrapper = shallow(<SpinnerAdornmentBase classes={{}} />);
    expect(wrapper.find(CircularProgress)).toHaveLength(1);
  });

  it("assigns correct color to spinner (`variant: raised`)", () => {
    const props = { variant: "raised", color: "primary" };
    const getContrastTextMock = jest.fn();
    const theme = {
      palette: {
        getContrastText: getContrastTextMock,
        primary: {
          main: "black"
        }
      }
    };
    getContrastTextMock.mockReturnValueOnce("black");
    const spinnerColor = styles(props)(theme);
    expect(getContrastTextMock.mock.calls.length).toBe(1);
    getContrastTextMock.mockRestore();
    expect(spinnerColor.spinner.color).toBe("black");
  });

  it("assigns correct color to spinner (`variant !== raised`)", () => {
    const props = { variant: null, color: "primary" };
    const getContrastTextMock = jest.fn();
    const theme = {
      palette: {
        getContrastText: getContrastTextMock,
        primary: {
          main: "black"
        }
      }
    };
    getContrastTextMock.mockReturnValueOnce("#ffffff");
    const spinnerColor = styles(props)(theme);
    expect(getContrastTextMock.mock.calls.length).toBe(1);
    getContrastTextMock.mockRestore();
    expect(spinnerColor.spinner.color).toBe("#ffffff");
  });
});
