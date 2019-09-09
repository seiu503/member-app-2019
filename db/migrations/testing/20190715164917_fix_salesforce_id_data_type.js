exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        return knex.schema
          .hasColumn("submissions", "salesforce_id")
          .then(function(exists) {
            if (exists) {
              return knex.schema.table("submissions", function(table) {
                table
                  .string("salesforce_id")
                  .notNullable()
                  .alter();
              });
            }
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
            .uuid("salesforce_id")
            .notNullable()
            .unique()
            .alter();
        });
      }
    })
  ]);
};
