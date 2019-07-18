exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("contacts").then(function(exists) {
      if (!exists) {
        return knex.schema.createTable("contacts", function(table) {
          table.uuid("contact_id").primary();
          table.string("display_name");
          table.string("account_name").notNullable();
          table.string("agency_number").notNullable();
          table.string("mail_to_city");
          table.string("mail_to_state");
          table.string("mail_to_street");
          table.string("mail_to_postal_code", 5);
          table.string("first_name").notNullable();
          table.string("last_name").notNullable();
          table.string("dd", 2);
          table.string("mm", 2);
          table.string("yyyy", 4);
          table.date("dob").notNullable();
          table.string("preferred_language").notNullable();
          table.string("home_street").notNullable();
          table.string("home_postal_code", 5).notNullable();
          table.string("home_state").notNullable();
          table.string("home_city").notNullable();
          table.string("home_email").notNullable();
          table.string("mobile_phone").notNullable();
          table.boolean("text_auth_opt_out").notNullable();
          table.boolean("terms_agree").notNullable();
          table.string("signature").notNullable();
          table.string("online_campaign_source");
          table.boolean("signed_application");
          table.string("ethnicity");
          table.boolean("lgbtq_id");
          table.boolean("trans_id");
          table.boolean("disability_id");
          table.boolean("deaf_or_hard_of_hearing");
          table.boolean("blind_or_visually_impaired");
          table.string("gender");
          table.string("gender_other_description");
          table.string("gender_pronoun");
          table.string("job_title");
          table.date("hire_date");
          table.string("worksite");
          table.string("work_email");
          table.timestamp("created_at").defaultTo(knex.fn.now());
          table.timestamp("updated_at").defaultTo(knex.fn.now());
        });
      }
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("contacts").then(function(exists) {
      if (exists) {
        knex.schema.dropTable("contacts");
      }
    })
  ]);
};
