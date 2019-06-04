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
const DisplayName = "testuser";
const AccountName = "testuser";
const AgencyNumber = "123456";
const MailToCity = "mailToCity";
const MailToState = "OR";
const MailToStreet = "Multnomah Blvd";
const MailToPostalCode = "97221";
const FirstName = "firstname";
const LastName = "lastname";
const Dd = "01";
const Mm = "01";
const Yyyy = "2001";
const Dob = new Date("01/01/2001");
const PreferredLanguage = "English";
const HomeStreet = "homestreet";
const HomePostalCode = "12345";
const HomeState = "OR";
const HomeCity = "Portland";
const HomeEmail = "fakeemail@test.com";
const MobilePhone = "123-546-7890";
const TextAuthOptOut = false;
const TermsAgree = true;
const Signature = "http://example.com/avatar.png";
const OnlineCampaignSource = "email";
const SignedApplication = true;
const Ethnicity = "other";
const LgbtqId = false;
const TransId = false;
const DisabilityId = false;
const DeafOrHardOfHearing = false;
const BlindOrVisuallyImpaired = false;
const Gender = "female";
const GenderOtherDescription = "";
const GenderPronoun = "She/Her";
const JobTitle = "jobtitle";
const HireDate = new Date("01/08/2003");
const Worksite = "worksite";
const WorkEmail = "lastnamef@seiu.com";

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

