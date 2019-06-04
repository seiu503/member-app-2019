/*
   Route handler for image uploads to AWS S3 storage.
*/

/* ================================= SETUP ================================= */

const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const multer = require("multer");
const path = require("path");
const url = require("url");

const s3config = require("../config/aws");
const s3 = new aws.S3(s3config);

/**
 * Single Upload
 */
const imgUploadMulter = multer({
  storage: multerS3({
    s3: s3,
    bucket: s3config.bucket,
    acl: "public-read",
    key: function(req, file, cb) {
      cb(
        null,
        path.basename(file.originalname, path.extname(file.originalname)) +
          "-" +
          Date.now() +
          path.extname(file.originalname)
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
    cb("Error: Only jpeg, jpg, png, and gif files accepted.");
  }
};

/** Upload a single image
 *  @param    {File}   file            Uploaded file.
 *  @returns  {Object}                 Image name and URL OR error message.
 */
const singleImgUpload = (req, res, next) => {
  console.log("singleImgUpload");
  console.log(req.body);
  console.log(req.error);
  if (req.body.file && req.body.file !== undefined && !req.error) {
    const imageName = req.body.file.key;
    const imageLocation = req.body.file.location;

    // Return file name and location
    res.status(201).json({
      image: imageName,
      location: imageLocation
    });
  } else {
    console.log(`imageUpload.ctrl > 76`);
    res.status(500).json({ message: "Error: Please select a file to upload" });
  }
};

/* ================================ EXPORT ================================= */

module.exports = {
  singleImgUpload
};
