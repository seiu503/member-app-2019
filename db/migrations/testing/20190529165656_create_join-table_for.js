exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable("contacts_submissions").then(function(exists) {
      if (!exists) {
        return knex.schema
          .hasColumn("submissions", "submission_id")
          .then(function(exists) {
            if (exists) {
              return knex.schema.createTable("contacts_submissions", function(
                table
              ) {
                table.uuid("id").primary();
                table.uuid("contact_id").references("contacts.contact_id");
                table
                  .uuid("submission_id")
                  .references("submissions.submission_id");
              });
            }
          });
      }
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.hasTable("contacts_submissions").then(function(exists) {
      if (exists) {
        return knex.schema.dropTable("contacts_submissions");
      }
    })
  ]);
};
