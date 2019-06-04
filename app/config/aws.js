const s3config = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  bucket: "member-app-images"
};

module.exports = s3config;
