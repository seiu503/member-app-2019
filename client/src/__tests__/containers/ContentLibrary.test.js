import React from "react";
import { shallow, mount } from "enzyme";
import {
  unwrap,
  createShallow,
  createMount
} from "@material-ui/core/test-utils";
import { findByTestAttr } from "../../utils/testUtils";
import ContentLibrary, {
  ContentLibraryUnconnected,
  mapDispatchToProps
} from "../../containers/ContentLibrary";
import { BrowserRouter as Router } from "react-router-dom";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();
let store;

const ContentLibraryNakedUnconnected = unwrap(ContentLibraryUnconnected);
const ContentLibraryNaked = unwrap(ContentLibrary);

const options = {
  untilSelector: "ContentTile"
};
const muiShallow = createShallow(options);

const theme = {
  palette: {
    danger: {
      main: "#b71c1c"
    },
    primary: {
      main: "#b71c1c"
    }
  }
};

const defaultProps = {
  appState: {
    loggedIn: true,
    authToken: "12345"
  },
  content: {
    filteredList: [],
    deleteDialogOpen: false,
    allContent: [
      {
        id: "5eb92d2e-ae94-47c9-bdb4-4780c3b0b33c",
        content_type: "image",
        content: "http:www.example.com/image.png",
        updated_at: "2019-06-11T16:58:01.012Z"
      },
      {
        id: "5eb92d2e-ae94-47c9-bdb4-4780c3b0a12b",
        content_type: "bodyCopy",
        content: "Here is some body copy.",
        updated_at: "2019-06-12T16:58:01.012Z"
      }
    ],
    currentContent: {
      id: "5eb92d2e-ae94-47c9-bdb4-4780c3b0b33c",
      content_type: "image",
      content: "http:www.example.com/image.png",
      updated_at: "2019-06-11T16:58:01.012Z"
    }
  },
  apiContent: {
    getAllContent: jest.fn(),
    handleDeleteOpen: jest.fn()
  },
  classes: { test: "test" }
};

/**
 * Factory function to create a ShallowWrapper for the ContentLibrary component
 * @function setup
 * @param  {object} props - Component props specific to this setup.
 * @return {ShallowWrapper}
 */
const setup = (props = {}) => {
  store = mockStore(defaultProps);
  const setupProps = { ...defaultProps, ...props };
  return muiShallow(
    <Router>
      <ContentLibraryNaked {...setupProps} store={store} />
    </Router>
  );
};

describe("<ContentLibrary />", () => {
  it("renders without error", () => {
    const wrapper = shallow(<ContentLibraryUnconnected {...defaultProps} />);
    const component = findByTestAttr(wrapper, "component-content-library");
    expect(component.length).toBe(1);
  });

  it("has access to `loggedIn` prop", () => {
    const wrapper = shallow(<ContentLibraryUnconnected {...defaultProps} />);
    expect(wrapper.instance().props.appState.loggedIn).toBe(true);
  });

  it("has access to `classes` prop", () => {
    const wrapper = shallow(<ContentLibraryUnconnected {...defaultProps} />);
    expect(typeof wrapper.instance().props.classes).toBe("object");
    expect(wrapper.instance().props.classes.test).toBe("test");
  });

  // test this.deleteContent method

  // test this.props.apiContent.handleDeleteClose method

  // test that FAB click calls handleDeleteDialogOpen

  // test that FAB Edit click calls this.props.history.push w/correct edit route

  test("renders an alert dialog when `deleteDialogOpen` is true", () => {
    const wrapper = shallow(
      <ContentLibraryUnconnected
        {...defaultProps}
        content={{ ...defaultProps.content, deleteDialogOpen: true }}
      />
    );
    const component = findByTestAttr(wrapper, "alert-dialog");
    expect(component.length).toBe(1);
  });

  test("calls `getAllContent` prop on component mount", () => {
    // create a mock function so we can see whether it's called on component mount
    const getAllContentMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ result: { type: "GET_ALL_CONTENT_SUCCESS" } })
      );

    const props = {
      ...defaultProps,
      apiContent: { getAllContent: getAllContentMock },
      classes: {}
    };

    // set up unconnected component with getAllContentMock as getAllContent prop
    const wrapper = shallow(<ContentLibraryUnconnected {...props} />);

    // run lifecycle method
    wrapper.instance().componentDidMount();

    // expect the mock to have been called once
    expect(getAllContentMock.mock.calls.length).toBe(1);

    // restore mock
    getAllContentMock.mockRestore();
  });

  test("calls `getAllContent` prop on component update (new authToken)", () => {
    // create a mock function so we can see whether it's called on component mount
    const getAllContentMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ result: { type: "GET_ALL_CONTENT_SUCCESS" } })
      );

    const props = {
      ...defaultProps,
      apiContent: { getAllContent: getAllContentMock },
      classes: {}
    };

    // set up unconnected component with getAllContentMock as getAllContent prop
    const wrapper = shallow(<ContentLibraryUnconnected {...props} />);

    const prevProps = {
      ...defaultProps,
      appState: {
        authToken: null
      }
    };

    // run lifecycle method
    wrapper.instance().componentDidUpdate(prevProps);

    // expect the mock to have been called once
    expect(getAllContentMock.mock.calls.length).toBe(1);

    // restore mock
    getAllContentMock.mockRestore();
  });

  test("calls `getAllContent` prop on component update (new content)", () => {
    // create a mock function so we can see whether it's called on component mount
    const getAllContentMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ result: { type: "GET_ALL_CONTENT_SUCCESS" } })
      );

    const props = {
      ...defaultProps,
      apiContent: { getAllContent: getAllContentMock },
      classes: {}
    };

    // set up unconnected component with getAllContentMock as getAllContent prop
    const wrapper = shallow(<ContentLibraryUnconnected {...props} />);

    const prevProps = {
      content: {
        allContent: []
      },
      appState: {
        authToken: "12345"
      }
    };

    // run lifecycle method
    wrapper.instance().componentDidUpdate(prevProps);

    // expect the mock to have been called once
    expect(getAllContentMock.mock.calls.length).toBe(1);

    // restore mock
    getAllContentMock.mockRestore();
  });

  // test negative branches for componentDidMount (doesn't call action if conditions not met)

  test("`handleDeleteDialogOpen` method calls `handleDeleteOpen` prop if passed a tile and logged in", () => {
    // create a mock function so we can see whether it's called on component mount
    const handleDeleteOpenMock = jest.fn();
    const props = {
      ...defaultProps,
      apiContent: { handleDeleteOpen: handleDeleteOpenMock },
      classes: {}
    };

    // set up unconnected component with getAllContentMock as getAllContent prop
    const wrapper = shallow(<ContentLibraryUnconnected {...props} />);

    const tile = {
      id: "5eb92d2e-ae94-47c9-bdb4-4780c3b0b33c",
      contentType: "image",
      content: "http:www.example.com/image.png",
      updated_at: "2019-06-11T16:58:01.012Z"
    };

    // run method
    wrapper.instance().handleDeleteDialogOpen(tile);

    // expect the mock to have been called once
    expect(handleDeleteOpenMock.mock.calls.length).toBe(1);

    // restore mock
    handleDeleteOpenMock.mockRestore();
  });
});
