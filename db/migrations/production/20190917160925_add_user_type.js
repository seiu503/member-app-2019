exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable("users").then(function(exists) {
      if (exists) {
        return knex.schema.table("users", function(table) {
          table.string("type");
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
          table.dropColumn("type");
        });
      }
    })
  ]);
};
