// db/models/content.js

/* ================================= SETUP ================================= */

import uuid from "uuid";
import { db, TABLES } from "../../app/config/knexConfig.js";

/* ============================ PUBLIC METHODS ============================= */

/** Create a content record
 *  @param    {String}   content_type Content Type.
 ***  [headline|body_copy|image_url|redirect_url]
 *  @param    {String}   content        Content.
 *  @returns  {Array}    Array of 1 newly-created Content object.
 */
const newContent = (content_type, content) => {
  return db
    .insert({ content_type, content })
    .into(TABLES.CONTENT)
    .returning("*");
};

/** Update a content record
 *  @param    {String}   id             The id of the user to update.
 *  @param    {Object}   updates        Key/value pairs of fields to update.
 *  @returns  {Object}   User object.
 */
const updateContent = (id, updates) => {
  return db(TABLES.CONTENT)
    .where({ id })
    .first()
    .update(updates)
    .update("updated_at", db.fn.now())
    .returning("*");
};

/** Get all content
 *  @returns   {Array}   Array of content objects.
 */

const getContent = () => {
  return db(TABLES.CONTENT)
    .orderBy("updated_at", "desc")
    .returning("*");
};

/** Get all content by type
 *  @returns   {Array}   Array of content objects.
 */

const getContentByType = content_type => {
  return db(TABLES.CONTENT)
    .where({ content_type })
    .orderBy("updated_at", "desc")
    .returning("*");
};

/** Find a content record by id
 *  @param    {String}   id   The id of the content to return.
 *  @returns  {Object}        Content object.
 */

const getContentById = id => {
  return db(TABLES.CONTENT)
    .where({ id })
    .first()
    .returning("*");
};

/** Delete content
 *  @param    {String}   id   The id of the content to delete.
 *  @returns  success message
 */

const deleteContent = id => {
  return db(TABLES.CONTENT)
    .where({ id })
    .del()
    .then(() => {
      // then return success message to client
      return { message: "Content deleted successfully" };
    });
};

/* ================================ exports ================================ */

export default {
  newContent,
  updateContent,
  getContent,
  getContentByType,
  getContentById,
  deleteContent
};
