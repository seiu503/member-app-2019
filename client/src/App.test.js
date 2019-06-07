import React from "react";
import { createShallow } from "@material-ui/core/test-utils";
import { App } from "./App";

const props = {
  appState: { loggedIn: true, authToken: "12345" },
  profile: {
    profile: {
      id: "12345",
      name: "Emma Goldman",
      email: "testemail@email.com",
      avatar_url: "http://www.example.com/avatar.png"
    }
  },
  content: {
    form: { content_type: "headline", content: "This is a headline" },
    error: "",
    deleteDialogOpen: false,
    currentContent: { content_type: "headline", content: "This is a headline" }
  },
  apiProfile: { validateToken: jest.fn() },
  apiContentActions: {
    addContent: jest.fn(),
    deleteContent: jest.fn(),
    clearForm: jest.fn()
  }
};

describe("<App />", () => {
  let shallow;

  beforeAll(() => {
    shallow = createShallow();
  });

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem.mockClear();
    localStorage.getItem.mockClear();
  });

  it("renders without crashing", () => {
    const wrapper = shallow(<App classes={{}} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  describe("redux properties", () => {
    test("has access to `appState` state", () => {
      const appState = { loggedIn: true, authToken: "12345" };
      const wrapper = shallow(<App classes={{}} {...props} />);
      const appStateProp = wrapper.instance().props.appState;
      expect(appStateProp).toEqual(appState);
    });
    test("has access to `profile` state", () => {
      const profile = {
        profile: {
          id: "12345",
          name: "Emma Goldman",
          email: "testemail@email.com",
          avatar_url: "http://www.example.com/avatar.png"
        }
      };
      const wrapper = shallow(<App classes={{}} {...props} />);
      const profileProp = wrapper.instance().props.profile;
      expect(profileProp).toEqual(profile);
    });
    test("has access to `content` state", () => {
      const content = {
        form: { content_type: "headline", content: "This is a headline" },
        error: "",
        deleteDialogOpen: false,
        currentContent: {
          content_type: "headline",
          content: "This is a headline"
        }
      };
      const wrapper = shallow(<App classes={{}} {...props} />);
      const contentProp = wrapper.instance().props.content;
      expect(contentProp).toEqual(content);
    });
  });
});
