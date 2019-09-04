exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        return knex.schema.table("submissions", function(table) {
          table.uuid("submission_id").primary();
          table.renameColumn("503_cba_app_date", "seiu503_cba_app_date");
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
          if (table) {
            return table.renameColumn(
              "seiu503_cba_app_date",
              "503_cba_app_date"
            );
            table.dropColumn("submission_id");
          }
        });
      }
    })
  ]);
};
