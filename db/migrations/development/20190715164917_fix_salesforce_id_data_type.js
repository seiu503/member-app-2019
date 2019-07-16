exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table("submissions", function(table) {
      table
        .string("salesforce_id")
        .notNullable()
        .alter();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table("submissions", function(table) {
      table
        .uuid("salesforce_id")
        .notNullable()
        .unique.alter();
    })
  ]);
};
