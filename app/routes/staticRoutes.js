/*
   non-secured routes to serve static client SPA
*/

/* ================================= SETUP ================================= */

const router = require("express").Router();

/* =========================== INIT CONTROLLERS ============================ */

const staticCtrl = require("../static.ctrl");

/* ================================ ROUTES ================================= */

// Serve client frontend.
router.get("/", staticCtrl.serveClient);

/* ================================ EXPORT ================================= */

module.exports = router;
