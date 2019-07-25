exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (!exists) {
        return knex.schema.createTable("submissions", function(table) {
          table.uuid("submission_id").primary();
          table.string("ip_address").notNullable();
          table.date("submission_date").notNullable();
          table.string("agency_number");
          table.date("birthdate").notNullable();
          table.string("cell_phone").notNullable();
          table.string("employer_name").notNullable();
          table.string("first_name").notNullable();
          table.string("last_name").notNullable();
          table.string("home_street").notNullable();
          table.string("home_city").notNullable();
          table.string("home_state").notNullable();
          table.string("home_zip").notNullable();
          table.string("home_email").notNullable();
          table.string("preferred_language").notNullable();
          table.string("terms_agree").notNullable();
          table.string("signature").notNullable();
          table.string("text_auth_opt_out");
          table.string("online_campaign_source");
          table.string("contact_id");
          table.string("legal_language").notNullable();
          table.date("maintenance_of_effort").notNullable();
          table.date("seiu503_cba_app_date").notNullable();
          table.date("direct_pay_auth");
          table.date("direct_deposit_auth");
          table.string("immediate_past_member_status");
          table.timestamp("created_at").defaultTo(knex.fn.now());
          table.timestamp("updated_at").defaultTo(knex.fn.now());
        });
      }
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        return knex.schema.dropTable("submissions");
      }
    })
  ]);
};
