exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        return knex.schema.table("submissions", function(table) {
          table.renameColumn("503_cba_app_date", "seiu503_cba_app_date");
          // table.uuid("submission_id").primary();
        });
      }
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        return knex.schema.table("submissions", function(table) {
          if (table) {
            return table.renameColumn(
              "seiu503_cba_app_date",
              "503_cba_app_date"
            );
            // table.dropColumn("submission_id");
          }
        });
      }
    })
  ]);
};
