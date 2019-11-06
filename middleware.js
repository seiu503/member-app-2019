const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const express = require("express");
const bodyParser = require("body-parser");
const requestIp = require("request-ip");

const middleware = [
  morgan("tiny"),
  cors(),
  bodyParser.json(),
  bodyParser.urlencoded({ extended: true }),
  helmet(),
  requestIp.mw()
];

module.exports = middleware;
