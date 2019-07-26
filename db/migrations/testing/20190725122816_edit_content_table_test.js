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
    knex.schema.hasTable("content").then(function(exists) {
      if (exists) {
        return knex.schema.dropTable("content");
      }
    }),
    knex.schema.hasTable("content").then(function(exists) {
      if (!exists) {
        return knex.schema.createTable("content", function(table) {
          table.uuid("id").primary();
          table.string("content_type").notNullable();
          table.string("content").notNullable();
          table.timestamp("created_at").defaultTo(knex.fn.now());
          table.timestamp("updated_at").defaultTo(knex.fn.now());
        });
      }
    })
  ]);
};
