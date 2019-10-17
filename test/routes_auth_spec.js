// test/routes_auth_spec.js
/* globals describe afterEach it beforeEach */

/* ================================= SETUP ================================= */

process.env.NODE_ENV = "testing";

const chai = require("chai");
const { db, TABLES } = require("../app/config/knex");
const { assert } = chai;
const chaiHttp = require("chai-http");
const { suite, test } = require("mocha");
const app = require("../server");
const utils = require("../app/utils");
const knexCleaner = require("knex-cleaner");
const { mockReq, mockRes } = require("sinon-express-mock");
const sinon = require("sinon");

const authCtrl = require("../app/controllers/auth.ctrl.js");

/* ================================= TESTS ================================= */

describe("routes : auth", () => {
  after(() => {
    return knexCleaner.clean(db);
  });

  suite("googleCallback controller", function() {
    afterEach(() => {
      sinon.restore();
    });
    test("returns 401 if req.user.err", async function() {
      const userErrorStub = {
        err: "Error"
      };
      const responseStub = {
        success: false,
        message: `google auth failed: Error`,
        error: "Error"
      };
      const req = mockReq({
        user: userErrorStub
      });
      const res = mockRes();
      try {
        await authCtrl.googleCallback(req, res);
        sinon.assert.calledWith(res.status, 401);
        sinon.assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 200 if req.user.id", async function() {
      const userStub = {
        id: "123"
      };
      const req = mockReq({
        user: userStub
      });
      utils.generateToken = sinon.stub().returns("token");
      const res = mockRes();
      const redirectUrl = `http://localhost:3000/admin/123/token`;
      try {
        await authCtrl.googleCallback(req, res);
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.redirect, redirectUrl);
      } catch (err) {
        console.log(err);
      }
      sinon.restore();
    });

    test("redirects to login if !req.user", async function() {
      const req = mockReq({
        user: null
      });
      utils.generateToken = sinon.stub();
      const res = mockRes();
      try {
        await authCtrl.googleCallback(req, res);
        sinon.assert.calledWith(res.redirect, "http://localhost:3000/login");
        sinon.assert.calledWith(res.status, 422);
      } catch (err) {
        console.log(err);
      }
      sinon.restore();
    });
  });
});
