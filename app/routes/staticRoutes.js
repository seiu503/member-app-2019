/*
   non-secured routes to serve static client SPA
*/

/* ================================= SETUP ================================= */

import express from "express";
const router = express.Router();

/* =========================== INIT CONTROLLERS ============================ */

import staticCtrl from "../static.ctrl.js";

/* ================================ ROUTES ================================= */

// Serve client frontend.
router.get("/", staticCtrl.serveClient);

/* ================================ EXPORT ================================= */

export default router;
