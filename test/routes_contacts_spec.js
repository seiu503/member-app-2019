// test/routes_contacts_spec.js
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
const moment = require("moment");

/*  Sample Data for new contact */
const display_name = "testuser";
const account_name = "testuser";
const agency_number = "123456";
const mail_to_city = "mailToCity";
const mail_to_state = "OR";
const mail_to_street = "Multnomah Blvd";
const mail_to_postal_code = "97221";
const first_name = "firstname";
const last_name = "lastname";
const dd = "01";
const mm = "01";
const yyyy = "2001";
const dob = new Date("01/01/2001");
const preferred_language = "English";
const home_street = "homestreet";
const home_postal_code = "12345";
const home_state = "OR";
const home_city = "Portland";
const home_email = "fakeemail@test.com";
const mobile_phone = "123-546-7890";
const text_auth_opt_out = false;
const terms_agree = true;
const signature = "http://example.com/avatar.png";
const online_campaign_source = "email";
const signed_application = true;
const ethnicity = "other";
const lgbtq_id = false;
const trans_id = false;
const disability_id = false;
const deaf_or_hard_of_hearing = false;
const blind_or_visually_impaired = false;
const gender = "female";
const gender_other_description = "";
const gender_pronoun = "She/Her";
const job_title = "jobtitle";
const hire_date = new Date("01/08/2003");
const worksite = "worksite";
const work_email = "lastnamef@seiu.com";

/*  Sample Data for contact info updates */
const updatedFirstName = `updatedFirstName ${utils.randomText()}`;
const updatedJobTitle = "updatedJobTitle";
const updatedTextAuthOptOut = true;
const updatedGender = "other";
const updatedGenderOtherDescription = "dragon";

/*  Test user Data for secured routes */

const name = `firstname ${utils.randomText()}`;
const email = "fakeemail@test.com";
const avatar_url = "http://example.com/avatar.png";
const google_id = "1234";
const google_token = "5678";

/* ================================= TESTS ================================= */

let id;
let contactId, createdAt, updatedAt;

chai.use(chaiHttp);
let authenticateMock;
let userStub;
let contactStub;

