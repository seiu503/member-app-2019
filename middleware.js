const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const express = require("express");
const bodyParser = require("body-parser");

const middleware = [
  morgan("tiny"),
  cors(),
  helmet(),
  bodyParser.json(),
  bodyParser.urlencoded({ extended: true }),
  helmet()
];

module.exports = middleware;
