const s3config = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  bucket: "member-app-images",
  region: "us-west-2"
};

module.exports = s3config;
