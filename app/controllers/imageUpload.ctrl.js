/*
   Route handler for image uploads to AWS S3 storage.
*/

/* ================================= SETUP ================================= */

// import model
const formMeta = require("../../db/models/form_meta");

const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const multer = require("multer");
const path = require("path");
const url = require("url");

const s3config = require("../config/aws");
const s3 = new aws.S3(s3config);

/**
 * Upload to s3 bucket with multer
 */
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: s3config.bucket,
    acl: "public-read",
    key: function(req, file, cb) {
      console.log(file);
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
    checkFileType(file, cb);
  }
}).single("image");

/**
 * Check File Type
 * @param file
 * @param cb
 * @return {*}
 */
const checkFileType = (file, cb) => {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb({ message: "Error: Only jpeg, jpg, png, and gif files accepted." });
  }
};

/** Upload a single image
 *  @param    {File}   file            Uploaded file.
 *  @returns  {Object}                 Image name and URL OR error message.
 */
const singleImgUpload = (req, res, next) => {
  // upload image to s3 bucket
  upload(req, res, err => {
    if (err) {
      console.log(err);
      res.status(500).json({
        message: err
      });
    } else {
      // generate url of uploaded image
      const imageUrl = `https://${s3config.bucket}.s3-${
        s3config.region
      }.amazonaws.com/${req.file.originalname}`;
      // save url to postgres DB
      return formMeta
        .createFormMeta("image", imageUrl)
        .then(records => {
          const record = records[0];
          res.status(200).json(record);
        })
        .catch(err => {
          console.log(`imageUpload.ctrl.js > 90: ${err}`);
          res.status(500).json({ message: err.message });
        });
    }
  });
};

/* ================================ EXPORT ================================= */

module.exports = {
  singleImgUpload
};
