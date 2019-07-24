exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table("submissions", function(table) {
      table
        .text("legal_language")
        .notNullable()
        .alter();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        knex.schema.table("submissions", function(table) {
          table
            .string("legal_language")
            .notNullable()
            .alter();
        });
      }
    })
  ]);
};
