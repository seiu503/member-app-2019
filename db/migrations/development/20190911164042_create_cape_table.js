exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable("cape", function(table) {
      table.string("ip_address").notNullable();
      table.date("submission_date").notNullable();
      table.string("agency_number");
      table.date("birthdate").notNullable();
      table.string("cell_phone").notNullable();
      table.string("employer_name").notNullable();
      table.string("occupation").notNullable();
      table.string("first_name").notNullable();
      table.string("last_name").notNullable();
      table.string("home_street").notNullable();
      table.string("home_city").notNullable();
      table.string("home_state").notNullable();
      table.string("home_zip").notNullable();
      table.string("home_email").notNullable();
      table.string("online_campaign_source");
      table.string("contact_id").notNullable();
      table.string("cape_legal").notNullable();
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
