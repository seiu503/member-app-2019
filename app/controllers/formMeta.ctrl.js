/*
   Route handlers for fetching and updating form meta.
*/

/* ================================= SETUP ================================= */

// import model
const formMeta = require("../../db/models/form_meta");

/* ============================ ROUTE HANDLERS ============================= */

/** Create a new form meta record
 *  @param    {String}   form_meta_type  Content type
 ***  [headline|body_copy|image_url|redirect_url].
 *  @param    {String}   content         Content.
 *  @returns  {Object}                   New form meta object OR error message.
 */
const createFormMeta = (req, res, next) => {
  const { form_meta_type, content } = req.body;
  if (form_meta_type && content) {
    return formMeta
      .createFormMeta(form_meta_type, content)
      .then(records => {
        const record = records[0];
        res.status(200).json(record);
      })
      .catch(err => {
        console.log(`formMeta.ctrl.js > 28: ${err}`);
        res.status(500).json({ message: err.message });
      });
  } else {
    return res
      .status(500)
      .json({ message: "There was an error creating the form meta" });
  }
};

/** Update an existing form meta record
 *  @param    {String}   id        Id of record to update.
 *  @param    {Object}   updates   Key/value pairs for fields to update.
 *  @returns  {Object}             Updated form meta object OR error message.
 */
const updateFormMeta = (req, res, next) => {
  const { updates } = req.body;
  const { id } = req.params;
  if (!updates || !Object.keys(updates).length) {
    return res.status(404).json({ message: "No updates submitted" });
  }

  return formMeta
    .updateFormMeta(id, updates)
    .then(record => {
      if (record.message || !record) {
        return res.status(404).json({
          message:
            record.message ||
            "An error occured while trying to update this content"
        });
      } else {
        return res.status(200).json(record);
      }
    })
    .catch(err => res.status(500).json({ message: err.message }));
};

/** Delete form meta
 *  @param    {String}   id   Id of the content to delete.
 *  @returns  Success or error message.
 */
const deleteFormMeta = (req, res, next) => {
  return formMeta
    .deleteFormMeta(req.params.id)
    .then(result => {
      if (result.message === "Content deleted successfully") {
        return res.status(200).json({ message: result.message });
      } else {
        return res.status(404).json({
          message: "An error occurred and the content was not deleted."
        });
      }
    })
    .catch(err => res.status(404).json({ message: err.message }));
};

/** Get all form meta content
 *  @returns  {Array|Object}   Array of form meta objects OR error message
 */
const getFormMeta = () => {
  return formMeta
    .getFormMeta()
    .then(records => res.status(200).json(records))
    .catch(err => res.status(404).json({ message: err.message }));
};

/** Get one form meta record by id
 *  @param    {String}   id   Id of the requested content.
 *  @returns  {Object}        User object OR error message.
 */
const getFormMetaById = (req, res, next) => {
  return formMeta
    .getFormMetaById(req.params.id)
    .then(record => {
      if (!record || record.message) {
        return res
          .status(404)
          .json({ message: record.message || "Content not found" });
      } else {
        res.status(200).json(record);
      }
    })
    .catch(err => res.status(404).json({ message: err.message }));
};

/** Get all form meta of a certain type
 *  @param    {String}   form_meta_type   Type of the requested content.
 *  @returns  {Array|Object}   Array of form meta objects OR error message
 */
const getFormMetaByType = (req, res, next) => {
  return formMeta
    .getFormMetaByType(req.params.form_meta_type)
    .then(records => {
      if (!records || !records.length || records.message) {
        return res
          .status(404)
          .json({ message: records.message || "Content not found" });
      } else {
        res.status(200).json(records);
      }
    })
    .catch(err => res.status(404).json({ message: err.message }));
};

/* ================================ EXPORT ================================= */

module.exports = {
  createFormMeta,
  updateFormMeta,
  getFormMeta,
  getFormMetaByType,
  getFormMetaById,
  deleteFormMeta
};
