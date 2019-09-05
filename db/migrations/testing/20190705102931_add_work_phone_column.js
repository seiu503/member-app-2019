exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        return knex.schema
          .hasColumn("submissions", "work_phone")
          .then(function(exists) {
            if (!exists) {
              return knex.schema.table("submissions", function(table) {
                table.string("work_phone");
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
          table.dropColumn("work_phone");
        });
      }
    })
  ]);
};
