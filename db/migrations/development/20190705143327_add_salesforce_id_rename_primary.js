exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table("submissions", function(table) {
      table.string("salesforce_id").notNullable();
      table.renameColumn("submission_id", "id");
      table.dropColumn("contact_id");
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table("submissions", function(table) {
      table.dropColumn("salesforce_id");
      table.renameColumn("id", "submission_id");
      table.uuid("contact_id");
    })
  ]);
};
