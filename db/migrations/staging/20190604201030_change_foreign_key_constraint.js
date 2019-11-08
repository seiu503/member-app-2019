exports.up = function(knex) {
  return knex.schema
    .hasTable("contacts_submissions")
    .then(function(exists) {
      if (exists) {
        return knex.schema
          .hasColumn("contacts_submissions", "contact_id")
          .then(function(exists) {
            return knex.schema.table("contacts_submissions", function(table) {
              table.dropForeign("contact_id");
              table.dropForeign("submission_id");
            });
          });
      }
    })
    .then(function() {
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
    });
};

exports.down = function(knex) {
  return knex.schema.hasTable("contacts_submissions").then(function(exists) {
    if (exists) {
      return knex.schema
        .hasColumn("contacts_submissions", "contact_id")
        .then(function(exists) {
          if (exists) {
            return knex.schema.table("contacts_submissions", function(table) {
              table.dropForeign("contact_id");
              table.dropForeign("submission_id");
              table.foreign("contact_id").references("contacts.contact_id");
              table
                .foreign("submission_id")
                .references("submissions.submission_id");
            });
          }
        });
    }
  });
};
