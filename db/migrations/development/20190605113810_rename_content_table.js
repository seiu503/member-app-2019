exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("form_meta").then(function(exists) {
      if (exists) {
        knex.schema.renameTable("form_meta", "content"),
          knex.schema.alterTable("content", function(t) {
            t.renameColumn("form_meta_type", "content_type");
          });
      }
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("content").then(function(exists) {
      if (exists) {
        knex.schema.alterTable("content", function(t) {
          t.renameColumn("content_type", "form_meta_type");
        }),
          knex.schema.renameTable("content", "form_meta");
      }
    })
  ]);
};
