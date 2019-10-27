const { mockReq, mockRes } = require("sinon-express-mock");
const sinon = require("sinon");
const chai = require("chai");
const { assert } = sinon;
const { suite, test } = require("mocha");
const passport = require("passport");
const knexCleaner = require("knex-cleaner");
const userCtrl = require("../app/controllers/users.ctrl.js");
const users = require("../db/models/users");
const { db } = require("../app/config/knex");
require("../app/config/passport")(passport);
let email = "fakeemail@test.com",
  id = "325d0807-1ecf-475b-a5ab-85fea40b3f9e",
  name = `firstname lastname`,
  avatar_url = "http://example.com/avatar.png",
  userBody = {
    name,
    email,
    avatar_url,
    google_id: 1,
    google_token: 123,
    type: "view"
  },
  adminBody = {
    name,
    email,
    avatar_url,
    google_id: 1,
    google_token: 123,
    type: "admin"
  };
returnedUser = {
  id,
  name,
  email,
  avatar_url,
  type: "admin",
  google_id: "1234",
  google_token: "5678",
  created_at: new Date(),
  updated_at: new Date()
};
let requestingUserType = "admin";
let responseStub,
  next,
  errorMsg,
  dbMethodStub,
  dbMethods = {},
  authenticateMock,
  userModelStub,
  res = mockRes(),
  req = mockReq();

