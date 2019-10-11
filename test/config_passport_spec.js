/* ================================= SETUP ================================= */

process.env.NODE_ENV = "testing";

const chai = require("chai"),
  { db } = require("../app/config/knex"),
  { mockReq, mockRes } = require("sinon-express-mock"),
  { assert, expect, use, should, request } = chai,
  { suite, test } = require("mocha"),
  knexCleaner = require("knex-cleaner"),
  sinon = require("sinon"),
  nock = require("nock"),
  sinonChai = require("sinon-chai"),
  passport = require("passport"),
  User = require("../db/models/users"),
  authConfig = require("../app/config/auth"),
  {
    findUserByEmail,
    updateUser,
    user,
    googleLogin,
    googleStrategy,
    jwtStrategy,
    jwtLogin
  } = authConfig,
  id = "325d0807-1ecf-475b-a5ab-85fea40b3f9e",
  token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMyN…zE1fQ.6y9mMYVXbffHa4Q-aFUd5B3GDyyRF10iBJ28qVlEApk",
  name = `firstname lastname}`,
  email = "fakeemail@test.com",
  adminType = "admin",
  viewType = "view",
  editType = "type",
  avatar_url = "http://example.com/avatar.png",
  profile = {
    id,
    emails: [email],
    name: {
      givenName: "firstname",
      familyName: "lastname"
    },
    picture: avatar_url
  },
  returnedUser = {
    id,
    name: "firstname lastname",
    email,
    avatar_url,
    adminType,
    google_id: "1234",
    google_token: "5678",
    created_at: new Date(),
    updated_at: new Date()
  };
chai.should();
chai.use(sinonChai);
chai.use(require("chai-passport-strategy"));

