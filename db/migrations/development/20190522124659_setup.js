exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("users").then(function(exists) {
      if (!exists) {
        return knex.schema.createTable("users", function(table) {
          table.uuid("id").primary();
          table.string("name").notNullable();
          table.string("email").notNullable();
          table.string("avatar_url");
          table.string("google_id").notNullable();
          table.string("google_token").notNullable();
          table.timestamp("created_at").defaultTo(knex.fn.now());
          table.timestamp("updated_at").defaultTo(knex.fn.now());
        });
      }
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("users").then(function(exists) {
      if (exists) {
        return knex.schema.dropTable("users");
      }
    })
  ]);
};
