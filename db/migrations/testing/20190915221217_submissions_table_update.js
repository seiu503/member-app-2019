exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        return knex.schema.table("submissions", function(table) {
          table.string("submission_status");
          table.text("submission_errors");
          table.string("card_brand");
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
          table.dropColumn("submission_status");
          table.dropColumn("submission_errors");
          knex.schema.hasColumn("card_brand").then(function(exists) {
            if (exists) {
              table.dropColumn("card_brand");
            }
          });
        });
      }
    })
  ]);
};
