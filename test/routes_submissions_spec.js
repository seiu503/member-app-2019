// test/routes_submissions_spec.js
/* globals describe afterEach it beforeEach */

/* ================================= SETUP ================================= */

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
const contacts = require("../db/models/contacts");
const submissions = require("../db/models/submissions");
const moment = require("moment");

/*  Sample Data for new contact */
let contact_id;
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
const home_email = "fakeemail";
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
const immediate_past_member_status = "In Good Standing";

/*  Sample Data for contact info updates */
const updatedFirstName = `updatedFirstName ${utils.randomText()}`;
const updatedEmployerName = `updatedEmployerName ${utils.randomText()}`;
const updatedTextAuthOptOut = true;

/* Sample Contact Data */
const sampleContact = {
  display_name: "testuser",
  account_name: "testuser",
  agency_number: "123456",
  mail_to_city: "mailToCity",
  mail_to_state: "OR",
  mail_to_street: "Multnomah Blvd",
  mail_to_postal_code: "97221",
  first_name: "firstname",
  last_name: "lastname",
  dd: "01",
  mm: "01",
  yyyy: "2001",
  dob: new Date("01/01/2001"),
  preferred_language: "English",
  home_street: "homestreet",
  home_postal_code: "12345",
  home_state: "OR",
  home_city: "Portland",
  home_email: "fakeemail@test.com",
  mobile_phone: "123-546-7890",
  text_auth_opt_out: false,
  terms_agree: true,
  signature: "http://example.com/avatar.png",
  online_campaign_source: "email",
  signed_application: true,
  ethnicity: "other",
  lgbtq_id: false,
  trans_id: false,
  disability_id: false,
  deaf_or_hard_of_hearing: false,
  blind_or_visually_impaired: false,
  gender: "female",
  gender_other_description: "",
  gender_pronoun: "She/Her",
  job_title: "jobtitle",
  hire_date: new Date("01/08/2003"),
  worksite: "worksite",
  work_email: "lastnamef@seiu.com"
};

/*  Test user Data for secured routes */

const name = `firstname ${utils.randomText()}`;
const email = "fakeemail@test.com";
const avatar_url = "http://example.com/avatar.png";
const google_id = "1234";
const google_token = "5678";

/* ================================= TESTS ================================= */

let id;
let submissionId, createdAt, updatedAt;

chai.use(chaiHttp);
let authenticateMock;
let userStub, contactStub, submissionStub;

