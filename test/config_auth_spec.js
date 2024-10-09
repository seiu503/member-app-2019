/* ================================= SETUP ================================= */

process.env.NODE_ENV = "testing";

const chai = require("chai"),
  { db } = require("../app/config/knex"),
  { mockReq, mockRes } = require("sinon-express-mock"),
  { assert, expect, use, should, request } = chai,
  { suite, test } = require("mocha"),
  knexCleaner = require("knex-cleaner"),
  sinon = require("sinon"),
  sinonChai = require("sinon-chai"),
  passport = require("passport"),
  users = require("../db/models/users"),
  authConfig = require("../app/config/auth"),
  authCtrl = require("../app/controllers/auth.ctrl.js"),
  {
    findUserByEmail,
    updateUser,
    user,
    googleLogin,
    googleStrategy,
    jwtStrategy,
    jwtLogin
  } = authConfig,
  id = "325d0807-1ecf-475b-a5ab-85fea40b3f9e",
  token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMyN…zE1fQ.6y9mMYVXbffHa4Q-aFUd5B3GDyyRF10iBJ28qVlEApk",
  refreshToken = "123",
  name = `firstname lastname}`,
  email = "fakeemail@test.com",
  avatar_url = "http://example.com/avatar.png",
  profile = {
    id,
    emails: [email],
    name: {
      givenName: "firstname",
      familyName: "lastname"
    },
    picture: avatar_url
  };
let returnedUser = {
    id,
    name: "firstname lastname",
    email,
    avatar_url,
    type: "admin",
    google_id: "1234",
    google_token: "5678",
    created_at: new Date(),
    updated_at: new Date()
  },
  req,
  doneStub = sinon.stub();

chai.should();
chai.use(sinonChai);
chai.use(require("chai-passport-strategy"));

suite("config : auth", function() {
  afterEach(() => {
    sinon.restore();
  });

  suite("use serialize / deserialize", function() {
    beforeEach(() => {
      doneStub = sinon.stub();
      returnedUser = {
        id,
        name: "firstname lastname",
        email,
        avatar_url,
        type: "admin",
        google_id: "1234",
        google_token: "5678",
        created_at: new Date(),
        updated_at: new Date()
      };
    });
    afterEach(() => {
      sinon.restore();
    });
    test("serialize returns user Id", async function() {
      await user.serialize(returnedUser, doneStub);
      sinon.assert.calledWith(doneStub, null, returnedUser.id);
    });
    test("deserialize returns user", async function() {
      const getUserByIdStub = sinon
        .stub(users, "getUserById")
        .resolves(returnedUser);
      await user.deserialize(id, doneStub);
      await getUserByIdStub;
      sinon.assert.calledWith(doneStub, null, returnedUser);
    });
    test("deserialize handles error if getUserById throws", async function() {
      const getUserByIdStub = sinon.stub(users, "getUserById").rejects("Error");
      await user.deserialize(id, doneStub);
      getUserByIdStub().catch(err => {
        sinon.assert.calledWith(doneStub, err, null);
      });
    });
  });

  suite("findUserByEmail", function() {
    beforeEach(() => {
      doneStub = sinon.stub();
    });
    afterEach(() => {
      sinon.restore();
    });
    test("returns user if found user with googleId", async function() {
      const getUserByEmailStub = sinon
        .stub(users, "getUserByEmail")
        .resolves(returnedUser);
      await authConfig.findUserByEmail(profile, token, doneStub);
      await getUserByEmailStub();
      sinon.assert.calledWith(doneStub, null, returnedUser);
    });
    test("updates user if found user without googleId", async function() {
      delete returnedUser.google_id;
      const getUserByEmailStub = sinon
        .stub(users, "getUserByEmail")
        .resolves(returnedUser);
      const updateUserStub = sinon.stub(authConfig, "updateUser").resolves({});
      await authConfig.findUserByEmail(profile, token, doneStub);
      await getUserByEmailStub();
      await updateUserStub();
      sinon.assert.calledWith(
        updateUserStub,
        profile,
        token,
        returnedUser.id,
        doneStub
      );
    });
    test("returns null if no user found", async function() {
      const getUserByEmailStub = sinon
        .stub(users, "getUserByEmail")
        .resolves(null);
      await authConfig.findUserByEmail(profile, token, doneStub);
      await getUserByEmailStub();
      sinon.assert.calledWith(doneStub, null, null);
    });
    test("handles error if getUserByEmail throws", async function() {
      const getUserByEmailStub = sinon
        .stub(users, "getUserByEmail")
        .rejects("Error");
      await authConfig.findUserByEmail(profile, token, doneStub);
      getUserByEmailStub().catch(err => {
        sinon.assert.calledWith(doneStub, err, null);
      });
    });
  });

  suite("updateUser", function() {
    beforeEach(() => {
      doneStub = sinon.stub();
    });
    afterEach(() => {
      sinon.restore();
    });
    test("updates user and returns done", async function() {
      const updateUserStub = sinon
        .stub(users, "updateUser")
        .resolves(returnedUser);
      await authConfig.updateUser(profile, token, id, doneStub);
      await updateUserStub();
      sinon.assert.calledWith(doneStub, null, returnedUser);
    });
    test("handles error if updateUser throws", async function() {
      const updateUserStub = sinon.stub(users, "updateUser").rejects("Error");
      await authConfig.updateUser(profile, token, id, doneStub);
      updateUserStub().catch(err => {
        sinon.assert.calledWith(doneStub, err, null);
      });
    });
  });

  suite("jwtLogin", function() {
    beforeEach(() => {
      doneStub = sinon.stub();
      req = {};
    });
    afterEach(() => {
      sinon.restore();
    });
    test("gets user by id and returns done", async function() {
      const getUserByIdStub = sinon
        .stub(users, "getUserById")
        .resolves(returnedUser);
      await authConfig.jwtLogin(req, { id }, doneStub);
      await getUserByIdStub();
      sinon.assert.calledWith(doneStub, null, returnedUser);
      assert.equal(req.user, returnedUser);
    });
    test("handles error if getUserById throws", async function() {
      const getUserByIdStub = sinon.stub(users, "getUserById").rejects("Error");
      await authConfig.jwtLogin({}, { id }, doneStub);
      getUserByIdStub().catch(err => {
        sinon.assert.calledWith(doneStub, err, null);
      });
    });
  });

  suite("googleLogin", function() {
    beforeEach(() => {
      doneStub = sinon.stub();
      req = {
        user: returnedUser
      };
    });
    afterEach(() => {
      sinon.restore();
    });
    test("looks up user by email if no user in req, handles error if findUserByEmail throws", async function() {
      delete req.user;
      const findUserByEmailStub = sinon
        .stub(authConfig, "findUserByEmail")
        .rejects("Error");
      try {
        await authConfig.googleLogin(
          req,
          token,
          refreshToken,
          profile,
          doneStub
        );
      } catch (err) {
        // console.log(err);
      }
      sinon.assert.calledOnce(findUserByEmailStub);
    });
    test("returns user if found", async function() {
      try {
        await authConfig.googleLogin(
          req,
          token,
          refreshToken,
          profile,
          doneStub
        );
      } catch (err) {
        console.log(err);
      }
      sinon.assert.calledWith(doneStub, null, returnedUser);
    });
  });
});
