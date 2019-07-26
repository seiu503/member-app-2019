const uuid = require("uuid");

// fields labeled 'Account field' are actually in the Account (Employer)
// table in SF, but they're being accessed from a query to the
// Contacts table that includes a lookup to Accounts
// so i'm leaving them here to avoid having to rewrite
// the generateSFContactFieldList function
const contactsTableFields = {
  display_name: {
    oldFormPage: "none",
    req: "N",
    postgresFieldName: "display_name",
    clientFieldName: "displayName",
    HtmlInputType: "(formula; no user-facing input)",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Display Name for forms",
    SFAPIName: "Display_Name_for_forms__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "test user"
  },
  account_name: {
    oldFormPage: "1",
    req: "Y",
    postgresFieldName: "account_name",
    clientFieldName: "accountName",
    HtmlInputType: "select",
    SFTable: "Worker (Contact)", // Account field
    SFFieldLabel: "Parent Name",
    SFAPIName: "Account.CVRSOS__ParentName__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "Dakavia Health Services"
  },
  worksite_name: {
    oldFormPage: "none",
    req: "N",
    postgresFieldName: "worksite_name",
    clientFieldName: "worksiteName",
    HtmlInputType: "none",
    SFTable: "Worker (Contact)", // Account field
    SFFieldLabel: "Name",
    SFAPIName: "Account.Name",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "Dakavia - Fernhill Estates"
  },
  employer_id: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "account_id",
    clientFieldName: "accountId",
    HtmlInputType: "none",
    SFTable: "Worker (Contact)", // Account field
    SFFieldLabel: "Account Id",
    SFAPIName: "Account.Id",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "0016100000Pw3eMAAR"
  },
  account_subdivision: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "account_subdivision",
    clientFieldName: "employerType",
    HtmlInputType: "none",
    SFTable: "Worker (Contact)", // Account field
    SFFieldLabel: "WS Subdivision (from Agency)",
    SFAPIName: "Account.WS_Subdivision_from_Agency__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "Nursing Homes"
  },
  account_parent_subdivision: {
    clientFieldName: "accountParentSubdivision",
    SFTable: "Worker (Contact)", // Account field
    SFAPIName: "Account.Sub_Division__c",
    testingSample: "Nursing Homes"
  },
  agency_number: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "agency_number",
    clientFieldName: "agencyNumber",
    HtmlInputType: "(formula; no user-facing input)",
    SFTable: "Worker (Contact)", // Account field
    SFFieldLabel: "Agency Number",
    SFAPIName: "Account.Agency_Number__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "123456"
  },
  account_record_type_id: {
    oldFormPage: "none",
    req: "N",
    postgresFieldName: "account_record_type_id",
    clientFieldName: "accountRecordTypeId",
    HtmlInputType: "(formula; no user-facing input)",
    SFTable: "Worker (Contact)", // Account field
    SFFieldLabel: "Employer Record Type",
    SFAPIName: "Account.RecordTypeId",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "123456"
  },
  mail_to_city: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "mail_to_city",
    clientFieldName: "mailToCity",
    HtmlInputType: "text",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Mail-To City",
    SFAPIName: "OtherCity",
    SFDataType: "Address (Composite)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "mailToCity"
  },
  mail_to_state: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "mail_to_state",
    clientFieldName: "mailToState",
    HtmlInputType: "select (limit 2 char",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Mail-To State/Province",
    SFAPIName: "OtherState",
    SFDataType: "Address (Composite)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "OR"
  },
  mail_to_street: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "mail_to_street",
    clientFieldName: "mailToStreet",
    HtmlInputType: "text",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Mail-To Street",
    SFAPIName: "OtherStreet",
    SFDataType: "Address (Composite)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "Multnomah Blvd"
  },
  mail_to_postal_code: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "mail_to_postal_code",
    clientFieldName: "mailToZip",
    HtmlInputType: "text (limit 5 char)",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Mail-To Zip/Postal Code",
    SFAPIName: "OtherPostalCode",
    SFDataType: "Address (Composite)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "97221"
  },
  first_name: {
    oldFormPage: "1",
    req: "Y",
    postgresFieldName: "first_name",
    clientFieldName: "firstName",
    HtmlInputType: "text",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "First Name",
    SFAPIName: "FirstName",
    SFDataType: "Name (Composite)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "firstname"
  },
  last_name: {
    oldFormPage: "1",
    req: "Y",
    postgresFieldName: "last_name",
    clientFieldName: "lastName",
    HtmlInputType: "text",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Last Name",
    SFAPIName: "LastName",
    SFDataType: "Name (Composite)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "lastname"
  },
  dd: {
    oldFormPage: "1",
    req: "N",
    postgresFieldName: "dd",
    clientFieldName: "DD",
    HtmlInputType: "text (limit 2 char)",
    SFTable: "(not written to SF)",
    SFFieldLabel: "(not written to SF)",
    SFAPIName: "(not written to SF)",
    SFDataType: "(not written to SF)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "1"
  },
  mm: {
    oldFormPage: "1",
    req: "N",
    postgresFieldName: "mm",
    clientFieldName: "MM",
    HtmlInputType: "text (limit 2 char)",
    SFTable: "(not written to SF)",
    SFFieldLabel: "(not written to SF)",
    SFAPIName: "(not written to SF)",
    SFDataType: "(not written to SF)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "1"
  },
  yyyy: {
    oldFormPage: "1",
    req: "N",
    postgresFieldName: "yyyy",
    clientFieldName: "YYYY",
    HtmlInputType: "text (limit 4 char)",
    SFTable: "(not written to SF)",
    SFFieldLabel: "(not written to SF)",
    SFAPIName: "(not written to SF)",
    SFDataType: "(not written to SF)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "2001"
  },
  birthdate: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "dob",
    clientFieldName: "DOB",
    HtmlInputType: "(formula; no user-facing input)",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Birthdate",
    SFAPIName: "Birthdate",
    SFDataType: "Date",
    SQLDataType: "DATE",
    testingSample: "01/01/2001"
  },
  preferred_language: {
    oldFormPage: "1",
    req: "Y",
    postgresFieldName: "preferred_language",
    clientFieldName: "preferredLanguage",
    HtmlInputType: "select",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Preferred Language",
    SFAPIName: "Preferred_Language__c",
    SFDataType: "Picklist(text)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "English"
  },
  home_street: {
    oldFormPage: "1",
    req: "Y",
    postgresFieldName: "home_street",
    clientFieldName: "homeStreet",
    HtmlInputType: "text",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Home Street",
    SFAPIName: "MailingStreet",
    SFDataType: "Address (Composite)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "homestreet"
  },
  home_zip: {
    oldFormPage: "1",
    req: "Y",
    postgresFieldName: "home_postal_code",
    clientFieldName: "homePostalCode",
    HtmlInputType: "text (limit 5 char)",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Home Zip/Postal Code",
    SFAPIName: "MailingPostalCode",
    SFDataType: "Address (Composite)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "12345"
  },
  home_state: {
    oldFormPage: "1",
    req: "Y",
    postgresFieldName: "home_state",
    clientFieldName: "homeState",
    HtmlInputType: "select (limit 2 char)",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Home State/Province",
    SFAPIName: "MailingState",
    SFDataType: "Address (Composite)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "OR"
  },
  home_city: {
    oldFormPage: "1",
    req: "Y",
    postgresFieldName: "home_city",
    clientFieldName: "homeCity",
    HtmlInputType: "text",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Home City",
    SFAPIName: "MailingCity",
    SFDataType: "Address (Composite)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "Portland"
  },
  home_email: {
    oldFormPage: "1",
    req: "Y",
    postgresFieldName: "home_email",
    clientFieldName: "homeEmail",
    HtmlInputType: "email",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Home Email",
    SFAPIName: "Home_Email__c",
    SFDataType: "Email",
    SQLDataType: "VARCHAR(255)",
    testingSample: "fakeemail@test.com"
  },
  cell_phone: {
    oldFormPage: "1",
    req: "Y",
    postgresFieldName: "mobile_phone",
    clientFieldName: "mobilePhone",
    HtmlInputType: "tel",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Cell Phone",
    SFAPIName: "MobilePhone",
    SFDataType: "Phone",
    SQLDataType: "VARCHAR(255)",
    testingSample: "123-546-7890"
  },
  text_auth_opt_out: {
    oldFormPage: "1",
    req: "N",
    postgresFieldName: "text_auth_opt_out",
    clientFieldName: "textAuthOptOut",
    HtmlInputType: "checkbox",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Text Authorization Opt Out",
    SFAPIName: "Text_Authorization_Opt_Out__c",
    SFDataType: "Checkbox",
    SQLDataType: "Boolean",
    testingSample: false
  },
  terms_agree: {
    oldFormPage: "1",
    req: "Y",
    postgresFieldName: "terms_agree",
    clientFieldName: "termsAgree",
    HtmlInputType: "checkbox",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "termsagree",
    SFAPIName: "termsagree__c",
    SFDataType: "Checkbox",
    SQLDataType: "Boolean",
    testingSample: true
  },
  signature: {
    oldFormPage: "1",
    req: "Y",
    postgresFieldName: "signature",
    clientFieldName: "signature",
    HtmlInputType: "currently text",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Signature",
    SFAPIName: "Signature__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "http://example.com/avatar.png"
  },
  online_campaign_source: {
    oldFormPage: "1",
    req: "N",
    postgresFieldName: "online_campaign_source",
    clientFieldName: "onlineCampaignSource",
    HtmlInputType: "text",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Online Campaign Source",
    SFAPIName: "Online_Campaign_Source__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "email"
  },
  signed_application: {
    oldFormPage: "1",
    req: "N",
    postgresFieldName: "signed_application",
    clientFieldName: "signedApplication",
    HtmlInputType: "checkbox",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Signed Application",
    SFAPIName: "Signed_Card__c",
    SFDataType: "Checkbox",
    SQLDataType: "Boolean",
    testingSample: true
  },
  ethnicity: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "ethnicity",
    clientFieldName: "ethnicity",
    HtmlInputType: "select",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Ethnicity",
    SFAPIName: "Ethnicity__c",
    SFDataType: "Picklist(text)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "other"
  },
  lgbtq_id: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "lgbtq_id",
    clientFieldName: "lgbtqId",
    HtmlInputType: "checkbox",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "LGBTQIA+ ID",
    SFAPIName: "LGBTQ_ID__c",
    SFDataType: "Checkbox",
    SQLDataType: "Boolean",
    testingSample: false
  },
  trans_id: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "trans_id",
    clientFieldName: "trandId",
    HtmlInputType: "checkbox",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Trans ID",
    SFAPIName: "Trans_ID__c",
    SFDataType: "Checkbox",
    SQLDataType: "Boolean",
    testingSample: false
  },
  disability_id: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "disability_id",
    clientFieldName: "disabillityId",
    HtmlInputType: "checkbox",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Disability ID",
    SFAPIName: "Disability_ID__c",
    SFDataType: "Checkbox",
    SQLDataType: "Boolean",
    testingSample: false
  },
  deaf_or_hard_of_hearing: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "deaf_or_hard_of_hearing",
    clientFieldName: "deafOrHardHearing",
    HtmlInputType: "checkbox",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Deaf or hard-of-hearing",
    SFAPIName: "Deaf_or_hearing_impaired__c",
    SFDataType: "Checkbox",
    SQLDataType: "Boolean",
    testingSample: false
  },
  blind_or_visually_impaired: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "blind_or_visually_impaired",
    clientFieldName: "blindOrVisuallyImpaired",
    HtmlInputType: "checkbox",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Blind or visually impaired",
    SFAPIName: "Blind_or_visually_impaired__c",
    SFDataType: "Checkbox",
    SQLDataType: "Boolean",
    testingSample: false
  },
  gender: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "gender",
    clientFieldName: "gender",
    HtmlInputType: "select",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Gender (503)",
    SFAPIName: "Gender__c",
    SFDataType: "Picklist(text)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "female"
  },
  gender_other_description: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "gender_other_description",
    clientFieldName: "genderOtherDesc",
    HtmlInputType: "text",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Gender Other - Description",
    SFAPIName: "Gender_Other_Description__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: ""
  },
  gender_pronoun: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "gender_pronoun",
    clientFieldName: "genderPronoun",
    HtmlInputType: "select",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Gender Pronoun",
    SFAPIName: "Prounoun__c",
    SFDataType: "Picklist(text)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "She/Her"
  },
  job_title: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "job_title",
    clientFieldName: "jobTitle",
    HtmlInputType: "text",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Job Class/Title",
    SFAPIName: "Title",
    SFDataType: "Text(128)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "jobtitle"
  },
  hire_date: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "hire_date",
    clientFieldName: "hireDate",
    HtmlInputType: "date",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Hire date",
    SFAPIName: "Hire_Date__c",
    SFDataType: "Date",
    SQLDataType: "DATE",
    testingSample: "01/08/2003"
  },
  worksite: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "worksite",
    clientFieldName: "worksite",
    HtmlInputType: "text",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Worksite (manual entry from webform",
    SFAPIName: "Worksite_manual_entry_from_webform__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "worksite"
  },
  work_email: {
    oldFormPage: "2",
    req: "N",
    postgresFieldName: "work_email",
    clientFieldName: "workEmail",
    HtmlInputType: "email",
    SFTable: "Worker (Contact)",
    SFFieldLabel: "Work email",
    SFAPIName: "Work_Email__c",
    SFDataType: "Email",
    SQLDataType: "VARCHAR(255)",
    testingSample: "lastnamef@seiu.com"
  }
};

