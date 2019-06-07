import React from "react";
import { shallow, mount } from "enzyme";
import { unwrap } from "@material-ui/core/test-utils";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import ContentTile from "../../components/ContentTile";
import theme from "../../styles/theme";

const ContentTileNaked = unwrap(ContentTile);

const props = {
  contentTile: {
    content_type: "headline",
    content: "some headline text"
  }
};

describe("<ContentTile />", () => {
  it("renders with shallow", () => {
    shallow(<ContentTileNaked classes={{}} {...props} />);
  });

  it("renders with mount", () => {
    mount(
      <MuiThemeProvider theme={theme}>
        <ContentTile {...props} />
      </MuiThemeProvider>
    );
  });
});
