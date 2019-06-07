import React from "react";
import ReactDOM from "react-dom";
import { shallow, mount } from "enzyme";
import { createShallow, unwrap } from "@material-ui/core/test-utils";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import WrappedApp, { App } from "./App";

const AppNaked = unwrap(WrappedApp);

const fakeFunc = jest.fn();
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
  apiProfile: { validateToken: jest.fn(cb => fakeFunc(null, true)) },
  apiContentActions: {
    addContent: jest.fn(),
    deleteContent: jest.fn(),
    clearForm: jest.fn()
  }
};

const setup = (state = {}) => {
  const wrapper = shallow(<AppNaked classes={{}} {...state} />);
  return wrapper;
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

  it("should work", () => {
    const wrapper = shallow(<App classes={{}} {...props} />);
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

    test("`validateToken` runs on App mount if not logged in and token found in localStorage", () => {
      props.appState.loggedIn = false;
      localStorage.setItem("authToken", "12345");
      localStorage.setItem("userId", '"c08fa228-44ff-4c78-b2d1-6685d06fef08"');

      // set up App component with validateTokenMock as the validateToken prop.
      const wrapper = shallow(<App classes={{}} {...props} />);
      // console.log(props.apiProfile);

      // run lifecycle method
      wrapper.instance().componentDidMount();

      // check to see if mock ran
      const validateTokenCallCount =
        props.apiProfile.validateToken.mock.calls.length;

      expect(validateTokenCallCount).toBe(1);
    });
  });

  //   it("with mount", () => {
  //     const wrapper = mount(
  //       <MuiThemeProvider
  //         theme={{
  //           success: {
  //             main: "#fff"
  //           }
  //         }}
  //       >
  //         <App />
  //       </MuiThemeProvider>
  //     );
  //     console.log("mount", wrapper.debug());
  //   });

  // it("renders without crashing", () => {
  //   const div = document.createElement("div");
  //   ReactDOM.render(<App classes={{}} />, div);
  //   ReactDOM.unmountComponentAtNode(div);
  // });

  // /**
  //  * @function setup
  //  * @param  {Object} state - State for this setup.
  //  * @returns {ShallowWrapper}
  //  */
  // const setup = (state={}) => {
  //   const wrapper = shallow(<App {...state} />);
  //   return wrapper;
  // }

  // this test doesn't work with react-redux 6.x
  //
  // test('`getSecretWord` action creator is a function on the props', () => {
  // 	const wrapper = setup();
  // 	const getSecretWordProp = wrapper.instance().props.getsecretWord;
  // 	expect(getSecretWordProp).toBeInstanceOf(Function);
  // })
});
