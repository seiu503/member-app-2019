exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table("submissions", function(table) {
      table
        .boolean("terms_agree")
        .notNullable()
        .alter();
      table.boolean("text_auth_opt_out").alter();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        knex.schema.table("submissions", function(table) {
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
