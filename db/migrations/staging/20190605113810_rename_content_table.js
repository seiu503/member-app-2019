exports.up = function(knex) {
  return knex.schema
    .hasTable("form_meta")
    .then(function(exists) {
      if (exists) {
        return knex.schema.hasTable("content").then(function(exists) {
          if (!exists) {
            return knex.schema.renameTable("form_meta", "content");
          }
        });
      }
    })
    .then(function() {
      knex.schema.hasColumn("content", "form_meta_type").then(function(exists) {
        if (exists) {
          return knex.schema.table("content", function(t) {
            t.renameColumn("form_meta_type", "content_type");
          });
        }
      });
    });
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.hasTable("content").then(function(exists) {
      if (exists) {
        return knex.schema.alterTable("content", function(t) {
          t.renameColumn("content_type", "form_meta_type");
        });
      }
    }),
    knex.schema.hasTable("form_meta").then(function(exists) {
      if (!exists) {
        return knex.schema.renameTable("content", "form_meta");
      }
    })
  ]);
};
