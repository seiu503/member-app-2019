exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table("submissions", function(table) {
      table.string("work_phone");
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        knex.schema.table("submissions", function(table) {
          table.dropColumn("work_phone");
        });
      }
    })
  ]);
};