suite("routes : submissions", function() {
  before(() => {
    return db.migrate.rollback().then(() => {
      return db.migrate.latest();
    });
  });

  after(() => {
    return db.migrate.rollback();
  });

  suite("POST /api/submission/", function() {
    const app = require("../server");
    test("need contactId for submissions tests", function(done) {
      chai
        .request(app)
        .post("/api/contact/")
        .send({
          display_name: sampleContact.display_name,
          account_name: sampleContact.account_name,
          agency_number: sampleContact.agency_number,
          mail_to_city: sampleContact.mail_to_city,
          mail_to_state: sampleContact.mail_to_state,
          mail_to_street: sampleContact.mail_to_street,
          mail_to_postal_code: sampleContact.mail_to_postal_code,
          first_name: sampleContact.first_name,
          last_name: sampleContact.last_name,
          dd: sampleContact.dd,
          mm: sampleContact.mm,
          yyyy: sampleContact.yyyy,
          dob: sampleContact.dob,
          preferred_language: sampleContact.preferred_language,
          home_street: sampleContact.home_street,
          home_postal_code: sampleContact.home_postal_code,
          home_state: sampleContact.home_state,
          home_city: sampleContact.home_city,
          home_email: sampleContact.home_email,
          mobile_phone: sampleContact.mobile_phone,
          text_auth_opt_out: sampleContact.text_auth_opt_out,
          terms_agree: sampleContact.terms_agree,
          signature: sampleContact.signature,
          online_campaign_source: sampleContact.online_campaign_source,
          signed_application: sampleContact.signed_application,
          ethnicity: sampleContact.ethnicity,
          lgbtq_id: sampleContact.lgbtq_id,
          trans_id: sampleContact.trans_id,
          disability_id: sampleContact.disability_id,
          deaf_or_hard_of_hearing: sampleContact.deaf_or_hard_of_hearing,
          blind_or_visually_impaired: sampleContact.blind_or_visually_impaired,
          gender: sampleContact.gender,
          gender_other_description: sampleContact.gender_other_description,
          gender_pronoun: sampleContact.gender_pronoun,
          job_title: sampleContact.job_title,
          hire_date: sampleContact.hire_date,
          worksite: sampleContact.worksite,
          work_emai: sampleContact.work_email
        })
        .end(function(err, res) {
          contact_id = res.body.contact_id;
          done();
        });
    });
    test("creates and returns new submission", function(done) {
      chai
        .request(app)
        .post("/api/submission/")
        .send({
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
          contact_id,
          legal_language,
          maintenance_of_effort,
          seiu503_cba_app_date,
          direct_pay_auth,
          direct_deposit_auth,
          immediate_past_member_status
        })
        .end(function(err, res) {
          submissionId = res.body.submission_id;
          createdAt = res.body.created_at;
          updatedAt = res.body.updated_at;
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

  suite("secured routes", function() {
    beforeEach(() => {
      authenticateMock = sinon.stub(passport, "authenticate").returns(() => {});
    });

    afterEach(() => {
      authenticateMock.restore();
    });

    suite("GET /api/submission/:id", function() {
      beforeEach(() => {
        const user = [{ name, email, avatar_url, google_token, google_id }];
        userStub = sinon.stub(users, "createUser").resolves(user);
        authenticateMock.yields(null, { id: 1 });
      });
      afterEach(() => {
        userStub.restore();
      });
      const app = require("../server");
      test("gets one submission by id", function(done) {
        chai
          .request(app)
          .get(`/api/submission/${submissionId}`)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isNull(err);
            assert.property(res.body, "ip_address");
            assert.property(res.body, "submission_date");
            assert.property(res.body, "agency_number");
            assert.property(res.body, "birthdate");
            assert.property(res.body, "cell_phone");
            assert.property(res.body, "employer_name");
            assert.property(res.body, "first_name");
            assert.property(res.body, "last_name");
            assert.property(res.body, "home_street");
            assert.property(res.body, "home_city");
            assert.property(res.body, "home_state");
            assert.property(res.body, "home_zip");
            assert.property(res.body, "home_email");
            assert.property(res.body, "preferred_language");
            assert.property(res.body, "terms_agree");
            assert.property(res.body, "signature");
            assert.property(res.body, "text_auth_opt_out");
            assert.property(res.body, "online_campaign_source");
            assert.property(res.body, "contact_id");
            assert.property(res.body, "legal_language");
            assert.property(res.body, "maintenance_of_effort");
            assert.property(res.body, "seiu503_cba_app_date");
            assert.property(res.body, "direct_pay_auth");
            assert.property(res.body, "direct_deposit_auth");
            assert.property(res.body, "immediate_past_member_status");
            done();
          });
      });
      test("returns error if submission id missing or malformed", function(done) {
        chai
          .request(app)
          .get("/api/submission/123456789")
          .end(function(err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.type, "application/json");
            assert.isNotNull(res.body.message);
            done();
          });
      });
    });

    suite("GET /api/submission", function() {
      beforeEach(() => {
        const user = [{ name, email, avatar_url, google_token, google_id }];
        userStub = sinon.stub(users, "createUser").resolves(user);
        authenticateMock.yields(null, { id: 1 });
      });
      afterEach(() => {
        userStub.restore();
      });
      const app = require("../server");
      test("gets all submissions", function(done) {
        chai
          .request(app)
          .get("/api/submission/")
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isNull(err);
            const arrayOfKeys = key => res.body.map(obj => obj[key]);
            assert.equal(Array.isArray(res.body), true);
            assert.include(arrayOfKeys("ip_address"), ip_address);
            assert.include(
              arrayOfKeys("submission_date").toString(),
              new Date(submission_date).toISOString()
            );
            assert.include(arrayOfKeys("agency_number"), agency_number);
            assert.include(
              arrayOfKeys("birthdate").toString(),
              new Date(birthdate).toISOString()
            );
            assert.include(arrayOfKeys("cell_phone"), cell_phone);
            assert.include(arrayOfKeys("employer_name"), employer_name);
            assert.include(arrayOfKeys("first_name"), first_name);
            assert.include(arrayOfKeys("last_name"), last_name);
            assert.include(arrayOfKeys("home_street"), home_street);
            assert.include(arrayOfKeys("home_city"), home_city);
            assert.include(arrayOfKeys("home_state"), home_state);
            assert.include(arrayOfKeys("home_zip"), home_zip);
            assert.include(arrayOfKeys("home_email"), home_email);
            assert.include(
              arrayOfKeys("preferred_language"),
              preferred_language
            );
            assert.include(arrayOfKeys("terms_agree"), terms_agree);
            assert.include(arrayOfKeys("signature"), signature);
            assert.include(arrayOfKeys("text_auth_opt_out"), text_auth_opt_out);
            assert.include(
              arrayOfKeys("online_campaign_source"),
              online_campaign_source
            );
            assert.include(arrayOfKeys("contact_id"), contact_id);
            assert.include(arrayOfKeys("legal_language"), legal_language);
            assert.include(
              arrayOfKeys("maintenance_of_effort").toString(),
              new Date(maintenance_of_effort).toISOString()
            );
            assert.include(
              arrayOfKeys("seiu503_cba_app_date").toString(),
              new Date(seiu503_cba_app_date).toISOString()
            );
            assert.include(
              arrayOfKeys("direct_pay_auth").toString(),
              new Date(direct_pay_auth).toISOString()
            );
            assert.include(
              arrayOfKeys("direct_deposit_auth").toString(),
              new Date(direct_deposit_auth).toISOString()
            );
            assert.include(
              arrayOfKeys("immediate_past_member_status"),
              immediate_past_member_status
            );
            done();
          });
      });

      test("returns error if submission id missing or malformed", function(done) {
        chai
          .request(app)
          .get("/api/submission/123456789")
          .end(function(err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.type, "application/json");
            assert.isNotNull(res.body.message);
            done();
          });
      });
    });

    suite("PUT /api/submission/:id", function() {
      beforeEach(() => {
        const user = [{ name, email, avatar_url, google_token, google_id }];
        userStub = sinon.stub(users, "createUser").resolves(user);
        authenticateMock.yields(null, { id: 1 });
      });
      afterEach(() => {
        userStub.restore();
      });

      test("updates a submission", function(done) {
        const app = require("../server");
        const updates = {
          first_name: updatedFirstName,
          employer_name: updatedEmployerName,
          text_auth_opt_out: updatedTextAuthOptOut
        };
        chai
          .request(app)
          .put(`/api/submission/${submissionId}`)
          .send({ updates })
          .end(function(err, res) {
            let result = res.body[0];
            assert.equal(res.status, 200);
            assert.isNull(err);
            assert.property(result, "submission_id");
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
            assert.property(result, "contact_id");
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
          .put(`/api/submission/${submissionId}`)
          .send({ name: undefined })
          .end(function(err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.type, "application/json");
            assert.isNotNull(res.body.message);
            done();
          });
      });
    });

    suite("DELETE", function() {
      beforeEach(() => {
        const user = [{ name, email, avatar_url, google_token, google_id }];
        userStub = sinon.stub(users, "createUser").resolves(user);
        authenticateMock.yields(null, { id: 1 });
      });
      afterEach(() => {
        userStub.restore();
      });
      test("delete a submission", function(done) {
        const app = require("../server");
        chai
          .request(app)
          .delete(`/api/submission/${submissionId}`)
          .end(function(err, res) {
            assert.equal(res.body.message, "Submission deleted successfully");
            assert.isNull(err);
            done();
          });
      });
      test("returns error if submission id missing or malformed", function(done) {
        const app = require("../server");
        chai
          .request(app)
          .delete("/api/submission/123456789")
          .end(function(err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.type, "application/json");
            assert.isNotNull(res.body.message);
            done();
          });
      });
    });
  });
});
