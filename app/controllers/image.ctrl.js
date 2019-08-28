/*
   Route handler for image uploads to / deletes from AWS S3 storage.
*/

/* ================================= SETUP ================================= */

const multer = require("multer");
const content = require("../../db/models/content");
const { Uploader } = require("../utils/multer.js");
const aws = require("aws-sdk");
const s3config = require("../config/aws");
let S3 = new aws.S3(s3config);

/** Upload a single image
 *  @param    {File}   file            Uploaded file.
 *  @returns  {Object}                 Image name and URL OR error message.
 */
exports.singleImgUpload = async (req, res, next) => {
  // upload image to s3 bucket
  const uploader = new Uploader();
  uploader
    .startUpload(req, res, next)
    .then(() => {
      // console.log(`image.ctrl.js > 24`);
      // console.log(req.file);
      if (!req.file) {
        // console.log(`image.ctrl.js > 27`);
        // console.log("No file found");
        return res.status(500).json({
          message: "No file attached. Please choose a file."
        });
      }
      // generate url of uploaded image
      const imageUrl = `https://${s3config.bucket}.s3-${
        s3config.region
      }.amazonaws.com/${req.file.originalname}`;
      // check if apiCall is for admin image or user signature image
      if (req.file.originalname.includes("__signature__")) {
        return res.status(200).json({ content: imageUrl });
      }
      // check if we're creating a new DB record or updating existing
      if (req.body.id) {
        // update existing record
        const updates = {
          content_type: "image",
          content: imageUrl
        };
        content
          .updateContent(req.body.id, updates)
          .then(records => {
            return res.status(200).json(records[0]);
          })
          .catch(err => {
            // console.log(`image.ctrl.js > 53: ${err}`);
            return res.status(500).json({ message: err.message });
          });
      } else {
        // create new record in postgres DB
        content
          .newContent("image", imageUrl)
          .then(records => {
            return res.status(200).json(records[0]);
          })
          .catch(err => {
            // console.log(`image.ctrl.js > 64: ${err}`);
            return res.status(500).json({ message: err.message });
          });
      }
    })
    .catch(err => {
      if (err instanceof multer.MulterError) {
        // console.log(`image.ctrl.js > 71: ${err}`);
        return res.status(500).json({
          message: err.message
        });
      }
      // console.log(`image.ctrl.js > 76: ${err}`);
      return res.status(500).json({ message: err.message });
    });
};

/**
 * Delete file from S3 bucket
 */
exports.deleteImage = async (req, res, next) => {
  const params = { Bucket: s3config.bucket, Key: req.params.key };
  S3 = new aws.S3(s3config);
  try {
    await S3.deleteObject(params);
    return res.status(200).json({ message: "Image deleted." });
  } catch (err) {
    // console.log(`image.ctrl.js > 91: ${err});
    return res.status(500).json({
      message: err.message
    });
  }
};
