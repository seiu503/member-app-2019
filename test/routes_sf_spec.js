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

const {
  getSFContactById,
  createSFContact,
  lookupSFContact,
  getAllEmployers,
  createSFOnlineMemberApp,
  updateSFContact
} = require("../app/controllers/sf.ctrl");
const { generateSampleSubmission } = require("../app/utils/fieldConfigs");

const submissionBody = generateSampleSubmission();

// const successStub = sinon.stub(jsforce.Connection.prototype, 'create')
// 	.callsFake(function () {
//   arguments[3](null, { success: true });
// });

// const errorStub = sinon.stub(jsforce.Connection.prototype, 'create')
// 	.callsFake(function () {
//   arguments[3]('Sample error', { success: false });
// });

/* ================================= TESTS ================================= */

let sf_contact_id, submission_id, createdAt, updatedAt;

chai.use(chaiHttp);
let authenticateMock;
let userStub;
suite("routes : salesforce", function() {
  before(() => {
    return db.migrate.rollback().then(() => {
      return db.migrate.latest();
    });
  });

  after(() => {
    return db.migrate.rollback();
  });

  describe("PUT /api/sfcontact/", function() {
    // this route calls 3 chained controllers, 2 of which have to call SF and
    // wait for a response; hence the very long timeout
    this.timeout(15000);
    const app = require("../server");
    test("creates/updates a SF contact, creates submission, creates OMA", function(done) {
      chai
        .request(app)
        .put("/api/sfcontact/")
        .send(submissionBody)
        .end(function(err, res) {
          console.log(`routes_sf_spec.js > 72`);
          console.log(res.body);
          assert.equal(res.status, 200);
          assert.isNull(err);
          sf_contact_id = res.body.salesforce_id;
          submission_id = res.body.submission_id;
          done();
        });
    });
    // test("returns an error if request body is missing required fields", function(done) {
    //   chai
    //     .request(app)
    //     .put("/api/sfcontact/")
    //     .send({ fullname: "firstname lastname" })
    //     .end(function(err, res) {
    //       assert.equal(res.status, 422);
    //       assert.equal(res.type, "application/json");
    //       assert.isNotNull(res.body.message);
    //       done();
    //     });
    // });
  });
});
