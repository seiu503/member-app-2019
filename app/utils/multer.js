const multer = require("multer");
const util = require("util");
const multerS3 = require("multer-s3");
const path = require("path");
const aws = require("aws-sdk");
const s3config = require("../config/aws");
let S3 = new aws.S3(s3config);

const checkFile = (file, cb) => {
  // console.log(`multer.js > 32`);
  // console.log(file);
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

class Uploader {
  constructor() {
    const storageOptions = multerS3({
      s3: S3,
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
    });

    this.upload = multer({
      storage: storageOptions,
      limits: { fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
      fileFilter: function(req, file, cb) {
        checkFile(file, cb);
      }
    });
  }

  async startUpload(req, res, next) {
    let filename;
    try {
      const upload = util.promisify(this.upload.single("image"));
      await upload(req, res);
      return;
    } catch (err) {
      // console.log(`multer.js > 62: ${err}`);
      return res.status(500).json({ message: err.message });
    }
  }
}

module.exports = {
  Uploader,
  checkFile
};
