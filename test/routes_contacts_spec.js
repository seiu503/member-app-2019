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
