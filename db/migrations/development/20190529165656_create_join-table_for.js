exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable("contacts_submissions", function(table) {
      table.uuid("id").primary();
      table.string("contact_id").references("contacts.contact_id");
      table.string("submission_id").references("submissions.submission_id");
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable("contacts_submissions")]);
};
