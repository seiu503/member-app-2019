exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasColumn("content", "id").then(function(exists) {
      if (exists) {
        return knex.schema.table("content", function(table) {
          table.dropColumn("id");
        });
      }
    }),
    knex.schema.hasTable("content").then(function(exists) {
      if (exists) {
        return knex.schema.table("content", function(table) {
          table.increments("id").primary();
          table.string("content", 1000).alter();
        });
      }
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasColumn("content", "id").then(function(exists) {
      if (exists) {
        return knex.schema.table("content", function(table) {
          table.dropColumn("id");
        });
      }
    }),
    knex.schema.hasTable("content").then(function(exists) {
      if (exists) {
        return knex.schema.table("content", function(table) {
          table.uuid("id").primary();
          table.string("content").alter();
        });
      }
    })
  ]);
};
