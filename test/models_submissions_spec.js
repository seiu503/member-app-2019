// test/models_users_spec.js
/* globals describe afterEach it beforeEach */

/* ================================= SETUP ================================= */

process.env.NODE_ENV = "testing";

const { assert } = require("chai");
const moment = require("moment");
const sinon = require("sinon");
const passport = require("passport");
const { db, TABLES } = require("../app/config/knex");
const submissions = require("../db/models/submissions");
const contacts = require("../db/models/contacts");
const users = require("../db/models/users");
const utils = require("../app/utils");

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
let submissionId;

describe("submissions model tests", () => {
  before(() => {
    return db.migrate.rollback().then(() => {
      return db.migrate.latest();
    });
  });

  after(() => {
    return db.migrate.rollback();
  });

  const seedContact = () => {
    return contacts
      .createContact(
        sampleContact.display_name,
        sampleContact.account_name,
        sampleContact.agency_number,
        sampleContact.mail_to_city,
        sampleContact.mail_to_state,
        sampleContact.mail_to_street,
        sampleContact.mail_to_postal_code,
        sampleContact.first_name,
        sampleContact.last_name,
        sampleContact.dd,
        sampleContact.mm,
        sampleContact.yyyy,
        sampleContact.dob,
        sampleContact.preferred_language,
        sampleContact.home_street,
        sampleContact.home_postal_code,
        sampleContact.home_state,
        sampleContact.home_city,
        sampleContact.home_email,
        sampleContact.mobile_phone,
        sampleContact.text_auth_opt_out,
        sampleContact.terms_agree,
        sampleContact.signature,
        sampleContact.online_campaign_source,
        sampleContact.signed_application,
        sampleContact.ethnicity,
        sampleContact.lgbtq_id,
        sampleContact.trans_id,
        sampleContact.disability_id,
        sampleContact.deaf_or_hard_of_hearing,
        sampleContact.blind_or_visually_impaired,
        sampleContact.gender,
        sampleContact.gender_other_description,
        sampleContact.gender_pronoun,
        sampleContact.job_title,
        sampleContact.hire_date,
        sampleContact.worksite,
        sampleContact.work_email
      )
      .then(contact => {
        console.log("SAMPLE CONTACT ID", contact[0].contact_id);
        contact_id = contact[0].contact_id;
      });
  };

  it("POST creates a new submission", () => {
    return seedContact().then(() => {
      return submissions
        .createSubmission(
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
        )
        .then(result => {
          assert.deepEqual(result[0].ip_address, ip_address);
          assert.deepEqual(
            moment(result[0].submission_date),
            moment(submission_date)
          );
          assert.deepEqual(result[0].agency_number, agency_number);
          assert.deepEqual(
            moment(result[0].birthdate).format(),
            moment(birthdate).format()
          );
          assert.deepEqual(result[0].cell_phone, cell_phone);
          assert.deepEqual(result[0].employer_name, employer_name);
          assert.deepEqual(result[0].first_name, first_name);
          assert.deepEqual(result[0].last_name, last_name);
          assert.deepEqual(result[0].home_street, home_street);
          assert.deepEqual(result[0].home_city, home_city);
          assert.deepEqual(result[0].home_state, home_state);
          assert.deepEqual(result[0].home_zip, home_zip);
          assert.deepEqual(result[0].home_email, home_email);
          assert.deepEqual(result[0].preferred_language, preferred_language);
          assert.deepEqual(result[0].terms_agree, terms_agree);
          assert.deepEqual(result[0].signature, signature);
          assert.deepEqual(result[0].text_auth_opt_out, text_auth_opt_out);
          assert.deepEqual(
            result[0].online_campaign_source,
            online_campaign_source
          );
          assert.deepEqual(result[0].contact_id, contact_id);
          assert.deepEqual(result[0].legal_language, legal_language);
          assert.deepEqual(
            moment(result[0].maintenance_of_effort),
            moment(maintenance_of_effort)
          );
          assert.deepEqual(
            moment(result[0].seiu503_cba_app_date),
            moment(seiu503_cba_app_date)
          );
          assert.deepEqual(
            moment(result[0].direct_pay_auth),
            moment(direct_pay_auth)
          );
          assert.deepEqual(
            moment(result[0].direct_deposit_auth),
            moment(direct_deposit_auth)
          );
          assert.deepEqual(
            result[0].immediate_past_member_status,
            immediate_past_member_status
          );
          submissionId = result[0].submission_id;
          return db.select("*").from(TABLES.SUBMISSIONS);
        })
        .then(([result]) => {
          assert.equal(result.ip_address, ip_address);
          assert.equal(
            moment(result.submission_date).format(),
            moment(submission_date).format()
          );
          assert.equal(result.agency_number, agency_number);
          assert.equal(
            moment(result.birthdate).format(),
            moment(birthdate).format()
          );
          assert.equal(result.cell_phone, cell_phone);
          assert.equal(result.employer_name, employer_name);
          assert.equal(result.first_name, first_name);
          assert.equal(result.last_name, last_name);
          assert.equal(result.home_street, home_street);
          assert.equal(result.home_city, home_city);
          assert.equal(result.home_state, home_state);
          assert.equal(result.home_zip, home_zip);
          assert.equal(result.home_email, home_email);
          assert.equal(result.preferred_language, preferred_language);
          assert.equal(result.terms_agree, terms_agree);
          assert.equal(result.signature, signature);
          assert.equal(result.text_auth_opt_out, text_auth_opt_out);
          assert.equal(result.online_campaign_source, online_campaign_source);
          assert.equal(result.contact_id, contact_id);
          assert.equal(result.legal_language, legal_language);
          assert.equal(
            moment(result.maintenance_of_effort).format(),
            moment(maintenance_of_effort).format()
          );
          assert.equal(
            moment(result.seiu503_cba_app_date).format(),
            moment(seiu503_cba_app_date).format()
          );
          assert.equal(
            moment(result.direct_pay_auth).format(),
            moment(direct_pay_auth).format()
          );
          assert.equal(
            moment(result.direct_deposit_auth).format(),
            moment(direct_deposit_auth).format()
          );
          assert.equal(
            result.immediate_past_member_status,
            immediate_past_member_status
          );
        });
    });
  });

  describe("secured routes", () => {
    let userId;

    // seed with a user before each test
    beforeEach(() => {
      return users
        .createUser(name, email, avatar_url, google_id, google_token)
        .then(user => {
          userId = user[0].id;
        });
      // .then(() => {
      //   // stub passport authentication to test secured routes
      //   sinon
      //     .stub(passport, 'authenticate')
      //     .callsFake(function (test, args) {
      //       console.log('Auth stub');
      //     });
      //   console.log('stub registered');
      //   passport.authenticate('jwt', { session: false });
      // });
    });

    // afterEach(() => {
    //   passport.authenticate.restore();
    // });

    it("PUT updates a submission", () => {
      const updates = {
        first_name: updatedFirstName,
        employer_name: updatedEmployerName,
        text_auth_opt_out: updatedTextAuthOptOut
      };
      return submissions
        .updateSubmission(submissionId, updates)
        .then(results => {
          assert.equal(results[0].first_name, updatedFirstName);
          assert.equal(results[0].employer_name, updatedEmployerName);
          assert.equal(results[0].text_auth_opt_out, updatedTextAuthOptOut);
          assert.isAbove(results[0].updated_at, results[0].created_at);
        });
    });

    it("GET gets all submissions", () => {
      return submissions.getSubmissions().then(results => {
        const arrayOfKeys = key => results.map(obj => obj[key]);
        assert.equal(Array.isArray(results), true);
        assert.include(arrayOfKeys("submission_id"), submissionId);
        assert.include(arrayOfKeys("ip_address"), ip_address);
        assert.include(
          arrayOfKeys("submission_date").toString(),
          submission_date
        );
        assert.include(arrayOfKeys("birthdate").toString(), birthdate);
        assert.include(arrayOfKeys("cell_phone"), cell_phone);
        assert.include(arrayOfKeys("employer_name"), updatedEmployerName);
        assert.include(arrayOfKeys("first_name"), updatedFirstName);
        assert.include(arrayOfKeys("last_name"), last_name);
        assert.include(arrayOfKeys("home_street"), home_street);
        assert.include(arrayOfKeys("home_city"), home_city);
        assert.include(arrayOfKeys("home_state"), home_state);
        assert.include(arrayOfKeys("home_zip"), home_zip);
        assert.include(arrayOfKeys("home_email"), home_email);
        assert.include(arrayOfKeys("preferred_language"), preferred_language);
        assert.include(arrayOfKeys("terms_agree"), terms_agree);
        assert.include(arrayOfKeys("legal_language"), legal_language);
        assert.include(
          arrayOfKeys("maintenance_of_effort").toString(),
          maintenance_of_effort
        );
        assert.include(
          arrayOfKeys("seiu503_cba_app_date").toString(),
          seiu503_cba_app_date
        );
      });
    });

    it("GET gets one submission by id", () => {
      return submissions.getSubmissionById(submissionId).then(result => {
        assert.equal(result.submission_id, submissionId);
        assert.equal(result.ip_address, ip_address);
        assert.equal(result.submission_date.toString(), submission_date);
        assert.equal(result.birthdate.toString(), birthdate);
        assert.equal(result.cell_phone, cell_phone);
        assert.equal(result.employer_name, updatedEmployerName);
        assert.equal(result.first_name, updatedFirstName);
        assert.equal(result.last_name, last_name);
        assert.equal(result.home_street, home_street);
        assert.equal(result.home_city, home_city);
        assert.equal(result.home_state, home_state);
        assert.equal(result.home_zip, home_zip);
        assert.equal(result.home_email, home_email);
        assert.equal(result.preferred_language, preferred_language);
        assert.equal(result.terms_agree, terms_agree);
        assert.equal(result.legal_language, legal_language);
        assert.equal(
          result.maintenance_of_effort.toString(),
          maintenance_of_effort
        );
        assert.equal(
          result.seiu503_cba_app_date.toString(),
          seiu503_cba_app_date
        );
        return db.select("*").from(TABLES.SUBMISSIONS);
      });
    });

    it("ATTACH a submission to contact in JOIN table", () => {
      console.log("contact_id:", contact_id, "submissionId", submissionId);
      return contacts
        .attachContactSubmission(contact_id, submissionId)
        .then(result => {
          assert.equal(result[0].contact_id, contact_id);
          assert.equal(result[0].submission_id, submissionId);
          // return db.select("*").from(TABLES.CONTACTS_SUBMISSIONS);
        });
    });

    it("GETS a contact_submission Object by contact_id", () => {
      return contacts.getContactSubmissionsById(contact_id).then(result => {
        assert.include(result.submissions, submissionId);
        // return db.select("*").from(TABLES.CONTACTS_SUBMISSIONS);
      });
    });

    it("DELETE deletes a submission", () => {
      return submissions.deleteSubmission(submissionId).then(result => {
        assert.equal(result.message, "Submission deleted successfully");
      });
    });
  });
});
