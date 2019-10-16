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

let userBody = {
  name: `firstname lastname`,
  email: "fakeemail@test.com",
  avatar_url: "http://example.com/avatar.png",
  google_id: 1,
  google_token: 123,
  type: "view"
};
let requestingUserType = "admin";
let responseStub,
  id,
  next,
  errorMsg,
  dbMethodStub,
  dbMethods = {},
  authenticateMock,
  res = mockRes(),
  req = mockReq();

suite("users.ctrl.js", function() {
  after(() => {
    return knexCleaner.clean(db);
  });
  beforeEach(() => {
    authenticateMock = sinon.stub(passport, "authenticate").returns(() => {});
  });
  afterEach(function() {
    authenticateMock.restore();
    sinon.restore();
  });

  suite("userCtrl > createUser", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          body: { requestingUserType, ...userBody }
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
        // console.log(err);
      }
    });

    test("returns 500 if wrong userType", async function() {
      req = mockReq({
        body: { requestingUserType: "view", ...userBody }
      });
      responseStub = {
        message:
          "You do not have permission to do this. Please Consult an administrator."
      };
      try {
        await userCtrl.createUser(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if required field missing", async function() {
      req = mockReq({
        body: { requestingUserType, ...userBody }
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
        // console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "There was an error creating the user";
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      userModelsStub = sinon.stub(users, "createUser").returns(dbMethodStub);

      try {
        await userCtrl.createUser(req, res);
        assert.called(userModelsStub);
        assert.called(dbMethods.createUser);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
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
          body: { updates: userBody, requestingUserType },
          params: {
            id
          }
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
        // console.log(err);
      }
    });

    test("returns 422 if req.body missing", async function() {
      req = mockReq({
        body: { updates: {}, requestingUserType },
        params: {
          id
        }
      });
      responseStub = {
        message: "No updates submitted"
      };
      try {
        await userCtrl.updateUser(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 422 if req.params.id missing", async function() {
      req = mockReq({
        body: { updates: userBody, requestingUserType }
      });
      responseStub = {
        message: "No Id Provided in URL"
      };
      try {
        await userCtrl.updateUser(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if wrong userType", async function() {
      req = mockReq({
        body: { requestingUserType: "view", updates: userBody }
      });
      responseStub = {
        message:
          "You do not have permission to do this. Please Consult an administrator."
      };
      try {
        await userCtrl.updateUser(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      req = mockReq({
        body: { updates: userBody, requestingUserType },
        params: {
          id
        }
      });
      errorMsg = "An error occurred while trying to update this user";
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      userModelsStub = sinon.stub(users, "updateUser").returns(dbMethodStub);

      try {
        await userCtrl.updateUser(req, res);
        assert.called(userModelsStub);
        assert.called(dbMethods.updateSubmission);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });
  });

  suite("userCtrl > getUsers", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: { user_type: "admin" }
        });
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      res = mockRes();
    });

    test("gets all user and returns 200", async function() {
      userBody.name = `other name`;
      userBody.email = "fakeemail@test.com";
      userBody.avatar_url = "http://example.com/avatar.png";
      userBody.google_id = 1;
      userBody.google_token = 123;
      userBody.type = "view";
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
        // console.log(err);
      }
    });

    test("returns 404 if user not found", async function() {
      errorMsg = "User not found";
      dbMethodStub = sinon.stub().returns(new Error(errorMsg));
      userModelsStub = sinon.stub(users, "getUsers").returns(dbMethodStub);

      try {
        await userCtrl.getUsers(req, res);
        assert.called(userModelsStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if wrong userType", async function() {
      req = mockReq({
        params: { userType: "view" }
      });
      responseStub = {
        message:
          "You do not have permission to do this. Please Consult an administrator."
      };
      try {
        await userCtrl.getUsers(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "No User Found";
      // dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      userModelStub = sinon.stub(users, "getUsers").returns(dbMethodStub);
      try {
        await userCtrl.getUsers(req, res);
        assert.called(userModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });
  });

  suite("userCtrl > getUserById", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id,
            user_type: "admin"
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
        // console.log(err);
      }
    });

    test("returns 404 if user not found", async function() {
      errorMsg = "User not found";
      dbMethodStub = sinon.stub().returns(new Error(errorMsg));
      userModelsStub = sinon.stub(users, "getUserById").returns(dbMethodStub);

      try {
        await userCtrl.getUserById(req, res);
        assert.called(userModelsStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if wrong userType", async function() {
      req = mockReq({
        params: { user_type: "view" }
      });
      responseStub = {
        message:
          "You do not have permission to do this. Please Consult an administrator."
      };
      try {
        await userCtrl.getUserById(req, res);
        assert.called(userModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "User not found";
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      userModelsStub = sinon.stub(users, "getUserById").returns(dbMethodStub);

      try {
        await userCtrl.getUserById(req, res);
        assert.called(userModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });
  });

  suite("userCtrl > getUserByEmail", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            email: userBody.email,
            user_type: "admin"
          }
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
        // console.log(err);
      }
    });

    test("returns 404 if user not found", async function() {
      errorMsg = "User not found";
      dbMethodStub = sinon.stub().returns(new Error(errorMsg));
      userModelsStub = sinon
        .stub(users, "getUserByEmail")
        .returns(dbMethodStub);

      try {
        await userCtrl.getUserByEmail(req, res);
        assert.called(userModelsStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if wrong userType", async function() {
      req = mockReq({
        user_type: userBody.user_type,
        params: { userType: "view" }
      });
      responseStub = {
        message:
          "You do not have permission to do this. Please Consult an administrator."
      };
      try {
        await userCtrl.getUserByEmail(req, res);
        assert.called(userModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "User not found";
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      userModelsStub = sinon
        .stub(users, "getUserByEmail")
        .returns(dbMethodStub);

      try {
        await userCtrl.getUserByEmail(req, res);
        assert.called(userModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });
  });

  suite("userCtrl > deleteUser", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id,
            user_type: "admin"
          }
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
        id,
        params: { user_type: "view" }
      });
      responseStub = {
        message:
          "You do not have permission to do this. Please Consult an administrator."
      };
      try {
        await userCtrl.deleteUser(req, res, next);
        assert.called(userModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });

    test("deletes a user and returns 200", async function() {
      req.params.user_type = "admin";
      responseStub = { message: "User deleted successfully" };
      try {
        await userCtrl.deleteUser(req, res, next);
        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 404 if user not found", async function() {
      errorMsg = "User not found";
      dbMethodStub = sinon.stub().returns(new Error(errorMsg));
      userModelsStub = sinon.stub(users, "deleteUser").returns(dbMethodStub);

      try {
        await userCtrl.deleteUser(req, res);
        assert.called(userModelsStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if db model method error", async function() {
      errorMsg = "An error occurred and the user was not deleted.";
      dbMethodStub = sinon.stub().returns(errorMsg);
      userModelsStub = sinon.stub(users, "deleteUser").returns(dbMethodStub);
      try {
        await userCtrl.deleteUser(req, res, next);
        assert.called(userModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "An error occurred and the user was not deleted.";
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      userModelsStub = sinon.stub(users, "deleteUser").returns(dbMethodStub);

      try {
        await userCtrl.deleteUser(req, res);
        assert.called(userModelsStub);
        assert.called(dbMethods.deleteUser);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });
  });
});
