const uuid = require("uuid");

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("contacts_submissions")
    .del()
    .then(function() {
      /* ALWAYS SEED CONTACTS AND SUBMISSIONS FIRST, NEED ID'S TO SEED REFERENCE TABLE */
      let contactIdArray, submissionIdArray;
      return knex
        .select("contact_id")
        .from("contacts")
        .then(result => {
          contactIdArray = result;
          return contactIdArray;
        })
        .then(() => {
          return knex
            .select("submission_id")
            .from("submissions")
            .then(result => {
              submissionIdArray = result;
              return submissionIdArray;
            })
            .then(() => {
              // Inserts seed entries
              return knex("contacts_submissions").insert([
                {
                  id: uuid.v4(),
                  contact_id: contactIdArray[0].contact_id,
                  submission_id: submissionIdArray[0].submission_id
                },
                {
                  id: uuid.v4(),
                  contact_id: contactIdArray[0].contact_id,
                  submission_id: submissionIdArray[1].submission_id
                },
                {
                  id: uuid.v4(),
                  contact_id: contactIdArray[1].contact_id,
                  submission_id: submissionIdArray[2].submission_id
                }
              ]);
            });
        });
    });
};
