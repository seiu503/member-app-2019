import reducer, { INITIAL_STATE } from "../../store/reducers/content";

const sampleContent = {
  content_type: "headline",
  content: "Test headline",
  created_at: new Date("July 7 2019"),
  updated_at: new Date("July 7 2019")
};

const emptyContent = {
  id: "",
  content_type: "",
  content: "",
  created_at: "",
  updated_at: ""
};

describe("content reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual(INITIAL_STATE);
  });

  it("should handle LOGOUT", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "LOGOUT"
      })
    ).toEqual(INITIAL_STATE);
  });

  it("should handle HANDLE_INPUT", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "HANDLE_INPUT",
        payload: { name: "content_type", value: "headline" }
      })
    ).toEqual({
      ...INITIAL_STATE,
      form: {
        content_type: "headline",
        content: "",
        dialogOpen: false
      }
    });
  });
  it("should handle HANDLE_DELETE_OPEN", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "HANDLE_DELETE_OPEN",
        payload: {
          selectedContent: sampleContent
        }
      })
    ).toEqual({
      ...INITIAL_STATE,
      deleteDialogOpen: true,
      currentContent: sampleContent
    });
  });
  it("should handle HANDLE_DELETE_CLOSE", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "HANDLE_DELETE_CLOSE"
      })
    ).toEqual({
      ...INITIAL_STATE,
      deleteDialogOpen: false,
      currentContent: emptyContent,
      error: null
    });
  });
  it("should handle DELETE_CONTENT_SUCCESS", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "DELETE_CONTENT_SUCCESS"
      })
    ).toEqual({
      ...INITIAL_STATE,
      deleteDialogOpen: false,
      currentContent: emptyContent,
      error: null
    });
  });
  it("should handle CLEAR_FORM", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "CLEAR_FORM"
      })
    ).toEqual({
      ...INITIAL_STATE,
      form: {
        content: "",
        created_at: "",
        updated_at: "",
        content_type: null,
        dialogOpen: false
      }
    });
  });
  it("should handle all api REQUEST actions", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "GET_CONTENT_BY_ID_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: null
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "ADD_CONTENT_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: null
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "UPDATE_CONTENT_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: null
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "DELETE_CONTENT_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: null
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "UPLOAD_IMAGE_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: null
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "GET_ALL_CONTENT_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: null
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "DELETE_IMAGE_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: null
    });
  });
  it("should handle SUCCESS actions for GET, POST, and PUT content / image", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "GET_CONTENT_BY_ID_SUCCESS",
        payload: sampleContent
      })
    ).toEqual({
      ...INITIAL_STATE,
      form: {
        ...sampleContent,
        dialogOpen: false
      },
      error: null
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "ADD_CONTENT_SUCCESS",
        payload: sampleContent
      })
    ).toEqual({
      ...INITIAL_STATE,
      form: {
        ...sampleContent,
        dialogOpen: false
      },
      error: null
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "UPDATE_CONTENT_SUCCESS",
        payload: sampleContent
      })
    ).toEqual({
      ...INITIAL_STATE,
      form: {
        ...sampleContent,
        dialogOpen: false
      },
      error: null
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "UPLOAD_IMAGE_SUCCESS",
        payload: sampleContent
      })
    ).toEqual({
      ...INITIAL_STATE,
      form: {
        ...sampleContent,
        dialogOpen: false
      },
      error: null
    });
  });
  it("should handle DELETE_IMAGE_SUCCESS", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "DELETE_IMAGE_SUCCESS"
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: null
    });
  });
  it("should handle GET_ALL_CONTENT_SUCCESS", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "GET_ALL_CONTENT_SUCCESS",
        payload: [sampleContent]
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: null,
      allContent: [sampleContent]
    });
  });
  it("should handle all api FAILURE actions", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "GET_CONTENT_BY_ID_FAILURE",
        payload: { message: "Some error" }
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: "Some error"
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "ADD_CONTENT_FAILURE",
        payload: { message: null }
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: "Sorry, something went wrong :(\nPlease try again."
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "UPDATE_CONTENT_FAILURE",
        payload: { message: null }
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: "Sorry, something went wrong :(\nPlease try again."
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "DELETE_CONTENT_FAILURE",
        payload: { message: null }
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: "Sorry, something went wrong :(\nPlease try again."
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "UPLOAD_IMAGE_FAILURE",
        payload: { message: null }
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: "Sorry, something went wrong :(\nPlease try again."
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "GET_ALL_CONTENT_FAILURE",
        payload: { message: null }
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: "Sorry, something went wrong :(\nPlease try again."
    });
    expect(
      reducer(INITIAL_STATE, {
        type: "DELETE_IMAGE_FAILURE",
        payload: { message: null }
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: "Sorry, something went wrong :(\nPlease try again."
    });
  });
});
