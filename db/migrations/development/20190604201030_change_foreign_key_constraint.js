exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table("contacts_submissions", function(table) {
      table.dropForeign("contact_id");
      table.dropForeign("submission_id");
    }),
    knex.schema.table("contacts_submissions", function(table) {
      table
        .foreign("contact_id")
        .references("contacts.contact_id")
        .onDelete("CASCADE");
      table
        .foreign("submission_id")
        .references("submissions.submission_id")
        .onDelete("CASCADE");
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table("contacts_submissions", function(table) {
      table.dropForeign("contact_id");
      table.dropForeign("submission_id");
    }),
    knex.schema.table("contacts_submissions", function(table) {
      table.foreign("contact_id").references("contacts.contact_id");
      table.foreign("submission_id").references("submissions.submission_id");
    })
  ]);
};
