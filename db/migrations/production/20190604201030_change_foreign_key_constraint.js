exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("contacts_submissions").then(function(exists) {
      if (exists) {
        return knex.schema.table("contacts_submissions", function(table) {
          table.dropForeign("contact_id");
          table.dropForeign("submission_id");
        });
      }
      return knex.schema.table("contacts_submissions", function(table) {
        table
          .foreign("contact_id")
          .references("contacts.contact_id")
          .onDelete("CASCADE");
        table
          .foreign("submission_id")
          .references("submissions.submission_id")
          .onDelete("CASCADE");
      });
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("contacts_submissions").then(function(exists) {
      if (exists) {
        knex.schema
          .hasColumn("contacts_submissions", "contact-id")
          .then(function(exists) {
            return knex.schema.table("contacts_submissions", function(table) {
              table.dropForeign("contact_id");
              table.dropForeign("submission_id");
              table.foreign("contact_id").references("contacts.contact_id");
              table
                .foreign("submission_id")
                .references("submissions.submission_id");
            });
          });
      }
    })
  ]);
};