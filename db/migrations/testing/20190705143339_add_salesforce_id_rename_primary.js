exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table("submissions", function(table) {
      table.uuid("salesforce_id").notNullable().unique;
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
