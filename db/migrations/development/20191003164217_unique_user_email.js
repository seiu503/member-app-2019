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
            .date("email")
            .notNullable()
            .alter();
        });
      }
    })
  ]);
};
