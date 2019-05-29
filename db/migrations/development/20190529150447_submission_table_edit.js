exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table("submissions", function(table) {
      table.renameColumn("503_cba_app_date", "seiu503_cba_app_date");
    })
  ]);
};

exports.down = function(knex, Promise) {};
