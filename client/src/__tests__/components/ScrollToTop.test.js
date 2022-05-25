import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, cleanup } from "@testing-library/react";
import { UnwrappedScrollToTop } from "../../components/ScrollToTop";

const ScrollToMock = jest.fn();

describe("<ScrollToTop />", () => {
  beforeEach(() => {
    global.window.scrollTo = ScrollToMock;
  });
  afterEach(() => {
    ScrollToMock.mockRestore();
    cleanup();
  });
  it("calls window.scrollTo (location changes, no hash)", () => {
    const { rerender } = render(
      <UnwrappedScrollToTop children="" location={{ pathname: "library" }} />
    );

    // pass different location prop to trigger componentDidUpdate
    rerender(
      <UnwrappedScrollToTop children="" location={{ pathname: "dashboard" }} />
    );

    // check to see if scrollToMock was called in componentDidUpdate
    expect(ScrollToMock).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth"
    });
  });
  it("does not call window.scrollTo (location doesn't change)", () => {
    const { rerender } = render(
      <UnwrappedScrollToTop children="" location={{ pathname: "dashboard" }} />
    );
    // check to see if scrollToMock was called in componentDidUpdate
    expect(ScrollToMock).not.toHaveBeenCalled();
  });
  it("does not call window.scrollTo (location changes, hash exists)", () => {
    const { rerender } = render(
      <UnwrappedScrollToTop children="" location={{ pathname: "dashboard" }} />
    );

    // pass different location prop to trigger componentDidUpdate
    rerender(
      <UnwrappedScrollToTop
        children=""
        location={{ pathname: "library", hash: "dashboard" }}
      />
    );
    // check to see if scrollToMock was called in componentDidUpdate
    expect(ScrollToMock).not.toHaveBeenCalled();
  });
});
