const uuid = require("uuid");

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("users")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("users").insert([
        {
          id: uuid.v4(),
          name: "testUser1 lastname",
          email: "testemail1@email.com",
          avatar_url:
            "https://lh6.googleusercontent.com/-ftPn3w388SE/AAAAAAAAAAI/AAAAAAAAA4g/HBmKBz7KLN8/photo.jpg",
          google_id: "12345",
          google_token: "67890"
        },
        {
          id: uuid.v4(),
          name: "testUser2 lastname",
          email: "testemail2@email.com",
          avatar_url:
            "https://lh6.googleusercontent.com/-ftPn3w388SE/AAAAAAAAAAI/AAAAAAAAA4g/HBmKBz7KLN8/photo.jpg",
          google_id: "23456",
          google_token: "78901"
        },
        {
          id: uuid.v4(),
          name: "testUser3 lastname",
          email: "testemail3@email.com",
          avatar_url:
            "https://lh6.googleusercontent.com/-ftPn3w388SE/AAAAAAAAAAI/AAAAAAAAA4g/HBmKBz7KLN8/photo.jpg",
          google_id: "34567",
          google_token: "89012"
        }
      ]);
    });
};
