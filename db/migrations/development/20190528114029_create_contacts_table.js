exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable("contacts", function(table) {
      table.uuid("contact_id").primary();
      table.string("display_name").notNullable();
      table.string("account_name").notNullable();
      table.string("agency_number").notNullable();
      table
        .string("mail_to_city")
        .notNullable()
        .defaultTo("OR");
      table.string("mail_to_state").notNullable();
      table.string("mail_to_street").notNullable();
      table.string("mail_to_postal_code", 5).notNullable();
      table.string("first_name").notNullable();
      table.string("last_name").notNullable();
      table.string("last_name").notNullable();
      table.string("dd", 2).notNullable();
      table.string("mm", 2).notNullable();
      table.string("yyyy", 4).notNullable();
      table.date("dob").notNullable();
      table
        .string("preferred_language")
        .notNullable()
        .defaultTo("english");
      table.string("home_street").notNullable();
      table.string("home_postal_code", 5).notNullable();
      table
        .string("home_state")
        .notNullable()
        .defaultTo("OR");
      table.string("home_city").notNullable();
      table.string("home_email").notNullable();
      table.string("mobile_phone").notNullable();
      table.boolean("text_auth_opt_out").notNullable();
      table.boolean("terms_agree").notNullable();
      table.string("signature").notNullable();
      table.string("online_campaign_source");
      table.boolean("signed_application").notNullable();
      table.string("ethnicity");
      table.boolean("lgbtq_id");
      table.boolean("trans_id");
      table.boolean("disability_id");
      table.boolean("deaf_or_hard_of_hearing");
      table.boolean("blind_or_visually_impaired");
      table.string("gender");
      table.string("gender_other_description");
      table.string("gender_pronoun");
      table.string("job_title").notNullable();
      table.date("hire_date").notNullable();
      table.string("worksite").notNullable();
      table.string("work_email").notNullable();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable("contacts")]);
};