const submissionsTableFields = {
  ip_address: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "ip_address",
    clientFieldName: "idAddress",
    HtmlInputType: "(formula; no user-facing input)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "IP Address",
    SFAPIName: "IP_Address__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "192.0.2.0"
  },
  submission_date: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "submission_date",
    clientFieldName: "submissionDate",
    HtmlInputType: "(formula; no user-facing input)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Submission Date",
    SFAPIName: "Submission_Date__c",
    SFDataType: "Date/Time",
    SQLDataType: "Timestamp",
    testingSample: "05/02/2019"
  },
  agency_number: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "agency_number",
    clientFieldName: "agencyNumber",
    HtmlInputType: "n/a (see Contacts)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Agency Number",
    SFAPIName: "agencyNumber__c",
    SFDataType: "",
    SQLDataType: "",
    testingSample: "123456"
  },
  account_subdivision: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "account_subdivision",
    clientFieldName: "employerType",
    HtmlInputType: "none",
    SFTable: "Worker (Contact)", // Account field
    SFFieldLabel: "WS Subdivision (from Agency)",
    SFAPIName: "Account.WS_Subdivision_from_Agency__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "Nursing Homes"
  },
  birthdate: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "birthdate",
    clientFieldName: "birthdate",
    HtmlInputType: "n/a (see Contacts)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Birthdate",
    SFAPIName: "Birthdate__c",
    SFDataType: "Date",
    SQLDataType: "Date",
    testingSample: new Date("01/01/2001")
  },
  cell_phone: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "cell_phone",
    clientFieldName: "cellPhone",
    HtmlInputType: "n/a (see Contacts)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Cell Phone",
    SFAPIName: "Cell_Phone__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "123-456-7890"
  },
  employer_name: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "employer_name",
    clientFieldName: "employerName",
    HtmlInputType: "n/a (see Contacts)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "EmployerName_fromWebForm",
    SFAPIName: "EmployerName_fromWebForm__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "employer_name"
  },
  first_name: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "first_name",
    clientFieldName: "firstName",
    HtmlInputType: "n/a (see Contacts)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "First Name",
    SFAPIName: "firstName__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "firstname"
  },
  last_name: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "last_name",
    clientFieldName: "lastName",
    HtmlInputType: "n/a (see Contacts)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Last Name",
    SFAPIName: "lastName__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "lastname"
  },
  home_street: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "home_street",
    clientFieldName: "homeStreet",
    HtmlInputType: "n/a (see Contacts)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Home Street",
    SFAPIName: "Home_Street__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "home_street"
  },
  home_city: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "home_city",
    clientFieldName: "homeCity",
    HtmlInputType: "n/a (see Contacts)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Home City",
    SFAPIName: "Home_City__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "home_city"
  },
  home_state: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "home_state",
    clientFieldName: "homeState",
    HtmlInputType: "n/a (see Contacts)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Home State",
    SFAPIName: "Home_State__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "OR"
  },
  home_zip: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "home_zip",
    clientFieldName: "homeZip",
    HtmlInputType: "n/a (see Contacts)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Home Zip",
    SFAPIName: "Home_Zip__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "12345"
  },
  home_email: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "home_email",
    clientFieldName: "homeEmail",
    HtmlInputType: "n/a (see Contacts)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Home Email",
    SFAPIName: "Home_Email__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "fake@email.com"
  },
  preferred_language: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "preferred_language",
    clientFieldName: "preferredLanguage",
    HtmlInputType: "n/a (see Contacts)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Preferred Language",
    SFAPIName: "Preferred_Language__c",
    SFDataType: "Picklist(text)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "English"
  },
  terms_agree: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "terms_agree",
    clientFieldName: "termsAgree",
    HtmlInputType: "n/a (see Contacts)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "termsagree",
    SFAPIName: "termsagree__c",
    SFDataType: "Checkbox",
    SQLDataType: "Boolean",
    testingSample: true
  },
  signature: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "signature",
    clientFieldName: "signature",
    HtmlInputType: "n/a (see Contacts)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Signature",
    SFAPIName: "Signature__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "http://example.com/signature.png"
  },
  text_auth_opt_out: {
    oldFormPage: "none",
    req: "N",
    postgresFieldName: "text_auth_opt_out",
    clientFieldName: "textAuthOptOut",
    HtmlInputType: "n/a (see Contacts)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Text Authorization Opt Out",
    SFAPIName: "Text_Authorization_Opt_Out__c",
    SFDataType: "Checkbox",
    SQLDataType: "Boolean",
    testingSample: false
  },
  online_campaign_source: {
    oldFormPage: "none",
    req: "N",
    postgresFieldName: "online_campaign_source",
    clientFieldName: "onlineCampaignSource",
    HtmlInputType: "(formula; no user-facing input)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Online Campaign Source",
    SFAPIName: "Online_Campaign_Source__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "online_campaign_source"
  },
  contact_id: {
    oldFormPage: "none",
    req: "N",
    postgresFieldName: "contact_id",
    clientFieldName: "contactId",
    HtmlInputType: "(formula; no user-facing input)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Contact ID",
    SFAPIName: "Contact_ID_from_FA_prefill__c",
    SFDataType: "Text(255)",
    SQLDataType: "VARCHAR(255)",
    testingSample: null
  },
  legal_language: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "legal_language",
    clientFieldName: "legalLanguage",
    HtmlInputType: "(formula; no user-facing input)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Legal Language",
    SFAPIName: "Legal_Language__c",
    SFDataType: "Long Text Area(32768)",
    SQLDataType: "Text",
    testingSample: "Lorem ipsum dolor sit amet."
  },
  maintenance_of_effort: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "maintenance_of_effort",
    clientFieldName: "maintenanceOfEffort",
    HtmlInputType: "(formula; no user-facing input)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Maintenance of Effort",
    SFAPIName: "Maintenance_of_Effort__c",
    SFDataType: "Date",
    SQLDataType: "Date",
    testingSample: "05/02/2019"
  },
  seiu503_cba_app_date: {
    oldFormPage: "none",
    req: "Y",
    postgresFieldName: "seiu503_cba_app_date",
    clientFieldName: "seiu503CBAAppDate",
    HtmlInputType: "(formula; no user-facing input)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "503 CBA App Date",
    SFAPIName: "X503_CBA_App_Date__c",
    SFDataType: "Date",
    SQLDataType: "Date",
    testingSample: "05/02/2019"
  },
  direct_pay_auth: {
    oldFormPage: "none",
    req: "N",
    postgresFieldName: "direct_pay_auth",
    clientFieldName: "directPayAuth",
    HtmlInputType: "(formula; no user-facing input)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Direct Pay Authorization",
    SFAPIName: "Direct_Pay_Authorization__c",
    SFDataType: "Date",
    SQLDataType: "Date",
    testingSample: "05/02/2019"
  },
  direct_deposit_auth: {
    oldFormPage: "none",
    req: "N",
    postgresFieldName: "direct_deposit_auth",
    clientFieldName: "directDepositAuth",
    HtmlInputType: "(formula; no user-facing input)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Direct Deposit Authorization",
    SFAPIName: "Direct_Deposit_Authorization__c",
    SFDataType: "Date",
    SQLDataType: "Date",
    testingSample: "05/02/2019"
  },
  immediate_past_member_status: {
    oldFormPage: "none",
    req: "N",
    postgresFieldName: "immediate_past_member_status",
    clientFieldName: "immediatePastMemberStatus",
    HtmlInputType: "(formula; no user-facing input)",
    SFTable: "OnlineMemberApp__c",
    SFFieldLabel: "Immediate Past Member Status",
    SFAPIName: "Immediate_Past_Member_Status__c",
    SFDataType: "Picklist(text)",
    SQLDataType: "VARCHAR(255)",
    testingSample: "In Good Standing"
  }
};

