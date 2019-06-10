import React from "react";
import { shallow } from "enzyme";
import { unwrap } from "@material-ui/core/test-utils";
import { findByTestAttr } from "../../utils/testUtils";
import ContentTile from "../../components/ContentTile";

const ContentTileNaked = unwrap(ContentTile);

const defaultProps = {
  contentTile: {
    content_type: "headline",
    content: "some headline text"
  },
  classes: {}
};

/**
 * Factory function to create a ShallowWrapper for the AlertDialog component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  return shallow(<ContentTileNaked {...setupProps} />);
};

describe("<ContentTile />", () => {
  it("renders without error", () => {
    const wrapper = setup({ classes: {} });
    const component = findByTestAttr(wrapper, "component-content-tile");
    expect(component.length).toBe(1);
  });

  test("renders a title ", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "title");
    expect(component.length).toBe(1);
    expect(component.text()).toBe("headline");
  });

  test("renders an image if `content_type` = 'image' ", () => {
    const wrapper = setup({
      contentTile: {
        content_type: "image",
        content: "http://www.example.com/image.jpg"
      }
    });
    const component = findByTestAttr(wrapper, "image");
    expect(component.length).toBe(1);
    const componentStyle = component.get(0).props.style;
    expect(componentStyle).toHaveProperty(
      "backgroundImage",
      `url(http://www.example.com/image.jpg)`
    );
  });

  test("does not render an image if `content_type` prop is anything other than 'image' ", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "image");
    expect(component.length).toBe(0);
  });

  test("renders body text if `content_type` prop is anything other than 'image' ", () => {
    const wrapper = setup();
    const component = findByTestAttr(wrapper, "body");
    expect(component.length).toBe(1);
    expect(component.text()).toBe("some headline text");
  });

  test("does not render body text if `content_type` prop = 'image' ", () => {
    const wrapper = setup({ contentTile: { content_type: "image" } });
    const component = findByTestAttr(wrapper, "body");
    expect(component.length).toBe(0);
  });
});
