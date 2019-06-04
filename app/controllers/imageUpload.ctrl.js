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
 * Single Upload
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

// const upload = multer({
//     storage: multerS3({
//         s3: s3,
//         acl: 'public-read',
//         bucket: s3config.bucket,
//         key: function (req, file, cb) {
//             console.log(file);
//             cb(null, file.originalname); //use Date.now() for unique file keys
//         }
//     })
// }).single('image');

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

  upload(req, res, err => {
    if (err) {
      console.log(err);
      res.status(500).json({
        message: err
      });
    } else {
      const imageUrl = `https://member-app-images.s3-us-west-2.amazonaws.com/${
        req.file.originalname
      }`;
      console.log();
      res.status(200).json({
        message: "Successful upload",
        imageUrl: imageUrl
      });
    }
  });

  // .then((returnVal) => {
  //   console.log('upload complete');
  //   console.log(returnVal);
  //   res.status(200).json({
  //     message: 'Successful upload',
  //     returnVal: returnVal
  //   });
  // })
  // .catch(err => {
  //   console.log(err);
  //   res.status(500).json({
  //     message: err
  //   });
  // });

  // if (req.body.file && req.body.file !== undefined && !req.error) {
  //   const imageName = req.body.file.key;
  //   const imageLocation = req.body.file.location;

  //   return formMeta
  //     .createFormMeta("image", imageLocation)
  //     .then(records => {
  //       const record = records[0];
  //       res.status(200).json(record);
  //     })
  //     .catch(err => {
  //       console.log(`formMeta.ctrl.js > 28: ${err}`);
  //       res.status(500).json({ message: err.message });
  //     });

  //   // Return file name and location
  //   res.status(201).json({
  //     image: imageName,
  //     location: imageLocation
  //   });
  // } else {
  //   console.log(`imageUpload.ctrl > 76`);
  //   console.log(res);
  //   res.status(500).json({ message: "Error: Please select a file to upload" });
  // }
};

/* ================================ EXPORT ================================= */

module.exports = {
  singleImgUpload
};
