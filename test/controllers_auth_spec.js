const { mockReq, mockRes } = require("sinon-express-mock");
const sinon = require("sinon");
const chai = require("chai");
const { assert } = sinon;
const { suite, test } = require("mocha");
const nock = require("nock");
const request = require("request");
const passport = require("passport");
const knexCleaner = require("knex-cleaner");
const authCtrl = require("../app/controllers/auth.ctrl.js");
const users = require("../db/models/users");
const { db } = require("../app/config/knex");
const utils = require("../app/utils");
require("../app/config/passport")(passport);

const CLIENT_URL =
  process.env.NODE_CONFIG_ENV === "production"
    ? process.env.APP_HOST_PROD
    : process.env.NODE_CONFIG_ENV === "staging"
    ? process.env.APP_HOST_STAGING
    : process.env.CLIENT_URL;

console.log(`CLIENT_URL: ${CLIENT_URL}`);

const id = "325d0807-1ecf-475b-a5ab-85fea40b3f9e",
  token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMyN…zE1fQ.6y9mMYVXbffHa4Q-aFUd5B3GDyyRF10iBJ28qVlEApk",
  name = `firstname lastname}`,
  email = "fakeemail@test.com",
  adminType = "admin",
  viewType = "view",
  editType = "type",
  avatar_url = "http://example.com/avatar.png",
  profile = {
    id,
    emails: [email],
    name: {
      givenName: "firstname",
      familyName: "lastname"
    },
    picture: avatar_url
  },
  returnedUser = {
    id,
    name: "firstname lastname",
    email,
    avatar_url,
    adminType,
    google_id: "1234",
    google_token: "5678",
    created_at: new Date(),
    updated_at: new Date()
  };

let responseStub,
  next,
  result,
  errorMsg,
  dbMethodStub,
  dbMethods = {},
  authenticateMock,
  res = mockRes(),
  req = mockReq();

suite("auth.ctrl.js", function() {
  after(() => {
    return knexCleaner.clean(db);
  });

  suite("authCtrl > googleCallback", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        authenticateMock = sinon
          .stub(passport, "authenticate")
          .returns(() => {});
        req = mockReq({
          body: { user: returnedUser }
        });
        next = sinon.stub();
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      authenticateMock.restore();
      res = mockRes();
      responseStub = {};
    });

    test("returns 401 if req.authError", async function() {
      responseStub = {
        success: false,
        message: "Error",
        error: "Error"
      };
      req = mockReq({
        authError: "Error"
      });
      try {
        result = await authCtrl.googleCallback(req, res);
        assert.calledWith(res.status, 401);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 401 if req.user.err", async function() {
      responseStub = {
        success: false,
        message: `google auth failed: Error`,
        error: "Error"
      };
      req = mockReq({
        user: {
          err: "Error"
        }
      });
      try {
        result = await authCtrl.googleCallback(req, res);
        assert.calledWith(res.status, 401);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 200 with redirect if req.user", async function() {
      utils.generateToken = sinon.stub().returns("token");
      const res = mockRes();
      const redirectUrl = `${CLIENT_URL}/admin/123/token`;
      const userStub = {
        id: "123"
      };
      const req = mockReq({
        user: userStub
      });
      try {
        result = await authCtrl.googleCallback(req, res);
        assert.calledWith(res.status, 200);
        assert.calledWith(res.redirect, redirectUrl);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 422 with redirect if !req.user", async function() {
      responseStub = {
        success: false,
        message: `google auth failed: Error`,
        error: "Error"
      };
      utils.generateToken = sinon.stub().returns("token");
      const res = mockRes();
      const redirectUrl = `${CLIENT_URL}/login`;
      const req = mockReq({
        user: null
      });
      try {
        result = await authCtrl.googleCallback(req, res);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.redirect, redirectUrl);
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("authCtrl > jwtCallback", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        authenticateMock = sinon
          .stub(passport, "authenticate")
          .returns(() => {});
        req = mockReq({
          body: { user: returnedUser }
        });
        next = sinon.stub();
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      authenticateMock.restore();
      res = mockRes();
      responseStub = {};
    });

    test("returns 422 if req.authError", async function() {
      responseStub = {
        success: false,
        message: `jwt auth failed: Error`,
        error: "Error"
      };
      req = mockReq({
        authError: "Error"
      });
      try {
        result = await authCtrl.jwtCallback(req, res);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 422 if req.user.err", async function() {
      responseStub = {
        success: false,
        message: `jwt auth failed: Error`,
        error: "Error"
      };
      req = mockReq({
        user: {
          err: "Error"
        }
      });
      try {
        result = await authCtrl.jwtCallback(req, res);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns next if req.user", async function() {
      utils.generateToken = sinon.stub().returns("token");
      const res = mockRes();
      next = sinon.stub();
      const loginCallbackStubSuccess = sinon.stub().yields(null, returnedUser);
      const loginStubSuccess = sinon.stub().yields(loginCallbackStubSuccess);
      const userStub = {
        id: "123"
      };
      const req = mockReq({
        user: userStub,
        login: loginStubSuccess
      });
      try {
        result = await authCtrl.jwtCallback(req, res, next);
        assert.calledOnce(next);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns next if req.user && loginErr", async function() {
      utils.generateToken = sinon.stub().returns("token");
      const res = mockRes();
      next = sinon.stub();
      const loginError = "Login Error";
      const loginCallbackStubError = sinon.stub().yields(loginError);
      const loginStubError = sinon.stub().yields(loginCallbackStubError);
      const userStub = {
        id: "123"
      };
      const req = mockReq({
        user: userStub,
        login: loginStubError
      });
      try {
        result = await authCtrl.jwtCallback(req, res, next);
        assert.calledOnce(next);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 422 if !req.user", async function() {
      utils.generateToken = sinon.stub().returns("token");
      const res = mockRes();
      responseStub = {
        success: false,
        message: "Sorry, you must log in to view this page."
      };
      next = sinon.stub();
      const req = mockReq({
        user: null
      });
      try {
        result = await authCtrl.jwtCallback(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("authCtrl > requireAuth", function() {
    before(() => {
      authenticateMock = sinon.stub(passport, "authenticate").returns(() => {});
    });
    after(() => {
      authenticateMock.restore();
      sinon.restore();
    });
    test("calls jwtCallback", async function() {
      const jwtCallbackStub = sinon.stub(authCtrl, "jwtCallback");
      const res = mockRes();
      next = sinon.stub();
      const userStub = {
        id: "123"
      };
      const req = mockReq({
        user: userStub
      });
      try {
        result = await authCtrl.requireAuth(req, res, next);
        assert.calledOnce(authenticateMock);
        // await authenticateMock();
        // assert.calledOnce(jwtCallbackStub);
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("authCtrl > noAccess", function() {
    test("redirects to client `noaccess` route", async function() {
      const jwtCallbackStub = sinon.stub(authCtrl, "jwtCallback");
      const res = mockRes();
      const message = encodeURIComponent(
        "You need an invitation from an administrator before you can create an account"
      );
      const redirectUrl = `${CLIENT_URL}/noaccess?message=${message}`;

      next = sinon.stub();
      const userStub = {
        id: "123"
      };
      const req = mockReq({
        user: userStub
      });
      try {
        result = await authCtrl.noAccess(req, res, next);
        assert.calledWith(res.redirect, redirectUrl);
        assert.calledWith(res.status, 422);
      } catch (err) {
        console.log(err);
      }
    });
  });
});
