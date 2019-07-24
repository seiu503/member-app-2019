exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        knex.schema.table("submissions", function(table) {
          table.string("mail_to_city");
          table.string("mail_to_state");
          table.string("mail_to_street");
          table.string("mail_to_postal_code");
          table.string("ethnicity");
          table.boolean("lgbtq_id");
          table.boolean("trans_id");
          table.boolean("disability_id");
          table.boolean("deaf_or_hard_of_hearing");
          table.boolean("blind_or_visually_impaired");
          table.string("gender");
          table.string("gender_other_description");
          table.string("gender_pronoun");
          table.string("job_title");
          table.date("hire_date");
          table.string("worksite");
          table.string("work_email");
        });
      }
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        knex.schema.table("submissions", function(table) {
          table.dropColumn("mail_to_city");
          table.dropColumn("mail_to_state");
          table.dropColumn("mail_to_street");
          table.dropColumn("mail_to_postal_code");
          table.dropColumn("ethnicity");
          table.dropColumn("lgbtq_id");
          table.dropColumn("trans_id");
          table.dropColumn("disability_id");
          table.dropColumn("deaf_or_hard_of_hearing");
          table.dropColumn("blind_or_visually_impaired");
          table.dropColumn("gender");
          table.dropColumn("gender_other_description");
          table.dropColumn("gender_pronoun");
          table.dropColumn("job_title");
          table.dropColumn("hire_date");
          table.dropColumn("worksite");
          table.dropColumn("work_email");
        });
      }
    })
  ]);
};
