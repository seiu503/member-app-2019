// test/controllers_sf_spec.js

/* ================================= SETUP ================================= */
const uuid = require("uuid");

process.env.NODE_ENV = "testing";

const chai = require("chai");
const { db, TABLES } = require("../app/config/knex");
const { assert } = require("chai");
const chaiHttp = require("chai-http");
const { suite, test } = require("mocha");
const sinon = require("sinon");
const passport = require("passport");
require("../app/config/passport")(passport);
const utils = require("../app/utils");
const users = require("../db/models/users");
const submissions = require("../db/models/submissions");
const moment = require("moment");
const jsforce = require("jsforce");

const {
  getSFContactById,
  createSFContact,
  lookupSFContact,
  getAllEmployers,
  createSFOnlineMemberApp,
  updateSFContact
} = require("../app/controllers/sf.ctrl");
const { generateSampleSubmission } = require("../app/utils/fieldConfigs");

const submissionBody = generateSampleSubmission();
const testErr = new Error();

/* ================================= TESTS ================================= */

let sf_contact_id, submission_id, errorStub;

chai.use(chaiHttp);
suite("routes : salesforce", function() {
  before(() => {
    return db.migrate.rollback().then(() => {
      return db.migrate.latest();
    });
  });

  after(() => {
    return db.migrate.rollback();
  });

  describe("GET /api/sfaccts", function() {
    const app = require("../server");
    test("returns 500 status if SF API call throws error", function(done) {
      errorStub = sinon
        .stub(jsforce.Connection.prototype, "query")
        .throws(testErr);
      chai
        .request(app)
        .get("/api/sfaccts")
        .end(function(err, res) {
          assert.equal(res.status, 500);
          done();
          errorStub.restore();
        });
    });
    test("gets all SF employers", function(done) {
      chai
        .request(app)
        .get("/api/sfaccts")
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isNull(err);
          assert.isArray(res.body);
          assert.isAbove(res.body.length, 0);
          done();
        });
    });
  });

  describe("PUT /api/sfcontact/", function() {
    // this route calls 3 chained controllers, 2 of which have to call SF and
    // wait for a response; hence the very long timeout
    this.timeout(15000);
    const app = require("../server");
    // test error cases first to avoid race condition with success cases
    test("returns 500 status if SF API call throws error", function(done) {
      errorStub = sinon
        .stub(jsforce.Connection.prototype, "query")
        .throws(testErr);
      chai
        .request(app)
        .put("/api/sfcontact/")
        .end(function(err, res) {
          assert.equal(res.status, 500);
          done();
          errorStub.restore();
        });
    });
    test("returns an error if request body is missing required fields", function(done) {
      chai
        .request(app)
        .put("/api/sfcontact/")
        .send({ fullname: "firstname lastname" })
        .end(function(err, res) {
          assert.equal(res.status, 500);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
    test("MATCH: updates a SF contact, creates submission, creates OMA", function(done) {
      chai
        .request(app)
        .put("/api/sfcontact/")
        .send(submissionBody)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isNull(err);
          sf_contact_id = res.body.salesforce_id;
          submission_id = res.body.submission_id;
          done();
        });
    });
    test("NO MATCH: creates a SF contact, creates submission, creates OMA", function(done) {
      submissionBody.first_name = utils.randomText();
      submissionBody.last_name = utils.randomText();
      submissionBody.home_email = `${utils.randomText()}@fakemail.com`;
      delete submissionBody.contact_id;
      chai
        .request(app)
        .put("/api/sfcontact/")
        .send(submissionBody)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isNull(err);
          assert.property(res.body, "submission_id");
          sf_contact_id = res.body.salesforce_id;
          submission_id = res.body.submission_id;
          sf_OMA_id = res.body.sf_OMA_id;
          // then delete created OMA and then contact to clean up
          chai
            .request(app)
            .delete(`/api/sfOMA/${sf_OMA_id}`)
            .end(function(err, res) {
              // assert that record was deleted
              assert.equal(res.status, 200);
              assert.isNull(err);
              assert.equal(
                res.body.message,
                "Successfully deleted Online Member App"
              );
              chai
                .request(app)
                .delete(`/api/sf/${sf_contact_id}`)
                .end(function(err, res) {
                  // assert that record was deleted
                  assert.equal(res.status, 200);
                  assert.isNull(err);
                  assert.equal(
                    res.body.message,
                    "Successfully deleted contact"
                  );
                  done();
                });
            });
        });
    });
  });

  describe("GET /api/sf/:id", function() {
    const app = require("../server");
    // test error cases first to avoid race condition with success case
    test("returns an error if ID is missing or malformed", function(done) {
      chai
        .request(app)
        .get("/api/sf/12345")
        .end(function(err, res) {
          assert.equal(res.status, 500);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
    test("gets one SF contact by ID", function(done) {
      // calling SF like 6 times sequentially here...
      this.timeout(18000);
      // create a test contact and save its returned id
      chai
        .request(app)
        .post("/api/sf/")
        .send(submissionBody)
        .end(function(err, res) {
          console.log("189");
          assert.equal(res.status, 200);
          assert.isNull(err);
          assert.notProperty(res.body, "submission_id");
          sf_contact_id = res.body.salesforce_id;
          done();
          // then try to fetch the contact
          test("returns 500 status if SF API call throws error", function(done) {
            errorStub = sinon
              .stub(jsforce.Connection.prototype, "query")
              .throws(testErr);
            chai
              .request(app)
              .get(`/api/sf/${sf_contact_id}`)
              .end(function(err, res) {
                console.log("201");
                assert.equal(res.status, 500);
                done();
                errorStub.restore();
              });
          });
          test("fetches previously created contact", function(done) {
            chai
              .request(app)
              .get(`/api/sf/${sf_contact_id}`)
              .end(function(err, res) {
                console.log("212");
                // assert that correct record was fetched
                assert.equal(res.body.Id, sf_contact_id);
                assert.equal(res.status, 200);
                assert.isNull(err);
                // then delete it to clean up
                test("deletes SF contact", function(done) {
                  chai
                    .request(app)
                    .delete(`/api/sf/${sf_contact_id}`)
                    .end(function(err, res) {
                      console.log("223");
                      // assert that record was deleted
                      assert.equal(res.status, 200);
                      assert.isNull(err);
                      assert.equal(
                        res.body.message,
                        "Successfully deleted contact"
                      );
                      done();
                    });
                });
              });
            done();
          });
        });
    });
  });
});