const generateSampleSubmission = () => {
  const sampleData = {};
  sampleData.submission_id = uuid.v4();
  Object.keys(submissionsTableFields).map(function(key, index) {
    sampleData[key] = submissionsTableFields[key].testingSample;
  });
  return sampleData;
};
const requiredFields = [
  "firstName",
  "lastName",
  "dd",
  "mm",
  "yyyy",
  "preferredLanguage",
  "homeStreet",
  "homePostalCode",
  "homeZip",
  "homeState",
  "homeCity",
  "homeEmail",
  "cellPhone",
  "employerName",
  "employerType",
  "agencyNumber",
  "termsAgree",
  "signature"
];
const generateSampleSubmissionFrontEnd = () => {
  const sampleData = {};
  sampleData.submission_id = uuid.v4();
  Object.keys(submissionsTableFields).map(function(key, index) {
    if (requiredFields.includes(submissionsTableFields[key].clientFieldName)) {
      let clientFieldName = submissionsTableFields[key].postgresFieldName;
      sampleData[clientFieldName] = submissionsTableFields[key].testingSample;
    }
  });
  sampleData.birthdate = new Date("1/1/2001");
  sampleData.dd = "01";
  sampleData.mm = "01";
  sampleData.yyyy = "2001";
  sampleData.termsAgree = true;
  return sampleData;
};
const generateSampleValidate = () => {
  const sampleData = {};
  Object.keys(submissionsTableFields).map(function(key, index) {
    if (requiredFields.includes(submissionsTableFields[key].clientFieldName)) {
      let clientFieldName = submissionsTableFields[key].clientFieldName;
      sampleData[clientFieldName] = submissionsTableFields[key].testingSample;
    }
  });
  sampleData.dd = "01";
  sampleData.mm = "01";
  sampleData.yyyy = "2001";
  sampleData.termsAgree = true;
  sampleData.mobilePhone = sampleData.cellPhone;
  sampleData.homePostalCode = sampleData.homeZip;
  delete sampleData.cellPhone;
  return sampleData;
};
const generateSFContactFieldList = () => {
  const fieldList = [];
  Object.keys(contactsTableFields).map(function(key, index) {
    if (contactsTableFields[key].SFTable === "Worker (Contact)") {
      fieldList.push(contactsTableFields[key].SFAPIName);
    }
  });
  return fieldList;
};

// format date for Salesforce JSON parser
const formatDate = date => {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

module.exports = {
  contactsTableFields,
  submissionsTableFields,
  generateSampleSubmission,
  generateSampleSubmissionFrontEnd,
  generateSampleValidate,
  generateSFContactFieldList,
  formatDate
};
