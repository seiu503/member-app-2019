exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable("users").then(function(exists) {
      if (exists) {
        return knex.schema.table("users", function(table) {
          table
            .string("email")
            .notNullable()
            .unique()
            .alter();
          table.string("google_id").alter();
          table.string("google_token").alter();
        });
      }
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.hasTable("users").then(function(exists) {
      if (exists) {
        return knex.schema.table("users", function(table) {
          table
            .string("email")
            .notNullable()
            .alter();
          table
            .string("google_id")
            .notNullable()
            .alter();
          table
            .string("google_token")
            .notNullable()
            .alter();
        });
      }
    })
  ]);
};
