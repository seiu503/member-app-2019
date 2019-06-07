// local module to wrap multer so that it can be stubbed with sinon
// for testing image upload route:

const multer = require("multer");
module.exports = { multer };
