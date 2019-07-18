// test/routes_submissions_spec.js
/* globals describe afterEach it beforeEach */

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

/*  Sample Data for new submission */
const salesforce_id = "0036100001gYL0HAAW";
const ip_address = "192.0.2.0";
const submission_date = new Date("05/02/2019");
const agency_number = "123456";
const birthdate = new Date("01/02/1999");
const cell_phone = "123-456-7890";
const employer_name = "employer_name";
const first_name = "firstname";
const last_name = "lastname";
const home_street = "home_street";
const home_city = "home_city";
const home_state = "OR";
const home_zip = "12345";
const home_email = "fake@email.com";
const preferred_language = "English";
const terms_agree = true;
const signature = "http://example.com/signature.png";
const text_auth_opt_out = false;
const online_campaign_source = "online_campaign_source";
const legal_language = "Lorem ipsum dolor sit amet.";
const maintenance_of_effort = submission_date;
const seiu503_cba_app_date = submission_date;
const direct_pay_auth = submission_date;
const direct_deposit_auth = submission_date;
const immediate_past_member_status = "Member";

const submissionBody = {
  ip_address,
  submission_date,
  agency_number,
  birthdate,
  cell_phone,
  employer_name,
  first_name,
  last_name,
  home_street,
  home_city,
  home_state,
  home_zip,
  home_email,
  preferred_language,
  terms_agree,
  signature,
  text_auth_opt_out,
  online_campaign_source,
  salesforce_id,
  legal_language,
  maintenance_of_effort,
  seiu503_cba_app_date,
  direct_pay_auth,
  direct_deposit_auth,
  immediate_past_member_status
};

/*  Sample Data for submission info updates */
const updatedFirstName = `updatedFirstName ${utils.randomText()}`;
const updatedEmployerName = `updatedEmployerName ${utils.randomText()}`;
const updatedTextAuthOptOut = true;

/*  Test user Data for secured routes */

const name = `firstname ${utils.randomText()}`;
const email = "fakeemail@test.com";
const avatar_url = "http://example.com/avatar.png";
const google_id = "1234";
const google_token = "5678";

/* ================================= TESTS ================================= */

let sf_contact_id, submission_id, createdAt, updatedAt;

