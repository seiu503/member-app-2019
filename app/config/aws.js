const s3config = {
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET,
  bucket: "member-app-images",
  region: "us-west-2"
};

module.exports = s3config;
