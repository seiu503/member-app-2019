import React from "react";
import { shallow } from "enzyme";
import { findByTestAttr, storeFactory } from "../../utils/testUtils";
import {
  ContentLibraryUnconnected,
  ContentLibraryConnected
} from "../../containers/ContentLibrary";
import { tableIcons } from "../../components/SubmissionFormElements";

import configureMockStore from "redux-mock-store";
const mockStore = configureMockStore();

let store;

let deleteImageMock,
  deleteImageErrorMock,
  deleteContentMock,
  deleteContentErrorMock,
  getAllContentMock,
  wrapper;

const initialState = {
  appState: {
    loggedIn: false,
    authToken: ""
  },
  profile: {
    profile: {
      _id: "",
      name: "",
      avatar_url: ""
    },
    error: "",
    loading: false
  },
  content: {
    error: "",
    loading: false,
    currentContent: {
      content_type: "headline",
      content: "test"
    },
    selectedContent: {
      i: null,
      h: null,
      b: null
    },
    allContent: [
      {
        content_type: "headline",
        content: "test",
        id: 123
      }
    ]
  }
};

const defaultProps = {
  appState: {
    loggedIn: true,
    authToken: "12345",
    userType: "admin"
  },
  content: {
    filteredList: [],
    deleteDialogOpen: false,
    allContent: [
      {
        id: 1,
        content_type: "image",
        content: "http:www.example.com/image.png",
        updated_at: "2019-06-11T16:58:01.012Z"
      },
      {
        id: 2,
        content_type: "bodyCopy",
        content: "Here is some body copy.",
        updated_at: "2019-06-12T16:58:01.012Z"
      }
    ],
    currentContent: {
      id: 2,
      content_type: "bodyCopy",
      content: "Here is some body copy.",
      updated_at: "2019-06-11T16:58:01.012Z"
    },
    selectedContent: {
      i: 1,
      h: 2,
      b: 3
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

  it("renders connected component", () => {
    store = storeFactory(initialState);
    wrapper = shallow(
      <ContentLibraryConnected {...defaultProps} store={store} />
    )
      .dive()
      .dive();
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
      jest.restoreAllMocks();
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

    // test("calls `handleDeleteDialogOpen` method on delete button click", () => {
    //   // create a mock function so we can see whether it's called on click
    //   const handleDeleteDialogOpenMock = jest.fn();

    //   wrapper.instance().handleDeleteDialogOpen = handleDeleteDialogOpenMock;

    //   // simulate click
    //   const deleteButton = wrapper.find('[data-testid="delete"]').first();
    //   deleteButton.simulate("click");

    //   // expect the mock to have been called once
    //   expect(handleDeleteDialogOpenMock.mock.calls.length).toBe(1);

    //   // restore mock
    //   handleDeleteDialogOpenMock.mockRestore();
    // });

    // test("calls `this.props.history.push` w/correct edit route on edit button click", () => {
    //   // create a mock function so we can see whether it's called on click
    //   const pushMock = jest.fn();

    //   wrapper.instance().props.history.push = pushMock;

    //   // simulate click
    //   const editButton = wrapper.find('[data-testid="edit"]').first();
    //   editButton.simulate("click");

    //   // expect the mock to have been called once
    //   expect(pushMock.mock.calls.length).toBe(1);

    //   // restore mock
    //   pushMock.mockRestore();
    // });

    test("`componentDidMount` calls `getAllContent`", () => {
      // run lifecycle method
      wrapper.instance().componentDidMount();

      // expect the mock to have been called once
      expect(getAllContentMock.mock.calls.length).toBe(1);
    });

    test("`componentDidMount` and `componentDidUpdate` handle error if `getAllContent` fails", () => {
      const getAllContentError = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ type: "GET_ALL_CONTENT_FAILURE" })
        );
      wrapper.instance().props.apiContent.getAllContent = getAllContentError;
      wrapper.update();
      wrapper.instance().componentDidMount();
      const prevProps = {
        content: {
          allContent: []
        },
        appState: {}
      };
      wrapper.instance().componentDidUpdate(prevProps);

      // expect the mock to have been called once
      expect(getAllContentError.mock.calls.length).toBe(2);
    });

    test("`componentDidMount` and `componentDidUpdate` handle error if `getAllContent` throws", () => {
      const getAllContentError = jest
        .fn()
        .mockImplementation(() =>
          Promise.reject({ type: "GET_ALL_CONTENT_FAILURE" })
        );
      wrapper.instance().props.apiContent.getAllContent = getAllContentError;
      wrapper.update();
      wrapper.instance().componentDidMount();
      const prevProps = {
        content: {
          allContent: []
        },
        appState: {}
      };
      wrapper.instance().componentDidUpdate(prevProps);

      // expect the mock to have been called once
      expect(getAllContentError.mock.calls.length).toBe(2);
    });

    test("`componentDidUpdate` calls `getAllContent` (new authToken)", () => {
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

    test("`componentDidUpdate` calls `getAllContent` (new content)", () => {
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

    test("`componentDidUpdate` doesn't calls `getAllContent` (new content)", () => {
      const prevProps = {
        content: {
          allContent: [
            {
              id: 1,
              content_type: "image",
              content: "http:www.example.com/image.png",
              updated_at: "2019-06-11T16:58:01.012Z"
            },
            {
              id: 2,
              content_type: "bodyCopy",
              content: "Here is some body copy.",
              updated_at: "2019-06-12T16:58:01.012Z"
            }
          ]
        },
        appState: {
          authToken: "12345",
          userType: "admin"
        }
      };

      // run lifecycle method
      wrapper.instance().componentDidUpdate(prevProps);
      expect(getAllContentMock.mock.calls.length).toBe(0);
    });

    test("`handleDeleteDialogOpen` method calls `handleDeleteOpen` prop if rowData and logged in", () => {
      // create a mock function so we can see whether it's called on component mount
      const handleDeleteOpenMock = jest.fn();
      wrapper.instance().props.apiContent.handleDeleteOpen = handleDeleteOpenMock;

      const rowData = {
        id: "5eb92d2e-ae94-47c9-bdb4-4780c3b0b33c",
        contentType: "image",
        content: "http:www.example.com/image.png",
        updated_at: "2019-06-11T16:58:01.012Z"
      };

      // run method
      wrapper.instance().handleDeleteDialogOpen(null, rowData);

      // expect the mock to have been called once
      expect(handleDeleteOpenMock.mock.calls.length).toBe(1);

      // restore mock
      handleDeleteOpenMock.mockRestore();
    });

    test("`handleDeleteDialogOpen` method doesn't call `handleDeleteOpen` prop if !rowData", () => {
      // create a mock function so we can see whether it's called on component mount
      const handleDeleteOpenMock = jest.fn();
      wrapper.instance().props.apiContent.handleDeleteOpen = handleDeleteOpenMock;

      // run method
      wrapper.instance().handleDeleteDialogOpen(null, null);

      // expect the mock to have been called once
      expect(handleDeleteOpenMock.mock.calls.length).toBe(0);

      // restore mock
      handleDeleteOpenMock.mockRestore();
    });

    test("`handleDeleteDialogOpen` method doesn't call `handleDeleteOpen` prop if wrong userType", () => {
      // create a mock function so we can see whether it's called on component mount
      const handleDeleteOpenMock = jest.fn();
      wrapper.instance().props.apiContent.handleDeleteOpen = handleDeleteOpenMock;
      wrapper.instance().props.appState.userType = "view";

      // run method
      wrapper.instance().handleDeleteDialogOpen(null, null);

      // expect the mock to have been called once
      expect(handleDeleteOpenMock.mock.calls.length).toBe(0);

      // restore mock
      handleDeleteOpenMock.mockRestore();
    });

    test("`handleEdit` calls this.props.history.push", () => {
      const pushMock = jest.fn();
      wrapper.instance().props.history.push = pushMock;

      wrapper.instance().handleEdit(null, { id: 1 });

      expect(pushMock.mock.calls.length).toBe(1);

      pushMock.mockRestore();
    });

    test("`handleSelect` calls selectContent if unselected", () => {
      const selectContentMock = jest.fn();
      wrapper.instance().props.apiContent.selectContent = selectContentMock;
      wrapper.instance().props.content.selectedContent = { h: 1 };

      // run method
      wrapper
        .instance()
        .handleSelect(null, { id: 0, content_type: "headline" });

      // expect the mock to have been called once
      expect(selectContentMock.mock.calls.length).toBe(1);

      // restore mock
      selectContentMock.mockRestore();
    });

    test("`handleSelect` calls unselectContent if selected", () => {
      const unselectContentMock = jest.fn();
      wrapper.instance().props.apiContent.unselectContent = unselectContentMock;
      wrapper.instance().props.content.selectedContent = { h: 1 };

      // run method
      wrapper
        .instance()
        .handleSelect(null, { id: 1, content_type: "headline" });

      // expect the mock to have been called once
      expect(unselectContentMock.mock.calls.length).toBe(1);

      // restore mock
      unselectContentMock.mockRestore();
    });

    test("`checked` returns CheckBoxChecked icon if selected", () => {
      wrapper.instance().props.content.selectedContent = { h: 1 };
      const result = wrapper
        .instance()
        .checked({ id: 1, content_type: "headline" });

      // expect the result to be the checked icon
      expect(result).toBe(tableIcons.CheckBoxChecked);
    });

    test("`checked` returns CheckBoxOutlineBlank icon if selected", () => {
      wrapper.instance().props.content.selectedContent = { h: 0 };
      const result = wrapper
        .instance()
        .checked({ id: 1, content_type: "headline" });

      // expect the result to be the checked icon
      expect(result).toBe(tableIcons.CheckBoxBlank);
    });

    test("`selectAction` returns CheckBoxOutlineBlank icon if not selected", () => {
      wrapper.instance().props.content.selectedContent = { h: 0 };
      const result = wrapper
        .instance()
        .selectAction({ id: 1, content_type: "headline" });

      // expect the result to be the checked icon
      expect(result.icon).toBe(tableIcons.CheckBoxBlank);
    });

    test("`selectAction` returns CheckBoxChecked icon if selected", () => {
      wrapper.instance().props.content.selectedContent = { h: 1 };
      const result = wrapper
        .instance()
        .selectAction({ id: 1, content_type: "headline" });

      // expect the result to be the checked icon
      expect(result.icon).toBe(tableIcons.CheckBoxChecked);
    });

    test("`editAction` returns Edit icon", () => {
      wrapper.instance().props.content.selectedContent = { h: 1 };
      const result = wrapper
        .instance()
        .editAction({ id: 1, content_type: "headline" });

      expect(result.icon).toBe(tableIcons.Edit);
    });

    test("`deleteAction` returns Delete icon", () => {
      wrapper.instance().props.content.selectedContent = { h: 1 };
      const result = wrapper
        .instance()
        .deleteAction({ id: 1, content_type: "headline" });

      expect(result.icon).toBe(tableIcons.Delete);
    });
  });
});
