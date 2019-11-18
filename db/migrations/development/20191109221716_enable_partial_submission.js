exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        return knex.schema.table("submissions", function(table) {
          table.date("birthdate").alter();
          table.string("cell_phone").alter();
          table.string("employer_name").alter();
          table.string("home_street").alter();
          table.string("home_city").alter();
          table.string("home_state").alter();
          table.string("home_zip").alter();
          table.string("preferred_language").alter();
          table.string("terms_agree").alter();
          table.string("signature").alter();
          table.text("legal_language").alter();
          table.date("maintenance_of_effort").alter();
          table.date("seiu503_cba_app_date").alter();
        });
      }
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        return knex.schema.table("submissions", function(table) {
          table
            .date("birthdate")
            .notNullable()
            .alter();
          table
            .string("cell_phone")
            .notNullable()
            .alter();
          table
            .string("employer_name")
            .notNullable()
            .alter();
          table
            .string("home_street")
            .notNullable()
            .alter();
          table
            .string("home_city")
            .notNullable()
            .alter();
          table
            .string("home_state")
            .notNullable()
            .alter();
          table
            .string("home_zip")
            .notNullable()
            .alter();
          table
            .text("preferred_language")
            .notNullable()
            .alter();
          table
            .string("terms_agree")
            .notNullable()
            .alter();
          table
            .string("signature")
            .notNullable()
            .alter();
          table
            .string("legal_language")
            .notNullable()
            .alter();
          table
            .date("maintenance_of_effort")
            .notNullable()
            .alter();
          table
            .date("seiu503_cba_app_date")
            .notNullable()
            .alter();
        });
      }
    })
  ]);
};
