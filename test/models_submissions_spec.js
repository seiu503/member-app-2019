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
const submission_date = new Date();
const agency_number = "123456";
const birthdate = "01/02/1999";
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
const updatedEmployer_name = `updatedEmployerName ${utils.randomText()}`;
const updatedTextAuthOptOut = true;

/* Sample Contact Data */
const contact = {
  account_name: "testuser",
  agency_number: "123456",
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
  signature: "http://example.com/avatar.png"
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

describe.only("submissions model tests", () => {
  before(() => {
    return db.migrate.rollback().then(() => {
      return db.migrate.latest();
    });
  });

  after(() => {
    return db.migrate.rollback();
  });

  beforeEach(() => {
    return contacts
      .createContact(
        contact.account_name,
        contact.agency_number,
        contact.first_name,
        contact.last_name,
        contact.dd,
        contact.mm,
        contact.yyyy,
        contact.dob,
        contact.preferred_language,
        contact.home_street,
        contact.home_postal_code,
        contact.home_state,
        contact.home_city,
        contact.home_email,
        contact.mobile_phone,
        contact.text_auth_opt_out,
        contact.terms_agree,
        contact.signature
      )
      .then(contact => {
        contact_id = contact[0].contact_id;
      });
  });

  it("POST creates a new submission", () => {
    return submissions
      .createSubmission(
        contact_id,
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
          result[0].moment(submission_date),
          moment(submission_date)
        );
        assert.deepEqual(result[0].agency_number, agency_number);
        assert.deepEqual(result[0].birthdate, birthdate);
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
          immediate_past_member_statuS
        );
        submissionId = result[0].submission_id;
        return db.select("*").from(TABLES.SUBMISSIONS);
      })
      .then(([result]) => {
        assert.equal(result.ip_address, ip_address);
        assert.equal(
          result.moment(submission_date).format(),
          moment(submission_date).format()
        );
        assert.equal(result.agency_number, agency_number);
        assert.equal(result.birthdate, birthdate);
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
          immediate_past_member_statuS
        );
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

    it("PUT updates a contact", () => {
      const updates = {
        first_name: updatedFirstName,
        job_title: updatedJobTitle,
        text_auth_opt_out: updatedTextAuthOptOut,
        gender: updatedGender,
        gender_other_description: updatedGenderOtherDescription
      };
      return contacts.updateContact(contactId, updates).then(results => {
        assert.equal(results[0].first_name, updatedFirstName);
        assert.equal(results[0].job_title, updatedJobTitle);
        assert.equal(results[0].text_auth_opt_out, updatedTextAuthOptOut);
        assert.equal(results[0].gender, updatedGender);
        assert.equal(
          results[0].gender_other_description,
          updatedGenderOtherDescription
        );
        assert.isAbove(results[0].updated_at, results[0].created_at);
      });
    });

    it("GET gets all contacts", () => {
      return contacts.getContacts().then(results => {
        const arrayOfKeys = key => results.map(obj => obj[key]);
        assert.equal(Array.isArray(results), true);
        // assert.include(arrayOfKeys("display_name"), display_name);
        assert.include(arrayOfKeys("account_name"), account_name);
        assert.include(arrayOfKeys("agency_number"), agency_number);
        // assert.include(arrayOfKeys("mail_to_city"), mail_to_city);
        // assert.include(arrayOfKeys("mail_to_state"), mail_to_state);
        // assert.include(arrayOfKeys("mail_to_street"), mail_to_street);
        // assert.include(arrayOfKeys("mail_to_postal_code"), mail_to_postal_code);
        assert.include(arrayOfKeys("first_name"), updatedFirstName);
        assert.include(arrayOfKeys("last_name"), last_name);
        assert.include(arrayOfKeys("dd"), dd);
        assert.include(arrayOfKeys("mm"), mm);
        assert.include(arrayOfKeys("yyyy"), yyyy);
        assert.include(arrayOfKeys("dob").toString(), dob);
        assert.include(arrayOfKeys("preferred_language"), preferred_language);
        assert.include(arrayOfKeys("home_street"), home_street);
        assert.include(arrayOfKeys("home_postal_code"), home_postal_code);
        assert.include(arrayOfKeys("home_state"), home_state);
        assert.include(arrayOfKeys("home_city"), home_city);
        assert.include(arrayOfKeys("home_email"), home_email);
        assert.include(arrayOfKeys("mobile_phone"), mobile_phone);
        assert.include(arrayOfKeys("text_auth_opt_out"), updatedTextAuthOptOut);
        assert.include(arrayOfKeys("terms_agree"), terms_agree);
        assert.include(arrayOfKeys("signature"), signature);
        // assert.include(
        //   arrayOfKeys("online_campaign_source"),
        //   online_campaign_source
        // );
        // assert.include(arrayOfKeys("signed_application"), signed_application);
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
        assert.include(arrayOfKeys("gender"), updatedGender);
        assert.include(
          arrayOfKeys("gender_other_description"),
          updatedGenderOtherDescription
        );
        // assert.include(arrayOfKeys("gender_pronoun"), gender_pronoun);
        assert.include(arrayOfKeys("job_title"), updatedJobTitle);
        // assert.include(arrayOfKeys("hire_date").toString(), hire_date);
        // assert.include(arrayOfKeys("worksite"), worksite);
        // assert.include(arrayOfKeys("work_email"), work_email);
      });
    });

    it("GET gets one contact by id", () => {
      return contacts.getContactById(contactId).then(result => {
        // assert.equal(result.display_name, display_name);
        assert.equal(result.account_name, account_name);
        assert.equal(result.agency_number, agency_number);
        // assert.equal(result.mail_to_city, mail_to_city);
        // assert.equal(result.mail_to_state, mail_to_state);
        // assert.equal(result.mail_to_street, mail_to_street);
        // assert.equal(result.mail_to_postal_code, mail_to_postal_code);
        assert.equal(result.first_name, updatedFirstName);
        assert.equal(result.last_name, last_name);
        assert.equal(result.dd, dd);
        assert.equal(result.mm, mm);
        assert.equal(result.yyyy, yyyy);
        assert.equal(moment(result.dob).format(), moment(dob).format());
        assert.equal(result.preferred_language, preferred_language);
        assert.equal(result.home_street, home_street);
        assert.equal(result.home_postal_code, home_postal_code);
        assert.equal(result.home_state, home_state);
        assert.equal(result.home_city, home_city);
        assert.equal(result.home_email, home_email);
        assert.equal(result.mobile_phone, mobile_phone);
        assert.equal(result.text_auth_opt_out, updatedTextAuthOptOut);
        assert.equal(result.terms_agree, terms_agree);
        assert.equal(result.signature, signature);
        // assert.equal(result.online_campaign_source, online_campaign_source);
        // assert.equal(result.signed_application, signed_application);
        // assert.equal(result.ethnicity, ethnicity);
        // assert.equal(result.lgbtq_id, lgbtq_id);
        // assert.equal(result.trans_id, trans_id);
        // assert.equal(result.disability_id, disability_id);
        // assert.equal(result.deaf_or_hard_of_hearing, deaf_or_hard_of_hearing);
        // assert.equal(
        //   result.blind_or_visually_impaired,
        //   blind_or_visually_impaired
        // );
        // assert.equal(result.gender, updatedGender);
        // assert.equal(
        //   result.gender_other_description,
        //   updatedGenderOtherDescription
        // );
        // assert.equal(result.gender_pronoun, gender_pronoun);
        // assert.equal(result.job_title, updatedJobTitle);
        // assert.equal(
        //   moment(result.hire_date).format(),
        //   moment(hire_date).format()
        // );
        // assert.equal(result.worksite, worksite);
        // assert.equal(result.work_email, work_email);
        return db.select("*").from(TABLES.CONTACTS);
      });
    });

    it("DELETE deletes a contact", () => {
      return contacts.deleteContact(contactId).then(result => {
        assert.equal(result.message, "Contact deleted successfully");
      });
    });
  });
});
