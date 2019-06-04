// test/models_users_spec.js
/* globals describe afterEach it beforeEach */

/* ================================= SETUP ================================= */

process.env.NODE_ENV = "testing";

const { assert } = require("chai");
const moment = require("moment");
const sinon = require("sinon");
const passport = require("passport");
const { db, TABLES } = require("../app/config/knex");
const contacts = require("../db/models/contacts");
const users = require("../db/models/users");
const utils = require("../app/utils");

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
let contactId;

describe("contact model tests", () => {
  before(() => {
    return db.migrate.rollback().then(() => {
      return db.migrate.latest();
    });
  });

  after(() => {
    return db.migrate.rollback();
  });

  it("POST creates a new contact", () => {
    return contacts
      .createContact(
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
      )
      .then(result => {
        assert.deepEqual(result[0].display_name, display_name);
        assert.deepEqual(result[0].account_name, account_name);
        assert.deepEqual(result[0].agency_number, agency_number);
        assert.deepEqual(result[0].mail_to_city, mail_to_city);
        assert.deepEqual(result[0].mail_to_state, mail_to_state);
        assert.deepEqual(result[0].mail_to_street, mail_to_street);
        assert.deepEqual(result[0].mail_to_postal_code, mail_to_postal_code);
        assert.deepEqual(result[0].first_name, first_name);
        assert.deepEqual(result[0].last_name, last_name);
        assert.deepEqual(result[0].dd, dd);
        assert.deepEqual(result[0].mm, mm);
        assert.deepEqual(result[0].yyyy, yyyy);
        assert.deepEqual(moment(result[0].dob), moment(dob));
        assert.deepEqual(result[0].preferred_language, preferred_language);
        assert.deepEqual(result[0].home_street, home_street);
        assert.deepEqual(result[0].home_postal_code, home_postal_code);
        assert.deepEqual(result[0].home_state, home_state);
        assert.deepEqual(result[0].home_city, home_city);
        assert.deepEqual(result[0].home_email, home_email);
        assert.deepEqual(result[0].mobile_phone, mobile_phone);
        assert.deepEqual(result[0].text_auth_opt_out, text_auth_opt_out);
        assert.deepEqual(result[0].terms_agree, terms_agree);
        assert.deepEqual(result[0].signature, signature);
        assert.deepEqual(
          result[0].online_campaign_source,
          online_campaign_source
        );
        assert.deepEqual(result[0].signed_application, signed_application);
        assert.deepEqual(result[0].ethnicity, ethnicity);
        assert.deepEqual(result[0].lgbtq_id, lgbtq_id);
        assert.deepEqual(result[0].trans_id, trans_id);
        assert.deepEqual(result[0].disability_id, disability_id);
        assert.deepEqual(
          result[0].deaf_or_hard_of_hearing,
          deaf_or_hard_of_hearing
        );
        assert.deepEqual(
          result[0].blind_or_visually_impaired,
          blind_or_visually_impaired
        );
        assert.deepEqual(result[0].gender, gender);
        assert.deepEqual(
          result[0].gender_other_description,
          gender_other_description
        );
        assert.deepEqual(result[0].gender_pronoun, gender_pronoun);
        assert.deepEqual(result[0].job_title, job_title);
        assert.deepEqual(moment(result[0].hire_date), moment(hire_date));
        assert.deepEqual(result[0].worksite, worksite);
        assert.deepEqual(result[0].work_email, work_email);
        contactId = result[0].contact_id;
        return db.select("*").from(TABLES.CONTACTS);
      })
      .then(([result]) => {
        assert.equal(result.display_name, display_name);
        assert.equal(result.account_name, account_name);
        assert.equal(result.agency_number, agency_number);
        assert.equal(result.mail_to_city, mail_to_city);
        assert.equal(result.mail_to_state, mail_to_state);
        assert.equal(result.mail_to_street, mail_to_street);
        assert.equal(result.mail_to_postal_code, mail_to_postal_code);
        assert.equal(result.first_name, first_name);
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
        assert.equal(result.text_auth_opt_out, text_auth_opt_out);
        assert.equal(result.terms_agree, terms_agree);
        assert.equal(result.signature, signature);
        assert.equal(result.online_campaign_source, online_campaign_source);
        assert.equal(result.signed_application, signed_application);
        assert.equal(result.ethnicity, ethnicity);
        assert.equal(result.lgbtq_id, lgbtq_id);
        assert.equal(result.trans_id, trans_id);
        assert.equal(result.disability_id, disability_id);
        assert.equal(result.deaf_or_hard_of_hearing, deaf_or_hard_of_hearing);
        assert.equal(
          result.blind_or_visually_impaired,
          blind_or_visually_impaired
        );
        assert.equal(result.gender, gender);
        assert.equal(result.gender_other_description, gender_other_description);
        assert.equal(result.gender_pronoun, gender_pronoun);
        assert.equal(result.job_title, job_title);
        assert.equal(
          moment(result.hire_date).format("mm-dd-yyyy"),
          moment(hire_date).format("mm-dd-yyyy")
        );
        assert.equal(result.worksite, worksite);
        assert.equal(result.work_email, work_email);
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
      console.log("contactID in PUT =", contactId);
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
        assert.include(arrayOfKeys("display_name"), display_name);
        assert.include(arrayOfKeys("account_name"), account_name);
        assert.include(arrayOfKeys("agency_number"), agency_number);
        assert.include(arrayOfKeys("mail_to_city"), mail_to_city);
        assert.include(arrayOfKeys("mail_to_state"), mail_to_state);
        assert.include(arrayOfKeys("mail_to_street"), mail_to_street);
        assert.include(arrayOfKeys("mail_to_postal_code"), mail_to_postal_code);
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
        assert.include(
          arrayOfKeys("online_campaign_source"),
          online_campaign_source
        );
        assert.include(arrayOfKeys("signed_application"), signed_application);
        assert.include(arrayOfKeys("ethnicity"), ethnicity);
        assert.include(arrayOfKeys("lgbtq_id"), lgbtq_id);
        assert.include(arrayOfKeys("trans_id"), trans_id);
        assert.include(arrayOfKeys("disability_id"), disability_id);
        assert.include(
          arrayOfKeys("deaf_or_hard_of_hearing"),
          deaf_or_hard_of_hearing
        );
        assert.include(
          arrayOfKeys("blind_or_visually_impaired"),
          blind_or_visually_impaired
        );
        assert.include(arrayOfKeys("gender"), updatedGender);
        assert.include(
          arrayOfKeys("gender_other_description"),
          updatedGenderOtherDescription
        );
        assert.include(arrayOfKeys("gender_pronoun"), gender_pronoun);
        assert.include(arrayOfKeys("job_title"), updatedJobTitle);
        assert.include(arrayOfKeys("hire_date").toString(), hire_date);
        assert.include(arrayOfKeys("worksite"), worksite);
        assert.include(arrayOfKeys("work_email"), work_email);
      });
    });

    it("GET gets one contact by id", () => {
      return contacts.getContactById(contactId).then(result => {
        assert.equal(result.display_name, display_name);
        assert.equal(result.account_name, account_name);
        assert.equal(result.agency_number, agency_number);
        assert.equal(result.mail_to_city, mail_to_city);
        assert.equal(result.mail_to_state, mail_to_state);
        assert.equal(result.mail_to_street, mail_to_street);
        assert.equal(result.mail_to_postal_code, mail_to_postal_code);
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
        assert.equal(result.online_campaign_source, online_campaign_source);
        assert.equal(result.signed_application, signed_application);
        assert.equal(result.ethnicity, ethnicity);
        assert.equal(result.lgbtq_id, lgbtq_id);
        assert.equal(result.trans_id, trans_id);
        assert.equal(result.disability_id, disability_id);
        assert.equal(result.deaf_or_hard_of_hearing, deaf_or_hard_of_hearing);
        assert.equal(
          result.blind_or_visually_impaired,
          blind_or_visually_impaired
        );
        assert.equal(result.gender, updatedGender);
        assert.equal(
          result.gender_other_description,
          updatedGenderOtherDescription
        );
        assert.equal(result.gender_pronoun, gender_pronoun);
        assert.equal(result.job_title, updatedJobTitle);
        assert.equal(
          moment(result.hire_date).format(),
          moment(hire_date).format()
        );
        assert.equal(result.worksite, worksite);
        assert.equal(result.work_email, work_email);
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