suite("routes : contacts", function() {
  before(() => {
    return db.migrate.rollback().then(() => {
      return db.migrate.latest();
    });
  });

  after(() => {
    return db.migrate.rollback();
  });
  suite("POST /api/contact/", function() {
    const app = require("../server");
    test("creates and returns new contact", function(done) {
      chai
        .request(app)
        .post("/api/contact/")
        .send({
          display_name,
          account_name,
          agency_number,
          mail_to_city,
          mail_to_state,
          mail_to_street,
          mail_to_postal_code,
          first_name,
          last_name,
          dd,
          mm,
          yyyy,
          dob,
          preferred_language,
          home_street,
          home_postal_code,
          home_state,
          home_city,
          home_email,
          mobile_phone,
          text_auth_opt_out,
          terms_agree,
          signature,
          online_campaign_source,
          signed_application,
          ethnicity,
          lgbtq_id,
          trans_id,
          disability_id,
          deaf_or_hard_of_hearing,
          blind_or_visually_impaired,
          gender,
          gender_other_description,
          gender_pronoun,
          job_title,
          hire_date,
          worksite,
          work_email
        })
        .end(function(err, res) {
          contactId = res.body.contact_id;
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
        .post("/api/contact/")
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

    suite("GET /api/contact/:id", function() {
      beforeEach(() => {
        const user = [{ name, email, avatar_url, google_token, google_id }];
        userStub = sinon.stub(users, "createUser").resolves(user);
        authenticateMock.yields(null, { id: 1 });
      });
      afterEach(() => {
        userStub.restore();
      });
      const app = require("../server");
      test("gets one contact by id", function(done) {
        chai
          .request(app)
          .get(`/api/contact/${contactId}`)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isNull(err);
            assert.property(res.body, "contact_id");
            assert.property(res.body, "created_at");
            assert.property(res.body, "updated_at");
            // assert.property(res.body, "display_name");
            assert.property(res.body, "account_name");
            assert.property(res.body, "agency_number");
            // assert.property(res.body, "mail_to_city");
            // assert.property(res.body, "mail_to_state");
            // assert.property(res.body, "mail_to_street");
            // assert.property(res.body, "mail_to_postal_code");
            assert.property(res.body, "first_name");
            assert.property(res.body, "last_name");
            assert.property(res.body, "dd");
            assert.property(res.body, "mm");
            assert.property(res.body, "yyyy");
            assert.property(res.body, "dob");
            assert.property(res.body, "preferred_language");
            assert.property(res.body, "home_street");
            assert.property(res.body, "home_postal_code");
            assert.property(res.body, "home_state");
            assert.property(res.body, "home_city");
            assert.property(res.body, "home_email");
            assert.property(res.body, "mobile_phone");
            assert.property(res.body, "text_auth_opt_out");
            assert.property(res.body, "terms_agree");
            assert.property(res.body, "signature");
            // assert.property(res.body, "online_campaign_source");
            // assert.property(res.body, "signed_application");
            // assert.property(res.body, "ethnicity");
            // assert.property(res.body, "lgbtq_id");
            // assert.property(res.body, "trans_id");
            // assert.property(res.body, "disability_id");
            // assert.property(res.body, "deaf_or_hard_of_hearing");
            // assert.property(res.body, "blind_or_visually_impaired");
            // assert.property(res.body, "gender");
            // assert.property(res.body, "gender_other_description");
            // assert.property(res.body, "gender_pronoun");
            // assert.property(res.body, "job_title");
            // assert.property(res.body, "hire_date");
            // assert.property(res.body, "worksite");
            // assert.property(res.body, "work_email");
            done();
          });
      });

      test("returns error if contact id missing or malformed", function(done) {
        chai
          .request(app)
          .get("/api/contact/123456789")
          .end(function(err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.type, "application/json");
            assert.isNotNull(res.body.message);
            done();
          });
      });
    });

    suite("GET /api/contact", function() {
      beforeEach(() => {
        const user = [{ name, email, avatar_url, google_token, google_id }];
        userStub = sinon.stub(users, "createUser").resolves(user);
        authenticateMock.yields(null, { id: 1 });
      });
      afterEach(() => {
        userStub.restore();
      });
      const app = require("../server");
      test("gets all contacts", function(done) {
        chai
          .request(app)
          .get("/api/contact/")
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isNull(err);
            const arrayOfKeys = key => res.body.map(obj => obj[key]);
            assert.equal(Array.isArray(res.body), true);
            assert.include(arrayOfKeys("contact_id"), contactId);
            assert.include(arrayOfKeys("created_at"), createdAt);
            assert.include(arrayOfKeys("updated_at"), updatedAt);
            // assert.include(arrayOfKeys("display_name"), display_name);
            assert.include(arrayOfKeys("account_name"), account_name);
            assert.include(arrayOfKeys("agency_number"), agency_number);
            // assert.include(arrayOfKeys("mail_to_city"), mail_to_city);
            // assert.include(arrayOfKeys("mail_to_state"), mail_to_state);
            // assert.include(arrayOfKeys("mail_to_street"), mail_to_street);
            // assert.include(
            //   arrayOfKeys("mail_to_postal_code"),
            //   mail_to_postal_code
            // );
            assert.include(arrayOfKeys("first_name"), first_name);
            assert.include(arrayOfKeys("last_name"), last_name);
            assert.include(arrayOfKeys("dd"), dd);
            assert.include(arrayOfKeys("mm"), mm);
            assert.include(arrayOfKeys("yyyy"), yyyy);
            assert.include(
              arrayOfKeys("dob").toString(),
              new Date(dob).toISOString()
            );
            assert.include(
              arrayOfKeys("preferred_language"),
              preferred_language
            );
            assert.include(arrayOfKeys("home_street"), home_street);
            assert.include(arrayOfKeys("home_postal_code"), home_postal_code);
            assert.include(arrayOfKeys("home_state"), home_state);
            assert.include(arrayOfKeys("home_city"), home_city);
            assert.include(arrayOfKeys("home_email"), home_email);
            assert.include(arrayOfKeys("mobile_phone"), mobile_phone);
            assert.include(arrayOfKeys("text_auth_opt_out"), text_auth_opt_out);
            assert.include(arrayOfKeys("terms_agree"), terms_agree);
            assert.include(arrayOfKeys("signature"), signature);
            // assert.include(
            //   arrayOfKeys("online_campaign_source"),
            //   online_campaign_source
            // );
            // assert.include(
            //   arrayOfKeys("signed_application"),
            //   signed_application
            // );
            // assert.include(arrayOfKeys("ethnicity"), ethnicity);
            // assert.include(arrayOfKeys("lgbtq_id"), lgbtq_id);
            // assert.include(arrayOfKeys("trans_id"), trans_id);
            // assert.include(arrayOfKeys("disability_id"), disability_id);
            // assert.include(
            //   arrayOfKeys("deaf_or_hard_of_hearing"),
            //   deaf_or_hard_of_hearing
            // );
            // assert.include(
            //   arrayOfKeys("blind_or_visually_impaired"),
            //   blind_or_visually_impaired
            // );
            // assert.include(arrayOfKeys("gender"), gender);
            // assert.include(
            //   arrayOfKeys("gender_other_description"),
            //   gender_other_description
            // );
            // assert.include(arrayOfKeys("gender_pronoun"), gender_pronoun);
            // assert.include(arrayOfKeys("job_title"), job_title);
            // assert.include(
            //   arrayOfKeys("hire_date").toString(),
            //   new Date(hire_date).toISOString()
            // );
            // assert.include(arrayOfKeys("worksite"), worksite);
            // assert.include(arrayOfKeys("work_email"), work_email);
            done();
          });
      });

      test("returns error if contact id missing or malformed", function(done) {
        chai
          .request(app)
          .get("/api/contact/123456789")
          .end(function(err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.type, "application/json");
            assert.isNotNull(res.body.message);
            done();
          });
      });
    });

    suite("PUT /api/contact/:id", function() {
      beforeEach(() => {
        const user = [{ name, email, avatar_url, google_token, google_id }];
        userStub = sinon.stub(users, "createUser").resolves(user);
        authenticateMock.yields(null, { id: 1 });
      });
      afterEach(() => {
        userStub.restore();
      });

      test("updates a contact", function(done) {
        const app = require("../server");
        const updates = {
          first_name: updatedFirstName,
          job_title: updatedJobTitle,
          text_auth_opt_out: updatedTextAuthOptOut,
          gender: updatedGender,
          gender_other_description: updatedGenderOtherDescription
        };
        chai
          .request(app)
          .put(`/api/contact/${contactId}`)
          .send({ updates })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isNull(err);
            assert.property(res.body, "contact_id");
            assert.property(res.body, "created_at");
            assert.property(res.body, "updated_at");
            // assert.property(res.body, "display_name");
            assert.property(res.body, "account_name");
            assert.property(res.body, "agency_number");
            // assert.property(res.body, "mail_to_city");
            // assert.property(res.body, "mail_to_state");
            // assert.property(res.body, "mail_to_street");
            // assert.property(res.body, "mail_to_postal_code");
            assert.property(res.body, "first_name");
            assert.property(res.body, "last_name");
            assert.property(res.body, "dd");
            assert.property(res.body, "mm");
            assert.property(res.body, "yyyy");
            assert.property(res.body, "dob");
            assert.property(res.body, "preferred_language");
            assert.property(res.body, "home_street");
            assert.property(res.body, "home_postal_code");
            assert.property(res.body, "home_state");
            assert.property(res.body, "home_city");
            assert.property(res.body, "home_email");
            assert.property(res.body, "mobile_phone");
            assert.property(res.body, "text_auth_opt_out");
            assert.property(res.body, "terms_agree");
            assert.property(res.body, "signature");
            // assert.property(res.body, "online_campaign_source");
            // assert.property(res.body, "signed_application");
            // assert.property(res.body, "ethnicity");
            // assert.property(res.body, "lgbtq_id");
            // assert.property(res.body, "trans_id");
            // assert.property(res.body, "disability_id");
            // assert.property(res.body, "deaf_or_hard_of_hearing");
            // assert.property(res.body, "blind_or_visually_impaired");
            // assert.property(res.body, "gender");
            // assert.property(res.body, "gender_other_description");
            // assert.property(res.body, "gender_pronoun");
            // assert.property(res.body, "job_title");
            // assert.property(res.body, "hire_date");
            // assert.property(res.body, "worksite");
            // assert.property(res.body, "work_email");
            done();
          });
      });
      test("returns error if contact id missing or malformed", function(done) {
        const app = require("../server");
        const updates = {
          first_name: updatedFirstName,
          job_title: updatedJobTitle,
          text_auth_opt_out: updatedTextAuthOptOut,
          gender: updatedGender,
          gender_other_description: updatedGenderOtherDescription
        };
        chai
          .request(app)
          .put("/api/contact/123456789")
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
          .put(`/api/contact/${contactId}`)
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
      test("delete a contact", function(done) {
        const app = require("../server");
        chai
          .request(app)
          .delete(`/api/contact/${contactId}`)
          .end(function(err, res) {
            assert.equal(res.body.message, "Contact deleted successfully");
            assert.isNull(err);
            done();
          });
      });
      test("returns error if contact id missing or malformed", function(done) {
        const app = require("../server");
        chai
          .request(app)
          .delete("/api/contact/123456789")
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