suite.only("users.ctrl.js", function() {
  after(() => {
    return knexCleaner.clean(db);
  });
  beforeEach(() => {
    authenticateMock = sinon.stub(passport, "authenticate").returns(() => {});
    userBody = {
      name,
      email,
      avatar_url,
      google_id: 1,
      google_token: 123,
      type: "view"
    };
  });
  afterEach(function() {
    authenticateMock.restore();
    sinon.restore();
  });

  suite("userCtrl > createUser", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          body: { requestingUserType, ...userBody },
          user: { ...adminBody }
        });
        next = sinon.stub();
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      res = mockRes();
      responseStub = {};
    });

    test("creates a single User and returns it", async function() {
      responseStub = {};
      try {
        result = await userCtrl.createUser(req, res, next);
        id = res.locals.testData.id;
        chai.assert(res.locals.testData.id);
        assert.calledWith(res.status, 200);
        chai.assert.property(res.locals.testData, "name");
        chai.assert.property(res.locals.testData, "email");
        chai.assert.property(res.locals.testData, "type");
        chai.assert.property(res.locals.testData, "avatar_url");
        chai.assert.property(res.locals.testData, "google_id");
        chai.assert.property(res.locals.testData, "google_token");
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if wrong userType", async function() {
      req = mockReq({
        body: { requestingUserType: "view", ...userBody },
        user: { ...userBody }
      });
      responseStub = {
        message:
          "You do not have permission to do this. Please consult an administrator."
      };
      try {
        await userCtrl.createUser(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if required field missing", async function() {
      req = mockReq({
        body: { requestingUserType, ...userBody },
        user: { ...adminBody }
      });
      delete req.body.email;
      responseStub = {
        message: "There was an error creating the user account"
      };
      try {
        await userCtrl.createUser(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "There was an error creating the user";
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      userModelStub = sinon.stub(users, "createUser").throws(dbMethodStub);

      try {
        await userCtrl.createUser(req, res);
        assert.called(userModelStub);
        assert.called(dbMethods.createUser);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if db model method throws", async function() {
      errorMsg = `A user with email fakeemail@test.com already exists.`;
      userModelStub = sinon.stub(users, "createUser").rejects({
        message:
          'duplicate key value violates unique constraint "users_email_unique"'
      });

      try {
        await userCtrl.createUser(req, res);
        assert.called(userModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("userCtrl > updateUser", function() {
    beforeEach(function() {
      userBody.name = "other name";
      delete userBody.type;
      delete userBody.email;
      delete userBody.avatar_url;
      delete userBody.google_id;
      delete userBody.google_token;
      delete userBody.type;
      return new Promise(resolve => {
        req = mockReq({
          body: { updates: userBody },
          params: {
            id
          },
          user: { ...adminBody }
        });
        next = sinon.stub();
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      res = mockRes();
    });

    test("updates a user record and returns user to client", async function() {
      const updateUserStub = sinon
        .stub(users, "updateUser")
        .resolves([returnedUser]);
      try {
        await userCtrl.updateUser(req, res, next);
        chai.assert(res.locals.testData.id);
        assert.calledWith(res.status, 200);
        chai.assert.property(res.locals.testData, "id");
        chai.assert.property(res.locals.testData, "type");
        chai.assert.property(res.locals.testData, "email");
        chai.assert.property(res.locals.testData, "google_id");
        chai.assert.property(res.locals.testData, "google_token");
        chai.assert.property(res.locals.testData, "avatar_url");
        chai.assert(res.locals.testData.name, "other name");
        chai.assert.property(res.locals.testData, "created_at");
        chai.assert.property(res.locals.testData, "updated_at");
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 422 if req.body missing", async function() {
      req = mockReq({
        body: { updates: {} },
        params: {
          id
        },
        user: { ...adminBody }
      });
      responseStub = {
        message: "No updates submitted"
      };
      try {
        await userCtrl.updateUser(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 422 if req.params.id missing", async function() {
      req = mockReq({
        body: { updates: userBody, requestingUserType },
        user: { ...adminBody }
      });
      responseStub = {
        message: "No Id Provided in URL"
      };
      try {
        await userCtrl.updateUser(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if wrong userType", async function() {
      req = mockReq({
        body: { requestingUserType: "view", updates: userBody },
        user: { ...userBody }
      });
      responseStub = {
        message:
          "You do not have permission to do this. Please consult an administrator."
      };
      try {
        await userCtrl.updateUser(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 404 if no user found", async function() {
      req = mockReq({
        body: { updates: userBody },
        params: {
          id
        },
        user: { ...adminBody }
      });
      errorMsg = "An error occurred while trying to update this user";
      userModelStub = sinon
        .stub(users, "updateUser")
        .resolves({ message: errorMsg });

      try {
        await userCtrl.updateUser(req, res);
        assert.called(userModelStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      req = mockReq({
        body: { updates: userBody, requestingUserType },
        params: {
          id
        },
        user: { ...adminBody }
      });
      errorMsg = "An error occurred while trying to update this user";
      userModelStub = sinon
        .stub(users, "updateUser")
        .rejects({ message: errorMsg });

      try {
        await userCtrl.updateUser(req, res);
        assert.called(userModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("userCtrl > getUsers", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          user: { ...adminBody }
        });
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      res = mockRes();
    });

    test("gets all users and returns 200", async function() {
      const getUsersStub = sinon
        .stub(users, "getUsers")
        .resolves([returnedUser]);
      try {
        await userCtrl.getUsers(req, res);
        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, sinon.match.array);
        let result = res.locals.testData[0];
        // test that reponse matches data submitted
        // for each key that exists in the response
        Object.keys(userBody).forEach(key => {
          chai.assert.property(result, key);
        });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 404 if user not found", async function() {
      errorMsg = "User not found";
      const userModelStub = sinon
        .stub(users, "getUsers")
        .resolves({ message: errorMsg });

      try {
        await userCtrl.getUsers(req, res);
        assert.called(userModelStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if wrong userType", async function() {
      req = mockReq({
        user: { ...userBody }
      });
      responseStub = {
        message:
          "You do not have permission to do this. Please consult an administrator."
      };
      try {
        await userCtrl.getUsers(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 404 if db model method throws", async function() {
      errorMsg = "No User Found";
      userModelStub = sinon
        .stub(users, "getUsers")
        .rejects({ message: errorMsg });
      try {
        await userCtrl.getUsers(req, res);
        assert.called(userModelStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("userCtrl > getUserById", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id
          }
        });
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      res = mockRes();
    });

    test("gets one user by Id and returns 200", async function() {
      try {
        await userCtrl.getUserById(req, res);
        assert.calledWith(res.status, 200);
        let result = res.locals.testData;
        Object.keys(userBody).forEach(key => {
          chai.assert.property(result, key);
        });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 404 if user not found", async function() {
      errorMsg = "User not found";
      userModelStub = sinon
        .stub(users, "getUserById")
        .resolves({ message: errorMsg });

      try {
        await userCtrl.getUserById(req, res);
        assert.called(userModelStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "User not found";
      userModelStub = sinon
        .stub(users, "getUserById")
        .rejects({ message: errorMsg });

      try {
        await userCtrl.getUserById(req, res);
        assert.called(userModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("userCtrl > getUserByEmail", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            email
          },
          user: { ...adminBody }
        });
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      res = mockRes();
    });

    test("gets one user by email and returns 200", async function() {
      try {
        await userCtrl.getUserByEmail(req, res);
        assert.calledWith(res.status, 200);
        let result = res.locals.testData;
        Object.keys(userBody).forEach(key => {
          chai.assert.property(result, key);
        });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 404 if user not found", async function() {
      errorMsg = "User not found";
      userModelStub = sinon.stub(users, "getUserByEmail").resolves(null);

      try {
        await userCtrl.getUserByEmail(req, res);
        assert.called(userModelStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if wrong userType", async function() {
      req = mockReq({
        params: {
          email
        },
        user: { ...userBody }
      });
      responseStub = {
        message:
          "You do not have permission to do this. Please consult an administrator."
      };
      try {
        await userCtrl.getUserByEmail(req, res);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "User not found";
      userModelStub = sinon
        .stub(users, "getUserByEmail")
        .rejects({ message: errorMsg });

      try {
        await userCtrl.getUserByEmail(req, res);
        assert.called(userModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("userCtrl > deleteUser", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id
          },
          user: { ...adminBody }
        });
        next = sinon.stub();
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      res = mockRes();
    });

    test("returns 500 if wrong userType", async function() {
      req = mockReq({
        user: { ...userBody }
      });
      responseStub = {
        message:
          "You do not have permission to do this. Please consult an administrator."
      };
      try {
        await userCtrl.deleteUser(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("deletes a user and returns 200", async function() {
      req = mockReq({
        params: {
          id
        },
        user: { ...adminBody }
      });
      responseStub = { message: "User deleted successfully" };
      try {
        await userCtrl.deleteUser(req, res, next);
        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 404 if user not found", async function() {
      errorMsg = "An error occurred and the user was not deleted.";
      userModelStub = sinon
        .stub(users, "deleteUser")
        .resolves({ message: errorMsg });

      try {
        await userCtrl.deleteUser(req, res);
        assert.called(userModelStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 404 if db model method error", async function() {
      errorMsg = "An error occurred and the user was not deleted.";
      userModelStub = sinon
        .stub(users, "deleteUser")
        .rejects({ message: errorMsg });
      try {
        await userCtrl.deleteUser(req, res, next);
        assert.called(userModelStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });
});
