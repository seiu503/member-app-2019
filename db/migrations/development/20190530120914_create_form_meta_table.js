exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("form_meta").then(function(exists) {
      if (!exists) {
        knex.schema.createTable("form_meta", function(table) {
          table.uuid("id").primary();
          table.string("form_meta_type").notNullable();
          table.string("content").notNullable();
          table.timestamp("created_at").defaultTo(knex.fn.now());
          table.timestamp("updated_at").defaultTo(knex.fn.now());
        });
      }
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("form_meta").then(function(exists) {
      if (exists) {
        knex.schema.dropTable("form_meta");
      }
    })
  ]);
};
