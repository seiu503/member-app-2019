/*
   Route handlers for fetching and updating content.
*/

/* ================================= SETUP ================================= */

// import model
const contentModel = require("../../db/models/content");

/* ============================ ROUTE HANDLERS ============================= */

/** Create a new content record
 *  @param    {String}   content_type  Content type
 ***  [headline|body_copy|image_url|redirect_url].
 *  @param    {String}   content         Content.
 *  @param    {String}   userType        Type of user making request.
 *  @returns  {Object}                   New content object OR error message.
 */
const createContent = (req, res, next) => {
  const { content_type, content } = req.body;
  const userType = req.user.type;
  if (!userType || (userType !== "admin" && userType !== "edit")) {
    return res.status(500).json({
      message:
        "You do not have permission to do this. Please Consult an administrator."
    });
  }
  if (!content_type || !content) {
    return res.status(422).json({ message: "Missing required field." });
  }
  return contentModel
    .newContent(content_type, content)
    .then(records => {
      const record = records[0];
      res.locals.testData = record;
      res.status(200).json(record);
    })
    .catch(err => {
      // console.log(`content.ctrl.js > 28: ${err}`);
      res.status(500).json({ message: err.message });
    });
};

/** Update an existing content record
 *  @param    {String}   id        Id of record to update.
 *  @param    {Object}   updates   Key/value pairs for fields to update.
 *  @param    {String}   userType  Type of user making request.
 *  @returns  {Object}             Updated content object OR error message.
 */
const updateContent = (req, res, next) => {
  const { updates } = req.body;
  const { id } = req.params;
  const userType = req.user.type;
  if (!userType || (userType !== "admin" && userType !== "edit")) {
    return res.status(500).json({
      message:
        "You do not have permission to do this. Please Consult an administrator."
    });
  }
  if (!id) {
    return res.status(422).json({ message: "No Id Provided in URL" });
  }
  if (!updates || !Object.keys(updates).length) {
    return res.status(422).json({ message: "No updates submitted" });
  }
  return contentModel
    .updateContent(id, updates)
    .then(record => {
      if (record.message || !record) {
        return res.status(404).json({
          message:
            record.message ||
            "An error occurred while trying to update this content"
        });
      } else {
        res.locals.testData = record[0];
        return res.status(200).json(record);
      }
    })
    .catch(err => {
      // console.log(`content.ctrl.js > 69: ${err.message}`);
      res.status(500).json({ message: err.message });
    });
};

/** Delete content
 *  @param    {String}   id         Id of the content to delete.
 *  @param    {String}   userType   Type of user making request.
 *  @returns  Success or error message.
 */
const deleteContent = (req, res, next) => {
  const userType = req.user.type;
  if (!userType || (userType !== "admin" && userType !== "edit")) {
    return res.status(500).json({
      message:
        "You do not have permission to do this. Please Consult an administrator."
    });
  }
  return contentModel
    .deleteContent(req.params.id)
    .then(result => {
      if (result.message === "Content deleted successfully") {
        return res.status(200).json({ message: result.message });
      } else {
        return res.status(404).json({
          message: "An error occurred and the content was not deleted."
        });
      }
    })
    .catch(err => res.status(500).json({ message: err.message }));
};

/** Get all content
 *  @returns  {Array|Object}   Array of content objects OR error message
 */
const getContent = (req, res, next) => {
  const userType = req.user.type;
  console.log(`content.ctrl.js > userType: ${userType}`);
  console.log(req.user);
  if (!userType || (userType !== "admin" && userType !== "edit")) {
    return res.status(500).json({
      message:
        "You do not have permission to do this. Please Consult an administrator."
    });
  }
  return contentModel
    .getContent()
    .then(records => {
      res.locals.testData = records;
      return res.status(200).json(records);
    })
    .catch(err => {
      console.log(`content.ctrl.js > 130: ${err.message}`);
      res.status(500).json({ message: err.message });
    });
};

/** Get one content record by id
 *  @param    {String}   id         Id of the requested content.
 *  @returns  {Object}        User object OR error message.
 */
const getContentById = (req, res, next) => {
  return contentModel
    .getContentById(req.params.id)
    .then(record => {
      if (!record || record.message) {
        return res
          .status(404)
          .json({ message: record.message || "Content not found" });
      } else {
        res.locals.testData = record;
        return res.status(200).json(record);
      }
    })
    .catch(err => res.status(500).json({ message: err.message }));
};

/** Get all content of a certain type
 *  @param    {String}   userType       Type of user making request.
 *  @param    {String}   content_type   Type of the requested content.
 *  @returns  {Array|Object}   Array of content objects OR error message
 */
const getContentByType = (req, res, next) => {
  const userType = req.user.type;
  if (!userType || (userType !== "admin" && userType !== "edit")) {
    return res.status(500).json({
      message:
        "You do not have permission to do this. Please Consult an administrator."
    });
  }
  return contentModel
    .getContentByType(req.params.content_type)
    .then(records => {
      console.log("content.ctrl.js > 174");
      if (!records || !records.length || records.message) {
        return res
          .status(404)
          .json({
            message:
              records && records.message ? records.message : "Content not found"
          });
      } else {
        res.locals.testData = records;
        return res.status(200).json(records);
      }
    })
    .catch(err => res.status(500).json({ message: err.message }));
};

/* ================================ EXPORT ================================= */

module.exports = {
  createContent,
  updateContent,
  getContent,
  getContentByType,
  getContentById,
  deleteContent
};
