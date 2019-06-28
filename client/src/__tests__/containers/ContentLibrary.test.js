import React from "react";
import { shallow } from "enzyme";
import { findByTestAttr } from "../../utils/testUtils";
import { ContentLibraryUnconnected } from "../../containers/ContentLibrary";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store;

let deleteImageMock,
  deleteImageErrorMock,
  deleteContentMock,
  deleteContentErrorMock,
  getAllContentMock,
  getAllContentErrorMock,
  wrapper;

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
      content_type: "bodyCopy",
      content: "Here is some body copy.",
      updated_at: "2019-06-11T16:58:01.012Z"
    }
  },
  apiContent: {
    getAllContent: jest.fn(),
    deleteContent: jest.fn(),
    deleteImage: jest.fn(),
    handleDeleteOpen: jest.fn()
  },
  classes: { test: "test" },
  history: {
    push: jest.fn()
  }
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
  return shallow(<ContentLibraryUnconnected {...setupProps} store={store} />);
};

describe("<ContentLibrary />", () => {
  beforeEach(() => {
    wrapper = shallow(<ContentLibraryUnconnected {...defaultProps} />);
  });

  it("renders without error", () => {
    const component = findByTestAttr(wrapper, "component-content-library");
    expect(component.length).toBe(1);
  });

  it("should have access to expected props", () => {
    wrapper = setup();
    // test that the state values were correctly passed as props
    expect(wrapper.instance().props.appState.loggedIn).toBe(true);
  });

  test("renders an alert dialog when `deleteDialogOpen` is true", () => {
    wrapper.setProps({
      content: {
        ...defaultProps.content,
        deleteDialogOpen: true
      }
    });
    const component = findByTestAttr(wrapper, "alert-dialog");
    expect(component.length).toBe(1);
  });

  describe("tests that require mocked redux actions", () => {
    beforeEach(() => {
      deleteImageMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "DELETE_IMAGE_SUCCESS" })
        );
      deleteImageErrorMock = jest.fn().mockImplementation(() => {
        wrapper.instance().props.content.error =
          "An error occurred and the image was not deleted.";
        wrapper.instance().forceUpdate();
        return Promise.resolve({ type: "DELETE_IMAGE_FAILURE" });
      });
      deleteContentMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "DELETE_CONTENT_SUCCESS" })
        );
      deleteContentErrorMock = jest.fn().mockImplementation(() => {
        wrapper.instance().props.content.error =
          "An error occurred and the content was not deleted.";
        wrapper.instance().forceUpdate();
        return Promise.resolve({ type: "DELETE_CONTENT_FAILURE" });
      });
      getAllContentMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_ALL_CONTENT_SUCCESS" })
        );
      getAllContentErrorMock = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_ALL_CONTENT_FAILURE" })
        );
      wrapper.setProps({
        ...defaultProps,
        apiContent: {
          deleteContent: deleteContentMock,
          deleteImage: deleteImageMock,
          getAllContent: getAllContentMock
        }
      });
    });
    afterEach(() => {
      deleteImageMock.mockRestore();
      deleteContentMock.mockRestore();
      getAllContentMock.mockRestore();
      deleteImageErrorMock.mockRestore();
      deleteContentErrorMock.mockRestore();
      getAllContentErrorMock.mockRestore();
      wrapper.instance().props.content.error = "";
    });

    test("`this.deleteContent` calls `this.props.apiContent.deleteContent`", () => {
      const contentData = { ...defaultProps.content.currentContent };
      wrapper.instance().deleteContent(contentData);
      expect(deleteContentMock.mock.calls.length).toBe(1);
    });

    test("if content_type = 'image', `deleteContent` calls `this.props.apiContent.deleteImage`", () => {
      const contentData = { ...defaultProps.content.allContent[0] };
      wrapper.instance().deleteContent(contentData);
      // expect(deleteImageMock.mock.calls.length).toBe(1);
    });

    test("`this.deleteContent` returns an error if deleteContent api call fails", () => {
      wrapper.instance().props.apiContent.deleteContent = deleteContentErrorMock;
      const contentData = { junkData: "that will fail" };
      wrapper.instance().deleteContent(contentData);
      expect(wrapper.instance().props.content.error).toBe(
        "An error occurred and the content was not deleted."
      );
    });

    test("`this.deleteContent` returns an error if deleteImage api call fails", () => {
      wrapper.instance().props.apiContent.deleteImage = deleteImageErrorMock;
      const contentData = { ...defaultProps.content.allContent[0] };
      wrapper.instance().deleteContent(contentData);
      // expect(deleteImageErrorMock.mock.calls.length).toBe(1);
    });

    //**** TODO:  test this.props.apiContent.handleDeleteClose method

    test("calls `handleDeleteDialogOpen` method on delete button click", () => {
      // create a mock function so we can see whether it's called on click
      const handleDeleteDialogOpenMock = jest.fn();

      wrapper.instance().handleDeleteDialogOpen = handleDeleteDialogOpenMock;

      // simulate click
      const deleteButton = wrapper.find('[data-test="delete"]').first();
      deleteButton.simulate("click");

      // expect the mock to have been called once
      expect(handleDeleteDialogOpenMock.mock.calls.length).toBe(1);

      // restore mock
      handleDeleteDialogOpenMock.mockRestore();
    });

    test("calls `this.props.history.push` w/correct edit route on edit button click", () => {
      // create a mock function so we can see whether it's called on click
      const pushMock = jest.fn();

      wrapper.instance().props.history.push = pushMock;

      // simulate click
      const editButton = wrapper.find('[data-test="edit"]').first();
      editButton.simulate("click");

      // expect the mock to have been called once
      expect(pushMock.mock.calls.length).toBe(1);

      // restore mock
      pushMock.mockRestore();
    });

    test("calls `getAllContent` prop on component mount", () => {
      // run lifecycle method
      wrapper.instance().componentDidMount();

      // expect the mock to have been called once
      expect(getAllContentMock.mock.calls.length).toBe(1);
    });

    test("calls `getAllContent` prop on component update (new authToken)", () => {
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
    });

    test("calls `getAllContent` prop on component update (new content)", () => {
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
    });

    // test negative branches for componentDidMount (doesn't call action if conditions not met)

    test("`handleDeleteDialogOpen` method calls `handleDeleteOpen` prop if passed a tile and logged in", () => {
      // create a mock function so we can see whether it's called on component mount
      const handleDeleteOpenMock = jest.fn();
      wrapper.instance().props.apiContent.handleDeleteOpen = handleDeleteOpenMock;

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
});
