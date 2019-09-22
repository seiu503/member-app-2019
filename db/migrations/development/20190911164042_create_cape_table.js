exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable("cape", function(table) {
      table.uuid("id").primary();
      table.string("ip_address").notNullable();
      table.date("submission_date").notNullable();
      table.string("cell_phone").notNullable();
      table.string("job_title").notNullable();
      table.string("first_name").notNullable();
      table.string("last_name").notNullable();
      table.string("home_street").notNullable();
      table.string("home_city").notNullable();
      table.string("home_state").notNullable();
      table.string("home_zip").notNullable();
      table.string("home_email").notNullable();
      table.string("online_campaign_source");
      table.string("contact_id").notNullable();
      table.string("employer_id").notNullable();
      table.text("cape_legal").notNullable();
      table.string("payment_method").notNullable();
      table.string("donation_frequency").notNullable();
      table.string("member_short_id");
      table.decimal("cape_amount").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.hasTable("cape").then(function(exists) {
      if (exists) {
        return knex.schema.dropTable("cape");
      }
    })
  ]);
};
