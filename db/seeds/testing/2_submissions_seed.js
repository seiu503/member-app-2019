const uuid = require("uuid");

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("submissions")
    .del()
    .then(function() {
      /* ALWAYS SEED CONTACTS FIRST, NEED ID'S TO SEED REFERENCE TABLE */
      let contactIdArray;
      return knex
        .select("contact_id")
        .from("contacts")
        .then(function(result) {
          contactIdArray = result;
          return contactIdArray;
        })
        .then(() => {
          // Inserts seed entries
          return knex("submissions").insert([
            {
              submission_id: uuid.v4(),
              ip_address: "192.0.2.0",
              submission_date: new Date("05/02/2018"),
              agency_number: "123456",
              birthdate: new Date("01/02/1999"),
              cell_phone: "123-456-7890",
              employer_name: "employer_name1",
              first_name: "firstname1",
              last_name: "lastname1",
              home_street: "home_street1",
              home_city: "home_city1",
              home_state: "OR",
              home_zip: "12345",
              home_email: "fakeemail1@email.com",
              preferred_language: "English",
              terms_agree: true,
              signature: "http://example.com/signature_1.png",
              text_auth_opt_out: false,
              online_campaign_source: "online_campaign_source1",
              contact_id: contactIdArray[0].contact_id,
              legal_language: "Lorem ipsum dolor sit amet.",
              maintenance_of_effort: new Date("05/02/2019"),
              seiu503_cba_app_date: new Date("05/02/2019"),
              direct_pay_auth: new Date("05/02/2019"),
              direct_deposit_auth: new Date("05/02/2019"),
              immediate_past_member_status: "In Good Standing"
            },

            {
              submission_id: uuid.v4(),
              ip_address: "192.0.2.0",
              submission_date: new Date("05/02/2019"),
              agency_number: "123456",
              birthdate: new Date("01/02/1999"),
              cell_phone: "123-456-7890",
              employer_name: "employer_name1",
              first_name: "firstname1",
              last_name: "lastname1",
              home_street: "home_street2",
              home_city: "home_city2",
              home_state: "OR",
              home_zip: "23456",
              home_email: "fakeemail1@email.com",
              preferred_language: "English",
              terms_agree: true,
              signature: "http://example.com/signature_2.png",
              text_auth_opt_out: false,
              online_campaign_source: "online_campaign_source2",
              contact_id: contactIdArray[0].contact_id,
              legal_language: "Lorem ipsum dolor sit amet.",
              maintenance_of_effort: new Date("05/02/2019"),
              seiu503_cba_app_date: new Date("05/02/2019"),
              direct_pay_auth: new Date("05/02/2019"),
              direct_deposit_auth: new Date("05/02/2019"),
              immediate_past_member_status: "In Good Standing"
            },

            {
              submission_id: uuid.v4(),
              ip_address: "192.0.2.255",
              submission_date: new Date("06/03/2019"),
              agency_number: "34567",
              birthdate: new Date("02/03/2000"),
              cell_phone: "234-567-8901",
              employer_name: "employer_name3",
              first_name: "firstname3",
              last_name: "lastname3",
              home_street: "home_street3",
              home_city: "home_city3",
              home_state: "OR",
              home_zip: "34567",
              home_email: "fakeemail3@email.com",
              preferred_language: "English",
              terms_agree: true,
              signature: "http://example.com/signature_3.png",
              text_auth_opt_out: false,
              online_campaign_source: "online_campaign_source3",
              contact_id: contactIdArray[0].contact_id,
              legal_language: "Lorem ipsum dolor sit amet.",
              maintenance_of_effort: new Date("06/03/2019"),
              seiu503_cba_app_date: new Date("06/03/2019"),
              direct_pay_auth: new Date("06/03/2019"),
              direct_deposit_auth: new Date("06/03/2019"),
              immediate_past_member_status: "In Poor Standing"
            }
          ]);
        });
    });
};
