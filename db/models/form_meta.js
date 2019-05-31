// db/models/form_meta.js

/* ================================= SETUP ================================= */

const uuid = require("uuid");
const { db, TABLES } = require("../../app/config/knex");

/* ============================ PUBLIC METHODS ============================= */

/** Create a form meta record
 *  @param    {String}   form_meta_type Content Type.
 ***  [headline|body_copy|image_url|redirect_url]
 *  @param    {String}   content        Content.
 *  @returns  {Array}    Array of 1 newly-created User object.
 */
const createFormMeta = (form_meta_type, content) => {
  return db
    .insert({ id: uuid.v4(), form_meta_type, content })
    .into(TABLES.FORM_META)
    .returning("*");
};

/** Update a form meta record
 *  @param    {String}   id             The id of the user to update.
 *  @param    {Object}   updates        Key/value pairs of fields to update.
 *  @returns  {Object}   User object.
 */
const updateFormMeta = (id, updates) => {
  return db(TABLES.FORM_META)
    .where({ id })
    .first()
    .update(updates)
    .update("updated_at", db.fn.now())
    .returning("*");
};

/** Get all form meta
 *  @returns   {Array}   Array of form meta objects.
 */

const getFormMeta = () => {
  return db(TABLES.FORM_META).returning("*");
};

/** Get all form meta by type
 *  @returns   {Array}   Array of form meta objects.
 */

const getFormMetaByType = form_meta_type => {
  return db(TABLES.FORM_META)
    .where({ form_meta_type })
    .returning("*");
};

/** Find a form meta record by id
 *  @param    {String}   id   The id of the content to return.
 *  @returns  {Object}        Form meta object.
 */

const getFormMetaById = id => {
  return db(TABLES.FORM_META)
    .where({ id })
    .first()
    .returning("*");
};

/** Delete form meta
 *  @param    {String}   id   The id of the content to delete.
 *  @returns  success message
 */

const deleteFormMeta = id => {
  return db(TABLES.FORM_META)
    .where({ id })
    .del()
    .then(() => {
      // then return success message to client
      return { message: "Content deleted successfully" };
    });
};

/* ================================ exports ================================ */

module.exports = {
  createFormMeta,
  updateFormMeta,
  getFormMeta,
  getFormMetaByType,
  getFormMetaById,
  deleteFormMeta
};