suite("routes : passport auth", function() {
  before(() => {
    nock("https://accounts.google.com")
      .filteringPath(() => "/")
      .get("/")
      .reply(200, "connected to google");
    return knexCleaner.clean(db);
  });
  after(() => {
    nock.cleanAll();
    return knexCleaner.clean(db);
  });

  afterEach(() => {
    sinon.restore();
  });

  suite("Passport and Auth config", function() {
    const app = require("../server");
    test("return 500 status when no user found", function(done) {
      const authenticateMockNoUser = sinon
        .stub(passport, "authenticate")
        .returns(() => {});
      authenticateMockNoUser.yields(null, null);
      chai
        .request(app)
        .post("/api/content/")
        .send({ content_type: "headline", content: "test" })
        .end(function(err, res) {
          assert.equal(res.status, 500);
          assert.equal(
            res.body.message,
            "You do not have permission to do this. Please Consult an administrator."
          );
          assert.isNull(err);
          sinon.restore();
          done();
        });
    });
    // I took this test out because jwtCallback now checks for a user in the the req
    // and returns the error above ^^. So we shouldn't really get here anymore.
    // test("return 422 status when no error thrown", function (done) {
    //   const authenticateMockError = sinon
    //     .stub(passport, "authenticate")
    //     .returns(() => { });
    //   authenticateMockError.yields({ message: "error message" }, null);
    //   chai
    //     .request(app)
    //     .post("/api/content/")
    //     .send({ content_type: "headline", content: "test" })
    //     .end(function (err, res) {
    //       assert.equal(res.status, 422);
    //       assert.equal(res.body.message, "error message");
    //       assert.isNull(err);
    //       sinon.restore();
    //       done();
    //     });
    // });
    test("finds existing user", function(done) {
      const getUserByEmailStub = sinon
        .stub(User, "getUserByEmail")
        .returns(Promise.resolve({ name, email, avatar_url, id, adminType }));
      findUserByEmail({ email }, token, done).then(() => {
        getUserByEmailStub.should.have.been.calledOnce;
        sinon.restore();
      });
    });
    test("saves new user", function(done) {
      const createUserStub = sinon
        .stub(User, "createUser")
        .returns(Promise.resolve({ name, email, avatar_url, id }));
      updateUser(profile, token, id, done).then(() => {
        createUserStub.should.have.been.calledOnce;
        sinon.restore();
        return knexCleaner.clean(db);
      });
    });
    test("deserializes user", function(done) {
      const getUserStub = sinon
        .stub(User, "getUserById")
        .returns(Promise.resolve({ name, email, avatar_url, id }));
      user.deserialize(id, done).then(() => {
        getUserStub.should.have.been.calledOnce;
        sinon.restore();
      });
    });
  });

  suite("passport strategy", () => {
    afterEach(() => {
      sinon.restore();
    });
    const app = require("../server");
    test("should test for Strategies", done => {
      expect(googleStrategy).to.be.an("object");
      expect(jwtStrategy).to.be.an("object");
      done();
    });
    test("should be a function", done => {
      expect(findUserByEmail).to.be.a("function");
      expect(updateUser).to.be.a("function");
      done();
    });

    test("should call google route", async () => {
      const response = await chai.request(app).get("/api/auth/google");
      expect(response).to.have.status(200);
      expect(response.text).to.be.deep.equal("connected to google");
    });

    suite("googleLogin", async () => {
      afterEach(() => {
        sinon.restore();
      });
      const accessToken = "";
      const refreshToken = "";
      const profile = {
        id,
        emails: [email],
        name: {
          givenName: "firstname",
          familyName: "lastname"
        },
        picture: avatar_url
      };
      const done = sinon.stub().returnsArg(1);
      test("googleLogin returns user if user in req", async () => {
        const req = mockReq({
          user: profile
        });

        googleLogin(req, accessToken, refreshToken, profile, done)
          .then(result => {
            expect(done).to.have.been.calledWith(null, profile);
            expect(result).to.deep.equal(profile);
          })
          .catch(err => {
            console.log("164");
            console.log(err);
          })
          .finally(() => {
            sinon.restore();
            return knexCleaner.clean(db);
          });
      });
      test("googleLogin replies with error user not invited yet", function(done) {
        const req = mockReq();
        const getUserByEmailStub = sinon
          .stub(User, "getUserByEmail")
          .resolves(profile, accessToken, done);
        // const saveNewUserStub = sinon
        //   .stub(authConfig, "saveNewUser")
        //   .resolves(() => { });
        googleLogin(req, accessToken, refreshToken, profile, done)
          .then(result => {
            expect(getUserByEmailStub).to.have.been.calledOnce;
            expect(result).to.deep.equal(
              "You need an invitation from an administrator first"
            );
          })
          .catch(err => {
            console.log("214");
            console.log(err);
          })
          .finally(() => {
            sinon.restore();
            return knexCleaner.clean(db);
          });
      });
    });

    suite("jwtLogin", async () => {
      afterEach(() => {
        sinon.restore();
      });
      const accessToken = "";
      const refreshToken = "";
      const done = sinon.stub().returnsArg(1);
      test("jwtLogin returns user if user in req", async () => {
        const req = mockReq({
          user: profile
        });

        const getUserByIdStub = sinon
          .stub(User, "getUserById")
          .resolves(returnedUser);

        jwtLogin(req, profile, done)
          .then(() => {
            expect(getUserByIdStub).to.have.been.calledWith(id);
          })
          .catch(err => {
            console.log("219");
            console.log(err);
          })
          .finally(() => {
            sinon.restore();
            return knexCleaner.clean(db);
          });
      });
      test("jwtLogin handles error if no user found", async () => {
        const req = mockReq();
        const getUserByIdStub = sinon
          .stub(User, "getUserById")
          .rejects(new Error("test error"));
        jwtLogin(req, profile, done)
          .then(() => {
            expect(getUserByIdStub).to.have.been.calledOnce;
          })
          .catch(err => {
            // console.log('235');
            // console.log(err)
          })
          .finally(() => {
            sinon.restore();
            return knexCleaner.clean(db);
          });
      });
    });
  });
});
