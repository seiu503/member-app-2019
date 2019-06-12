import React from "react";
import { shallow, mount } from "enzyme";
import ScrollToTop, {
  UnwrappedScrollToTop
} from "../../components/ScrollToTop";

const ScrollToMock = jest.fn();

describe("<ScrollToTop />", () => {
  beforeAll(() => {
    // mock window.scrollTo function
    global.window.scrollTo = ScrollToMock;
  });
  afterAll(() => {
    // cleanup after testing
    ScrollToMock.mockRestore();
  });
  it("renders without error", () => {
    const wrapper = shallow(<ScrollToTop />);
    expect(wrapper.length).toBe(1);
  });
  it("calls window.scrollTo if props.location changes", () => {
    const wrapper = mount(
      <UnwrappedScrollToTop children="" location={{ pathname: "dashboard" }} />
    );

    // pass different location prop to trigger componentDidUpdate
    wrapper.setProps({ location: { pathname: "library" } });

    // check to see if scrollToMock was called in componentDidUpdate
    expect(ScrollToMock).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth"
    });
  });
});
