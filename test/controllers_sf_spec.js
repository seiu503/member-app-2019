// test/controllers_sf_spec.js

/* ================================= SETUP ================================= */
const uuid = require("uuid");

process.env.NODE_ENV = "testing";

const chai = require("chai");
const { db, TABLES } = require("../app/config/knex");
const { assert } = require("chai");
const chaiHttp = require("chai-http");
const { suite, test } = require("mocha");
const sinon = require("sinon");
const passport = require("passport");
require("../app/config/passport")(passport);
const utils = require("../app/utils");
const users = require("../db/models/users");
const submissions = require("../db/models/submissions");
const moment = require("moment");
const jsforce = require("jsforce");

// import getSFContactById,
//   getAllEmployers,
//   createSFOnlineMemberApp,
//   updateSFContact
// from "../controllers/sf.ctrl";
// import { submissionBody } from "./routes_submissions_spec";

// const successStub = sinon.stub(jsforce.Connection.prototype, 'create')
// 	.callsFake(function () {
//   arguments[3](null, { success: true });
// });

// const errorStub = sinon.stub(jsforce.Connection.prototype, 'create')
// 	.callsFake(function () {
//   arguments[3]('Sample error', { success: false });
// });
