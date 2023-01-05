import React from "react";
import "@testing-library/jest-dom/extend-expect";
import {
  fireEvent,
  render,
  screen,
  cleanup,
  waitFor
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContentTile, { styles } from "../../components/ContentTile";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/styles";

const theme = createTheme(adaptV4Theme);

const defaultProps = {
  contentTile: {
    content_type: "headline",
    content: "some headline text"
  },
  classes: {}
};

/**
 * Rewriting setup function using React testing library instead of Enzyme
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {render}
 */
const setup = (props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  return render(
    <ThemeProvider theme={theme}>
      <ContentTile {...setupProps} />
    </ThemeProvider>
  );
};

describe("<ContentTile />", () => {
  it("renders without error", () => {
    const { getByTestId } = setup({ classes: {} });
    const component = getByTestId("component-content-tile");
    expect(component).toBeInTheDocument();
  });

  it("this is kind of a useless test to get coverage of the styles function...", () => {
    const theme = {
      palette: {
        secondary: {
          main: "#b71c1c"
        },
        primary: {
          main: "#b71c1c"
        }
      },
      breakpoints: {
        down: jest.fn()
      },
      spacing: {
        unit: 0
      }
    };
    styles(theme);
  });

  test("renders a title ", () => {
    const { getByTestId } = setup({ classes: {} });
    const component = getByTestId("title");
    expect(component).toBeInTheDocument();
    expect(component).toHaveTextContent("headline");
  });

  test("renders an image if `content_type` is 'image' ", () => {
    const { getByTestId } = setup({
      contentTile: {
        content_type: "image",
        content: "http://www.example.com/image.jpg"
      }
    });
    const component = getByTestId("image");
    expect(component).toBeInTheDocument();
    expect(component.style.backgroundImage).toEqual(
      `url(http://www.example.com/image.jpg)`
    );
  });

  test("does not render an image if `content_type` is not 'image' ", () => {
    const { queryByRole } = setup();
    const component = queryByRole("img");
    expect(component).toBeNull();
  });

  test("renders body text if `content_type` is not 'image' ", () => {
    const { getByTestId } = setup({ classes: {} });
    const component = getByTestId("body");
    expect(component).toBeInTheDocument();
    expect(component).toHaveTextContent("some headline text");
  });

  test("does not render body text if `content_type` is 'image' ", () => {
    const { queryByRole } = setup({ contentTile: { content_type: "image" } });
    const component = queryByRole("article");
    expect(component).toBeNull();
  });
});
