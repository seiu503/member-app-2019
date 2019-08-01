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

/* ================================= TESTS ================================= */

let sf_contact_id, submission_id, errorStub;
const cb = sinon.fake();

chai.use(chaiHttp);
suite.only("routes : salesforce", function() {
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
    test("GET EMPLOYERS returns 500 status if SF login throws error", function(done) {
      errorStub = sinon
        .stub(jsforce.Connection.prototype, "login")
        .yields({ message: "Error message" }, null);
      chai
        .request(app)
        .get("/api/sfaccts")
        .end(function(err, res) {
          assert.equal(res.status, 500);
          done();
          errorStub.restore();
        });
    });
    test("GET EMPLOYERS returns 500 status if SF API call throws error", function(done) {
      errorStub = sinon
        .stub(jsforce.Connection.prototype, "query")
        .yields({ message: "Error message" }, null);
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
      this.timeout(5000);
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

  describe("PUT /api/sf/", function() {
    this.timeout(10000);
    const app = require("../server");
    // test error cases first to avoid race condition with success cases
    test("PUT CONTACT returns 500 status if SF login throws error", function(done) {
      errorStub = sinon
        .stub(jsforce.Connection.prototype, "login")
        .yields({ message: "Error message" }, null);
      chai
        .request(app)
        .put("/api/sf/")
        .send(submissionBody)
        .end(function(err, res) {
          assert.equal(res.status, 500);
          done();
          errorStub.restore();
        });
    });
    test("PUT CONTACT returns 500 status if SF API call throws error", function(done) {
      errorStub = sinon
        .stub(jsforce.Connection.prototype, "query")
        .yields({ message: "Error message" }, null);
      chai
        .request(app)
        .put("/api/sf/")
        .send(submissionBody)
        .end(function(err, res) {
          assert.equal(res.status, 500);
          done();
          errorStub.restore();
        });
    });
    test("PUT CONTACT returns an error if request body is missing required fields", function(done) {
      chai
        .request(app)
        .put("/api/sf/")
        .send({ fullname: "firstname lastname" })
        .end(function(err, res) {
          assert.equal(res.status, 500);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
    describe("PUT /api/sf/ SUCCESS", function() {
      afterEach(() => {
        return new Promise(resolve => {
          chai
            .request(app)
            .delete(`/api/sfOMA/${sf_OMA_id}`)
            .end(function(err, res) {
              resolve();
            });
        }).then(() => {
          return new Promise(resolve => {
            chai
              .request(app)
              .delete(`/api/sf/${sf_contact_id}`)
              .end(function(err, res) {
                resolve();
              });
          });
        });
      });
      test("MATCH: updates a SF contact, creates submission, creates OMA", function(done) {
        // this route calls a 3 chained controllers; hence the very long timeout
        this.timeout(12000);
        chai
          .request(app)
          .put("/api/sf/")
          .send(submissionBody)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isNull(err);
            sf_contact_id = res.body.salesforce_id;
            submission_id = res.body.submission_id;
            sf_OMA_id = res.body.sf_OMA_id;
            done();
          });
      });
      test("NO MATCH: creates a SF contact, creates submission, creates OMA", function(done) {
        this.timeout(24000);
        submissionBody.first_name = utils.randomText();
        submissionBody.last_name = utils.randomText();
        submissionBody.home_email = `${utils.randomText()}@fakemail.com`;
        delete submissionBody.contact_id;
        chai
          .request(app)
          .put("/api/sf/")
          .send(submissionBody)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isNull(err);
            assert.property(res.body, "submission_id");
            sf_contact_id = res.body.salesforce_id;
            submission_id = res.body.submission_id;
            sf_OMA_id = res.body.sf_OMA_id;
            done();
          });
      });
    });
  });

  describe("DELETE /api/sfOMA/", function() {
    const app = require("../server");
    this.timeout(10000);
    beforeEach(() => {
      return new Promise(resolve => {
        chai
          .request(app)
          .post(`/api/sfOMA`)
          .send(submissionBody)
          .end(function(err, res) {
            sf_OMA_id = res.body.sf_OMA_id;
            resolve();
          });
      });
    });
    // delete created OMA
    test("DELETE OMA returns 500 status if SF login throws error", function(done) {
      errorStub = sinon
        .stub(jsforce.Connection.prototype, "login")
        .yields({ message: "Error message" }, null);
      chai
        .request(app)
        .delete(`/api/sfOMA/${sf_OMA_id}`)
        .end(function(err, res) {
          assert.equal(res.status, 500);
          done();
          errorStub.restore();
        });
    });
    test("DELETE OMA returns 500 status if SF API call throws error", function(done) {
      errorStub = sinon
        .stub(jsforce.Connection.prototype, "sobject")
        .yields({ message: "Error message" }, null);
      chai
        .request(app)
        .delete(`/api/sfOMA/${sf_OMA_id}`)
        .end(function(err, res) {
          assert.equal(res.status, 500);
          done();
          errorStub.restore();
        });
    });
    test("DELETE OMA success case", function(done) {
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
          done();
        });
    });
  });

  describe("GET /api/sf/:id", function() {
    this.timeout(15000);
    const app = require("../server");
    beforeEach(() => {
      return new Promise(resolve => {
        chai
          .request(app)
          .post("/api/sf/")
          .send(submissionBody)
          .end(function(err, res) {
            sf_contact_id = res.body.salesforce_id;
            resolve();
          });
      });
    });
    afterEach(() => {
      chai
        .request(app)
        .delete(`/api/sf/${sf_contact_id}`)
        .end(function(err, res) {});
    });
    // test error cases first to avoid race condition with success case
    test("GET CONTACT returns an error if ID is missing or malformed", function(done) {
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
    test("GET CONTACT returns 500 status if SF login throws error", function(done) {
      errorStub = sinon
        .stub(jsforce.Connection.prototype, "login")
        .yields({ message: "Error message" }, null);
      chai
        .request(app)
        .get(`/api/sf/${sf_contact_id}`)
        .end(function(err, res) {
          assert.equal(res.status, 500);
          done();
          errorStub.restore();
        });
    });
    test("GET CONTACT returns 500 status if SF API call throws error", function(done) {
      errorStub = sinon
        .stub(jsforce.Connection.prototype, "query")
        .yields({ message: "Error message" }, null);
      chai
        .request(app)
        .get(`/api/sf/${sf_contact_id}`)
        .end(function(err, res) {
          assert.equal(res.status, 500);
          done();
          errorStub.restore();
        });
    });
    // test success path
    test("gets one SF contact by ID", function(done) {
      chai
        .request(app)
        .get(`/api/sf/${sf_contact_id}`)
        .end(function(err, res) {
          // assert that correct record was fetched
          assert.equal(res.body.Id, sf_contact_id);
          assert.equal(res.status, 200);
          assert.isNull(err);
          done();
        });
    });
  });

  describe("DELETE /api/sf/:id", function() {
    this.timeout(8000);
    const app = require("../server");
    beforeEach(() => {
      // create a test contact and save its returned id
      return new Promise(resolve => {
        chai
          .request(app)
          .post("/api/sf/")
          .send(submissionBody)
          .end(function(err, res) {
            sf_contact_id = res.body.salesforce_id;
            resolve();
          });
      });
    });
    test("DELETE CONTACT returns 500 status if SF login throws error", function(done) {
      errorStub = sinon
        .stub(jsforce.Connection.prototype, "login")
        .yields({ message: "Error message" }, null);
      chai
        .request(app)
        .delete(`/api/sf/${sf_contact_id}`)
        .end(function(err, res) {
          assert.equal(res.status, 500);
          done();
          errorStub.restore();
        });
    });
    test("DELETE CONTACT returns 500 status if SF API call throws error", function(done) {
      errorStub = sinon
        .stub(jsforce.Connection.prototype, "sobject")
        .yields({ message: "Error message" }, null);
      chai
        .request(app)
        .delete(`/api/sf/${sf_contact_id}`)
        .end(function(err, res) {
          assert.equal(res.status, 500);
          done();
          errorStub.restore();
        });
    });
    test("DELETE CONTACT returns an error if ID is missing or malformed", function(done) {
      chai
        .request(app)
        .delete(`/api/sf/12345`)
        .end(function(err, res) {
          assert.equal(res.status, 500);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
    test("deletes SF contact", function(done) {
      this.timeout(5000);
      chai
        .request(app)
        .delete(`/api/sf/${sf_contact_id}`)
        .end(function(err, res) {
          // assert that record was deleted
          assert.equal(res.status, 200);
          assert.isNull(err);
          assert.equal(res.body.message, "Successfully deleted contact");
          done();
        });
    });
  });
});
