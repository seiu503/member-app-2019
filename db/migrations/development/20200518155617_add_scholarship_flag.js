exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        return knex.schema.table("submissions", function(table) {
          table.boolean("scholarship_flag");
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
          table.dropColumn("scholarship_flag");
        });
      }
    })
  ]);
};
