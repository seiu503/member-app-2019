/*
   route handlers to serve static client files
*/

/* ================================= SETUP ================================= */

const path = require("path");

/* ============================ ROUTE HANDLERS ============================= */

const serveClient = (req, res) => {
  // console.log("static.ctrl.js > serveClient");
  res.status(200).sendFile(path.join(__dirname, "../client/build/index.html"));
};

/* ================================ EXPORT ================================= */

module.exports = { serveClient };
