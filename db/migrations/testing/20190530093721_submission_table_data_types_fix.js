exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        return knex.schema.table("submissions", function(table) {
          table
            .boolean("terms_agree")
            .notNullable()
            .alter();
          table.boolean("text_auth_opt_out").alter();
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
            .string("terms_agree")
            .notNullable()
            .alter();
          table.string("text_auth_opt_out").alter();
        });
      }
    })
  ]);
};
