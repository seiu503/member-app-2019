import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import express from "express";
import bodyParser from "body-parser";

const middleware = [
  morgan("tiny"),
  cors(),
  bodyParser.json(),
  bodyParser.urlencoded({ extended: true }),
  helmet()
];

export default middleware;
