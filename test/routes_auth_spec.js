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

/* ================================= TESTS ================================= */

describe("routes : auth", () => {
  before(() => {
    return db.migrate.rollback().then(() => {
      return db.migrate.latest();
    });
  });

  after(() => {
    return db.migrate.rollback();
  });

  suite("GET /api/auth/google", function() {
    test("google auth route returns 200 status", function(done) {
      chai
        .request(app)
        .get("/api/auth/google")
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isNull(err);
          done();
        });
    });
  });

  suite("GET /api/auth/google/callback", function() {
    test("google auth callback route returns 200 status", function(done) {
      chai
        .request(app)
        .get("/api/auth/google/callback")
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isNull(err);
          done();
        });
    });
  });
});
