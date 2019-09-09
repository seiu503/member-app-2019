exports.up = function(knex) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        return knex.schema
          .hasColumn("submissions", "payment_type")
          .then(function(exists) {
            if (!exists) {
              return knex.schema.table("submissions", function(table) {
                table.string("payment_type");
                table.decimal("medicaid_residents", 1, 0);
                table.string("member_short_id");
                table.string("member_id");
                table.string("card_adding_url");
                table.string("stripe_customer_id");
                table.string("active_method_last_four");
                table.boolean("payment_method_added");
              });
            }
          });
      }
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.hasTable("submissions").then(function(exists) {
      if (exists) {
        return knex.schema.table("submissions", function(table) {
          table.dropColumn("payment_type");
          table.dropColumn("medicaid_residents");
          table.dropColumn("member_short_id");
          table.dropColumn("member_id");
          table.dropColumn("card_adding_url");
          table.dropColumn("stripe_customer_id");
          table.dropColumn("active_method_last_four");
          table.dropColumn("payment_method_added");
        });
      }
    })
  ]);
};