describe.only("contact model tests", () => {
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
        DisplayName,
        AccountName,
        AgencyNumber,
        MailToCity,
        MailToState,
        MailToStreet,
        MailToPostalCode,
        FirstName,
        LastName,
        Dd,
        Mm,
        Yyyy,
        Dob,
        PreferredLanguage,
        HomeStreet,
        HomePostalCode,
        HomeState,
        HomeCity,
        HomeEmail,
        MobilePhone,
        TextAuthOptOut,
        TermsAgree,
        Signature,
        OnlineCampaignSource,
        SignedApplication,
        Ethnicity,
        LgbtqId,
        TransId,
        DisabilityId,
        DeafOrHardOfHearing,
        BlindOrVisuallyImpaired,
        Gender,
        GenderOtherDescription,
        GenderPronoun,
        JobTitle,
        HireDate,
        Worksite,
        WorkEmail
      )
      .then(result => {
        assert.deepEqual(result[0].display_name, DisplayName);
        assert.deepEqual(result[0].account_name, AccountName);
        assert.deepEqual(result[0].agency_number, AgencyNumber);
        assert.deepEqual(result[0].mail_to_city, MailToCity);
        assert.deepEqual(result[0].mail_to_state, MailToState);
        assert.deepEqual(result[0].mail_to_street, MailToStreet);
        assert.deepEqual(result[0].mail_to_postal_code, MailToPostalCode);
        assert.deepEqual(result[0].first_name, FirstName);
        assert.deepEqual(result[0].last_name, LastName);
        assert.deepEqual(result[0].dd, Dd);
        assert.deepEqual(result[0].mm, Mm);
        assert.deepEqual(result[0].yyyy, Yyyy);
        assert.deepEqual(result[0].dob, Dob);
        assert.deepEqual(result[0].preferred_language, PreferredLanguage);
        assert.deepEqual(result[0].home_street, HomeStreet);
        assert.deepEqual(result[0].home_postal_code, HomePostalCode);
        assert.deepEqual(result[0].home_state, HomeState);
        assert.deepEqual(result[0].home_city, HomeCity);
        assert.deepEqual(result[0].home_email, HomeEmail);
        assert.deepEqual(result[0].mobile_phone, MobilePhone);
        assert.deepEqual(result[0].text_auth_opt_out, TextAuthOptOut);
        assert.deepEqual(result[0].terms_agree, TermsAgree);
        assert.deepEqual(result[0].signature, Signature);
        assert.deepEqual(
          result[0].online_campaign_source,
          OnlineCampaignSource
        );
        assert.deepEqual(result[0].signed_application, SignedApplication);
        assert.deepEqual(result[0].ethnicity, Ethnicity);
        assert.deepEqual(result[0].lgbtq_id, LgbtqId);
        assert.deepEqual(result[0].trans_id, TransId);
        assert.deepEqual(result[0].disability_id, DisabilityId);
        assert.deepEqual(
          result[0].deaf_or_hard_of_hearing,
          DeafOrHardOfHearing
        );
        assert.deepEqual(
          result[0].blind_or_visually_impaired,
          BlindOrVisuallyImpaired
        );
        assert.deepEqual(result[0].gender, Gender);
        assert.deepEqual(
          result[0].gender_other_description,
          GenderOtherDescription
        );
        assert.deepEqual(result[0].gender_pronoun, GenderPronoun);
        assert.deepEqual(result[0].job_title, JobTitle);
        assert.deepEqual(result[0].hire_date, HireDate);
        assert.deepEqual(result[0].worksite, Worksite);
        assert.deepEqual(result[0].work_email, WorkEmail);
        contactId = result[0].contact_id;
        return db.select("*").from(TABLES.CONTACTS);
      })
      .then(([result]) => {
        assert.equal(result.display_name, DisplayName);
        assert.equal(result.account_name, AccountName);
        assert.equal(result.agency_number, AgencyNumber);
        assert.equal(result.mail_to_city, MailToCity);
        assert.equal(result.mail_to_state, MailToState);
        assert.equal(result.mail_to_street, MailToStreet);
        assert.equal(result.mail_to_postal_code, MailToPostalCode);
        assert.equal(result.first_name, FirstName);
        assert.equal(result.last_name, LastName);
        assert.equal(result.dd, Dd);
        assert.equal(result.mm, Mm);
        assert.equal(result.yyyy, Yyyy);
        assert.equal(result.dob, Dob);
        assert.equal(result.preferred_language, PreferredLanguage);
        assert.equal(result.home_street, HomeStreet);
        assert.equal(result.home_postal_code, HomePostalCode);
        assert.equal(result.home_state, HomeState);
        assert.equal(result.home_city, HomeCity);
        assert.equal(result.home_email, HomeEmail);
        assert.equal(result.mobile_phone, MobilePhone);
        assert.equal(result.text_auth_opt_out, TextAuthOptOut);
        assert.equal(result.terms_agree, TermsAgree);
        assert.equal(result.signature, Signature);
        assert.equal(result.online_campaign_source, OnlineCampaignSource);
        assert.equal(result.signed_application, SignedApplication);
        assert.equal(result.ethnicity, Ethnicity);
        assert.equal(result.lgbtq_id, LgbtqId);
        assert.equal(result.trans_id, TransId);
        assert.equal(result.disability_id, DisabilityId);
        assert.equal(result.deaf_or_hard_of_hearing, DeafOrHardOfHearing);
        assert.equal(
          result.blind_or_visually_impaired,
          BlindOrVisuallyImpaired
        );
        assert.equal(result.gender, Gender);
        assert.equal(result.gender_other_description, GenderOtherDescription);
        assert.equal(result.gender_pronoun, GenderPronoun);
        assert.equal(result.job_title, JobTitle);
        assert.equal(result.hire_date, HireDate);
        assert.equal(result.worksite, Worksite);
        assert.equal(result.work_email, WorkEmail);
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
        assert.include(arrayOfKeys("display_name"), DisplayName);
        assert.include(arrayOfKeys("account_name"), AccountName);
        assert.include(arrayOfKeys("agency_number"), AgencyNumber);
        assert.include(arrayOfKeys("mail_to_city"), MailToCity);
        assert.include(arrayOfKeys("mail_to_state"), MailToState);
        assert.include(arrayOfKeys("mail_to_street"), MailToStreet);
        assert.include(arrayOfKeys("mail_to_postal_code"), MailToPostalCode);
        assert.include(arrayOfKeys("first_name"), updatedFirstName);
        assert.include(arrayOfKeys("last_name"), LastName);
        assert.include(arrayOfKeys("dd"), Dd);
        assert.include(arrayOfKeys("mm"), Mm);
        assert.include(arrayOfKeys("yyyy"), Yyyy);
        assert.include(arrayOfKeys("dob"), Dob);
        assert.include(arrayOfKeys("preferred_language"), PreferredLanguage);
        assert.include(arrayOfKeys("home_street"), HomeStreet);
        assert.include(arrayOfKeys("home_postal_code"), HomePostalCode);
        assert.include(arrayOfKeys("home_state"), HomeState);
        assert.include(arrayOfKeys("home_city"), HomeCity);
        assert.include(arrayOfKeys("home_email"), HomeEmail);
        assert.include(arrayOfKeys("mobile_phone"), MobilePhone);
        assert.include(arrayOfKeys("text_auth_opt_out"), updatedTextAuthOptOut);
        assert.include(arrayOfKeys("terms_agree"), TermsAgree);
        assert.include(arrayOfKeys("signature"), Signature);
        assert.include(
          arrayOfKeys("online_campaign_source"),
          OnlineCampaignSource
        );
        assert.include(arrayOfKeys("signed_application"), SignedApplication);
        assert.include(arrayOfKeys("ethnicity"), Ethnicity);
        assert.include(arrayOfKeys("lgbtq_id"), LgbtqId);
        assert.include(arrayOfKeys("trans_id"), TransId);
        assert.include(arrayOfKeys("disability_id"), DisabilityId);
        assert.include(
          arrayOfKeys("deaf_or_hard_of_hearing"),
          DeafOrHardOfHearing
        );
        assert.include(
          arrayOfKeys("blind_or_visually_impaired"),
          BlindOrVisuallyImpaired
        );
        assert.include(arrayOfKeys("gender"), updatedGender);
        assert.include(
          arrayOfKeys("gender_other_description"),
          updatedGenderOtherDescription
        );
        assert.include(arrayOfKeys("gender_pronoun"), GenderPronoun);
        assert.include(arrayOfKeys("job_title"), updatedJobTitle);
        assert.include(arrayOfKeys("hire_date"), HireDate);
        assert.include(arrayOfKeys("worksite"), Worksite);
        assert.include(arrayOfKeys("work_email"), WorkEmail);
      });
    });

    it("GET gets one contact by id", () => {
      return contacts.getContactById(contactId).then(result => {
        assert.equal(result.display_name, DisplayName);
        assert.equal(result.account_name, AccountName);
        assert.equal(result.agency_number, AgencyNumber);
        assert.equal(result.mail_to_city, MailToCity);
        assert.equal(result.mail_to_state, MailToState);
        assert.equal(result.mail_to_street, MailToStreet);
        assert.equal(result.mail_to_postal_code, MailToPostalCode);
        assert.equal(result.first_name, updatedFirstName);
        assert.equal(result.last_name, LastName);
        assert.equal(result.dd, Dd);
        assert.equal(result.mm, Mm);
        assert.equal(result.yyyy, Yyyy);
        assert.equal(result.dob, Dob);
        assert.equal(result.preferred_language, PreferredLanguage);
        assert.equal(result.home_street, HomeStreet);
        assert.equal(result.home_postal_code, HomePostalCode);
        assert.equal(result.home_state, HomeState);
        assert.equal(result.home_city, HomeCity);
        assert.equal(result.home_email, HomeEmail);
        assert.equal(result.mobile_phone, MobilePhone);
        assert.equal(result.text_auth_opt_out, TextAuthOptOut);
        assert.equal(result.terms_agree, TermsAgree);
        assert.equal(result.signature, Signature);
        assert.equal(result.online_campaign_source, OnlineCampaignSource);
        assert.equal(result.signed_application, SignedApplication);
        assert.equal(result.ethnicity, Ethnicity);
        assert.equal(result.lgbtq_id, LgbtqId);
        assert.equal(result.trans_id, TransId);
        assert.equal(result.disability_id, DisabilityId);
        assert.equal(result.deaf_or_hard_of_hearing, DeafOrHardOfHearing);
        assert.equal(
          result.blind_or_visually_impaired,
          BlindOrVisuallyImpaired
        );
        assert.equal(result.gender, updatedGender);
        assert.equal(
          result.gender_other_description,
          updatedGenderOtherDescription
        );
        assert.equal(result.gender_pronoun, GenderPronoun);
        assert.equal(result.job_title, updatedJobTitle);
        assert.equal(result.hire_date, HireDate);
        assert.equal(result.worksite, Worksite);
        assert.equal(result.work_email, WorkEmail);
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
