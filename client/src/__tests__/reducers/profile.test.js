import reducer, { INITIAL_STATE } from "../../store/reducers/profile";

const sampleProfile = {
  id: "1651a5d6-c2f7-453f-bdc7-13888041add6",
  name: "Emma Goldman",
  email: "test@test.com",
  avatar_url: "http://www.example.com/avatar.png"
};

describe("profile reducer", () => {
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
  it("should handle all api REQUEST actions", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "GET_PROFILE_REQUEST"
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: null
    });
  });
  it("should handle all api SUCCESS actions", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "GET_PROFILE_SUCCESS",
        payload: sampleProfile
      })
    ).toEqual({
      ...INITIAL_STATE,
      profile: { ...sampleProfile },
      error: null
    });
  });
  it("should handle all api FAILURE actions", () => {
    expect(
      reducer(INITIAL_STATE, {
        type: "GET_PROFILE_FAILURE",
        payload: { message: null }
      })
    ).toEqual({
      ...INITIAL_STATE,
      error: "Sorry, something went wrong :(\nPlease try again."
    });
  });
});
