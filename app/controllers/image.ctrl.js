/*
   Route handler for image uploads to / deletes from AWS S3 storage.
*/

/* ================================= SETUP ================================= */

// import model
const content = require("../../db/models/content");

const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const multer = require("multer");
const MulterWrapper = require("../utils/multer.js");
const path = require("path");
const url = require("url");

const s3config = require("../config/aws");
const s3 = new aws.S3(s3config);

/**
 * Upload to s3 bucket with multer
 */
const upload = MulterWrapper.multer({
  storage: multerS3({
    s3: s3,
    bucket: s3config.bucket,
    acl: "public-read",
    key: function(req, file, cb) {
      cb(
        null,
        path.basename(
          file.originalname,
          `${path.extname(file.originalname)}-${Date.now()}${path.extname(
            file.originalname
          )}`
        )
      );
    }
  }),
  limits: { fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
  fileFilter: function(req, file, cb) {
    checkFile(file, cb);
  }
}).single("image");

/**
 * Check File Type
 * @param file
 * @param cb
 * @return {*}
 */
const checkFile = (file, cb) => {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb({
      message: "Error: Only jpeg, jpg, png, and gif files accepted."
    });
  }
};

/** Upload a single image
 *  @param    {File}   file            Uploaded file.
 *  @returns  {Object}                 Image name and URL OR error message.
 */
const singleImgUpload = (req, res, next) => {
  upload(req, res, err => {
    // console.log(req.file);
    // upload image to s3 bucket
    if (err instanceof multer.MulterError) {
      // console.log(`image.ctrl.js > 78`);
      // console.log(err);
      return res.status(500).json({
        message: err.message
      });
    }
    if (err) {
      // console.log(`image.ctrl.js > 85`);
      // console.log(err);
      return res.status(500).json({
        message: err.message
      });
    }
    if (!req.file) {
      // console.log(`image.ctrl.js > 92`);
      // console.log("No file found");
      return res.status(500).json({
        message: "No file attached. Please choose a file."
      });
    } else {
      // generate url of uploaded image
      const imageUrl = `https://${s3config.bucket}.s3-${
        s3config.region
      }.amazonaws.com/${req.file.originalname}`;
      // check if apiCall is for admin image or user signature image
      if (req.file.originalname.includes("__signature__")) {
        return res.status(200).json(imageUrl);
      }
      // check if we're creating a new DB record or updating existing
      if (req.body.id) {
        // update existing record
        const updates = {
          content_type: "image",
          content: imageUrl
        };
        return content
          .updateContent(req.body.id, updates)
          .then(records => {
            const record = records[0];
            res.status(200).json(record);
          })
          .catch(err => {
            // console.log(`imageUpload.ctrl.js > 109: ${err}`);
            res.status(500).json({ message: err.message });
          });
      } else {
        // create new record in postgres DB
        return content
          .newContent("image", imageUrl)
          .then(records => {
            const record = records[0];
            res.status(200).json(record);
          })
          .catch(err => {
            // console.log(`imageUpload.ctrl.js > 132: ${err}`);
            res.status(500).json({ message: err.message });
          });
      }
    }
  });
};

/**
 * Delete file from S3 bucket
 */
deleteImage = (req, res, next) => {
  const params = { Bucket: s3config.bucket, Key: req.params.key };
  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        message: err
      });
    } else {
      return res.status(200).json({ message: "Image deleted." });
    }
  });
};

/* ================================ EXPORT ================================= */

module.exports = {
  singleImgUpload,
  deleteImage
};
