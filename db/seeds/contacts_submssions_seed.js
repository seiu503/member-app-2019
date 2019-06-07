const uuid = require("uuid");

exports.seed = function(knex, Promise) {
  /* ALWAYS SEED CONTACTS AND SUBMISSIONS FIRST, NEED ID'S TO SEED REFERENCE TABLE */
  const contactIdArray = async () => {
    return await knex.select("contact_id").from("contacts");
  };

  const submissionIdArray = async () => {
    return await knex.select("submission_id").from("submissions");
  };

  // Deletes ALL existing entries
  return knex("contacts_submissions")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("contacts_submissions").insert([
        {
          id: uuid.v4(),
          contact_id: contactIdArray[0].contact_id,
          submision_id: submissionIdArray[0].submission_id
        },
        {
          id: uuid.v4(),
          contact_id: contactIdArray[0].contact_id,
          submision_id: submissionIdArray[1].submission_id
        },
        {
          id: uuid.v4(),
          contact_id: contactIdArray[1].contact_id,
          submision_id: submissionIdArray[2].submission_id
        }
      ]);
    });
};
