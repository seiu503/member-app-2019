exports.up = function(knex) {
  return knex.schema.hasTable("content").then(function(exists) {
    if (exists) {
      return knex.schema.hasColumn("content", "id").then(function(exists) {
        if (exists) {
          return knex.schema
            .table("content", function(table) {
              table.dropColumn("id");
            })
            .then(function() {
              return knex.schema.table("content", function(table) {
                table.increments("id").primary();
                table.string("content", 1000).alter();
              });
            });
        }
      });
    }
  });
};

exports.down = function(knex) {
  return knex.schema.hasTable("content").then(function(exists) {
    if (exists) {
      return knex.schema.dropTable("content").then(function() {
        return knex.schema.createTable("content", function(table) {
          table.uuid("id").primary();
          table.string("content_type").notNullable();
          table.string("content").notNullable();
          table.timestamp("created_at").defaultTo(knex.fn.now());
          table.timestamp("updated_at").defaultTo(knex.fn.now());
        });
      });
    } else {
      return knex.schema.createTable("content", function(table) {
        return knex.schema.hasColumn("id").then(function(exists) {
          if (!exists) {
            table.uuid("id").primary();
            table.string("content_type").notNullable();
            table.string("content").notNullable();
            table.timestamp("created_at").defaultTo(knex.fn.now());
            table.timestamp("updated_at").defaultTo(knex.fn.now());
          } else {
            table.string("content_type").notNullable();
            table.string("content").notNullable();
            table.timestamp("created_at").defaultTo(knex.fn.now());
            table.timestamp("updated_at").defaultTo(knex.fn.now());
          }
        });
      });
    }
  });
};