chai.use(chaiHttp);
let authenticateMock;
let userStub;
suite.only("routes : submissions", function() {
  before(() => {
    return db.migrate.rollback().then(() => {
      return db.migrate.latest();
    });
  });

  after(() => {
    return db.migrate.rollback();
  });

  describe("POST /api/submission/", function() {
    // this route calls 3 chained controllers, 2 of which have to call SF and
    // wait for a response; hence the very long timeout
    this.timeout(10000);
    const app = require("../server");
    test("creates and returns new submission", function(done) {
      chai
        .request(app)
        .post("/api/submission/")
        .send(submissionBody)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isNull(err);
          done();
        });
    });
    test("returns an error if request body is missing required fields", function(done) {
      chai
        .request(app)
        .post("/api/submission/")
        .send({ fullname: "firstname lastname" })
        .end(function(err, res) {
          assert.equal(res.status, 422);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
  });

  describe("PUT /api/submission/:id", function() {
    const app = require("../server");
    this.timeout(10000);
    before(() => {
      return new Promise(resolve => {
        chai
          .request(app)
          .post("/api/submission/")
          .send(submissionBody)
          .end(function(err, res) {
            sf_contact_id = res.body.salesforce_id;
            submission_id = res.body.submission_id;
            resolve();
          });
      });
    });

    test("updates a submission", function(done) {
      const updates = {
        first_name: updatedFirstName,
        text_auth_opt_out: updatedTextAuthOptOut
      };
      chai
        .request(app)
        .put(`/api/submission/${submission_id}`)
        .send(updates)
        .end(function(err, res) {
          let result = res.body[0];
          assert.equal(res.status, 200);
          assert.isNull(err);
          assert.property(result, "id");
          assert.property(result, "created_at");
          assert.property(result, "updated_at");
          assert.property(result, "ip_address");
          assert.property(result, "submission_date");
          assert.property(result, "agency_number");
          assert.property(result, "birthdate");
          assert.property(result, "cell_phone");
          assert.property(result, "employer_name");
          assert.property(result, "first_name");
          assert.property(result, "last_name");
          assert.property(result, "home_street");
          assert.property(result, "home_city");
          assert.property(result, "home_state");
          assert.property(result, "home_zip");
          assert.property(result, "home_email");
          assert.property(result, "preferred_language");
          assert.property(result, "terms_agree");
          assert.property(result, "signature");
          assert.property(result, "text_auth_opt_out");
          assert.property(result, "online_campaign_source");
          assert.property(result, "salesforce_id");
          assert.property(result, "legal_language");
          assert.property(result, "maintenance_of_effort");
          assert.property(result, "seiu503_cba_app_date");
          assert.property(result, "direct_pay_auth");
          assert.property(result, "direct_deposit_auth");
          assert.property(result, "immediate_past_member_status");
          done();
        });
    });
    test("returns error if submission id missing or malformed", function(done) {
      const app = require("../server");
      const updates = {
        first_name: updatedFirstName,
        employer_name: updatedEmployerName,
        text_auth_opt_out: updatedTextAuthOptOut
      };
      chai
        .request(app)
        .put("/api/submission/123456789")
        .send({ updates })
        .end(function(err, res) {
          assert.equal(res.status, 500);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
    test("returns error if updates missing or malformed", function(done) {
      const app = require("../server");
      chai
        .request(app)
        .put(`/api/submission/${submission_id}`)
        .send({ name: undefined })
        .end(function(err, res) {
          assert.equal(res.status, 404);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
  });

  // suite("secured routes", function() {
  //   beforeEach(() => {
  //     authenticateMock = sinon.stub(passport, "authenticate").returns(() => {});
  //   });

  //   afterEach(() => {
  //     authenticateMock.restore();
  //   });

  //   suite("GET /api/submission/:id", function() {
  //     beforeEach(() => {
  //       const user = [{ name, email, avatar_url, google_token, google_id }];
  //       userStub = sinon.stub(users, "createUser").resolves(user);
  //       authenticateMock.yields(null, { id: 1 });
  //     });
  //     afterEach(() => {
  //       userStub.restore();
  //     });
  //     const app = require("../server");
  //     test("gets one submission by id", function(done) {
  //       chai
  //         .request(app)
  //         .get(`/api/submission/${id}`)
  //         .end(function(err, res) {
  //           console.log(res.body);
  //           assert.equal(res.status, 200);
  //           assert.isNull(err);
  //           assert.property(res.body, "ip_address");
  //           assert.property(res.body, "submission_date");
  //           assert.property(res.body, "agency_number");
  //           assert.property(res.body, "birthdate");
  //           assert.property(res.body, "cell_phone");
  //           assert.property(res.body, "employer_name");
  //           assert.property(res.body, "first_name");
  //           assert.property(res.body, "last_name");
  //           assert.property(res.body, "home_street");
  //           assert.property(res.body, "home_city");
  //           assert.property(res.body, "home_state");
  //           assert.property(res.body, "home_zip");
  //           assert.property(res.body, "home_email");
  //           assert.property(res.body, "preferred_language");
  //           assert.property(res.body, "terms_agree");
  //           assert.property(res.body, "signature");
  //           assert.property(res.body, "text_auth_opt_out");
  //           assert.property(res.body, "online_campaign_source");
  //           assert.property(res.body, "salesforce_id");
  //           assert.property(res.body, "legal_language");
  //           assert.property(res.body, "maintenance_of_effort");
  //           assert.property(res.body, "seiu503_cba_app_date");
  //           assert.property(res.body, "direct_pay_auth");
  //           assert.property(res.body, "direct_deposit_auth");
  //           assert.property(res.body, "immediate_past_member_status");
  //           done();
  //         });
  //     });
  //     test("returns error if submission id missing or malformed", function(done) {
  //       chai
  //         .request(app)
  //         .get("/api/submission/123456789")
  //         .end(function(err, res) {
  //           assert.equal(res.status, 404);
  //           assert.equal(res.type, "application/json");
  //           assert.isNotNull(res.body.message);
  //           done();
  //         });
  //     });
  //   });

  //   suite("GET /api/submission", function() {
  //     beforeEach(() => {
  //       const user = [{ name, email, avatar_url, google_token, google_id }];
  //       userStub = sinon.stub(users, "createUser").resolves(user);
  //       authenticateMock.yields(null, { id: 1 });
  //     });
  //     afterEach(() => {
  //       userStub.restore();
  //     });
  //     const app = require("../server");
  //     test("gets all submissions", function(done) {
  //       chai
  //         .request(app)
  //         .get("/api/submission/")
  //         .end(function(err, res) {
  //           assert.equal(res.status, 200);
  //           assert.isNull(err);
  //           const arrayOfKeys = key => res.body.map(obj => obj[key]);
  //           assert.equal(Array.isArray(res.body), true);
  //           assert.include(arrayOfKeys("ip_address"), ip_address);
  //           assert.include(
  //             arrayOfKeys("submission_date").toString(),
  //             new Date(submission_date).toISOString()
  //           );
  //           assert.include(arrayOfKeys("agency_number"), agency_number);
  //           assert.include(
  //             arrayOfKeys("birthdate").toString(),
  //             new Date(birthdate).toISOString()
  //           );
  //           assert.include(arrayOfKeys("cell_phone"), cell_phone);
  //           assert.include(arrayOfKeys("employer_name"), employer_name);
  //           assert.include(arrayOfKeys("first_name"), updatedFirstName);
  //           assert.include(arrayOfKeys("last_name"), last_name);
  //           assert.include(arrayOfKeys("home_street"), home_street);
  //           assert.include(arrayOfKeys("home_city"), home_city);
  //           assert.include(arrayOfKeys("home_state"), home_state);
  //           assert.include(arrayOfKeys("home_zip"), home_zip);
  //           assert.include(arrayOfKeys("home_email"), home_email);
  //           assert.include(
  //             arrayOfKeys("preferred_language"),
  //             preferred_language
  //           );
  //           assert.include(arrayOfKeys("terms_agree"), terms_agree);
  //           assert.include(arrayOfKeys("signature"), signature);
  //           assert.include(
  //             arrayOfKeys("text_auth_opt_out"),
  //             updatedTextAuthOptOut
  //           );
  //           assert.include(
  //             arrayOfKeys("online_campaign_source"),
  //             online_campaign_source
  //           );
  //           assert.include(arrayOfKeys("salesforce_id"), salesforce_id);
  //           assert.include(arrayOfKeys("legal_language"), legal_language);
  //           assert.include(
  //             arrayOfKeys("maintenance_of_effort").toString(),
  //             new Date(maintenance_of_effort).toISOString()
  //           );
  //           assert.include(
  //             arrayOfKeys("seiu503_cba_app_date").toString(),
  //             new Date(seiu503_cba_app_date).toISOString()
  //           );
  //           assert.include(
  //             arrayOfKeys("direct_pay_auth").toString(),
  //             new Date(direct_pay_auth).toISOString()
  //           );
  //           assert.include(
  //             arrayOfKeys("direct_deposit_auth").toString(),
  //             new Date(direct_deposit_auth).toISOString()
  //           );
  //           assert.include(
  //             arrayOfKeys("immediate_past_member_status"),
  //             immediate_past_member_status
  //           );
  //           done();
  //         });
  //     });

  //     test("returns error if submission id missing or malformed", function(done) {
  //       chai
  //         .request(app)
  //         .get("/api/submission/123456789")
  //         .end(function(err, res) {
  //           assert.equal(res.status, 404);
  //           assert.equal(res.type, "application/json");
  //           assert.isNotNull(res.body.message);
  //           done();
  //         });
  //     });
  //   });

  //   suite("DELETE", function() {
  //     beforeEach(() => {
  //       const user = [{ name, email, avatar_url, google_token, google_id }];
  //       userStub = sinon.stub(users, "createUser").resolves(user);
  //       authenticateMock.yields(null, { id: 1 });
  //     });
  //     afterEach(() => {
  //       userStub.restore();
  //     });
  //     test("delete a submission", function(done) {
  //       const app = require("../server");
  //       chai
  //         .request(app)
  //         .delete(`/api/submission/${id}`)
  //         .end(function(err, res) {
  //           assert.equal(res.body.message, "Submission deleted successfully");
  //           assert.isNull(err);
  //           done();
  //         });
  //     });
  //     test("returns error if submission id missing or malformed", function(done) {
  //       const app = require("../server");
  //       chai
  //         .request(app)
  //         .delete("/api/submission/123456789")
  //         .end(function(err, res) {
  //           assert.equal(res.status, 404);
  //           assert.equal(res.type, "application/json");
  //           assert.isNotNull(res.body.message);
  //           done();
  //         });
  //     });
  //   });
  // });
});

module.exports = {
  submissionBody
};
