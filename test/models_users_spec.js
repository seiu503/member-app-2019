// test/models_users_spec.js
/* globals describe afterEach it beforeEach */

/* ================================= SETUP ================================= */

process.env.NODE_ENV = "testing";

const { assert } = require("chai");
const sinon = require("sinon");
const passport = require("passport");
const { db, TABLES } = require("../app/config/knex");
const users = require("../db/models/users");
const utils = require("../app/utils");
const knexCleaner = require("knex-cleaner");

const name = `firstname ${utils.randomText()}`;
const name2 = `firstname2 ${utils.randomText()}`;
const email = "fakeemail@test.com";
const avatar_url = "http://example.com/avatar.png";

const updatedName = `updatedFirstName ${utils.randomText()}`;
const updatedAvatar_url = "http://example.com/updated-avatr.png";
const updatedEmail = "updatedEmail@email.com";
const google_id = "1234";
const google_token = "5678";

/* ================================= TESTS ================================= */

let id;
let userId;

describe("user model tests", () => {
  // before(() => {
  //   return knexCleaner.clean(db).then(() => {
  //     return db.migrate.rollback().then(() => {
  //       return db.migrate.latest();
  //     });
  //   });
  // });

  // // rollback to cleanup after tests are over
  // after(() => {
  //   return knexCleaner.clean(db).then(() => {
  //     return db.migrate.rollback();
  //   });
  // });
  after(() => {
    return knexCleaner.clean(db);
  });

  it("POST creates a new user", () => {
    return users
      .createUser(name, email, avatar_url, google_id, google_token)
      .then(result => {
        assert.deepEqual(result[0].name, name);
        assert.deepEqual(result[0].email, email);
        assert.deepEqual(result[0].avatar_url, avatar_url);
        assert.deepEqual(result[0].google_id, google_id);
        assert.deepEqual(result[0].google_token, google_token);
        return db.select("*").from(TABLES.USERS);
      })
      .then(([result]) => {
        assert.equal(result.name, name);
        assert.equal(result.email, email);
        assert.equal(result.avatar_url, avatar_url);
        assert.equal(result.google_id, google_id);
        assert.equal(result.google_token, google_token);
        userId = result.id;
      });
  });

  describe("secured routes", () => {
    let userId;

    // seed with a user before each test
    beforeEach(() => {
      return users
        .createUser(name, email, avatar_url, google_id, google_token)
        .then(user => {
          userId = user[0].id;
        });
      // .then(() => {
      //   // stub passport authentication to test secured routes
      //   sinon
      //     .stub(passport, 'authenticate')
      //     .callsFake(function (test, args) {
      //       console.log('Auth stub');
      //     });
      //   console.log('stub registered');
      //   passport.authenticate('jwt', { session: false });
      // });
    });

    // afterEach(() => {
    //   passport.authenticate.restore();
    // });

    it("PUT updates a user", () => {
      const updates = {
        name: updatedName,
        email: updatedEmail,
        avatar_url: updatedAvatar_url
      };
      return users.updateUser(userId, updates).then(results => {
        assert.equal(results[0].email, updatedEmail);
        assert.equal(results[0].name, updatedName);
        assert.equal(results[0].avatar_url, updatedAvatar_url);
        assert.equal(results[0].google_token, google_token);
        assert.equal(results[0].google_id, google_id);
        assert.isAtLeast(results[0].updated_at, results[0].created_at);
      });
    });

    it("GET gets all users", () => {
      return users.getUsers().then(results => {
        const arrayOfKeys = key => results.map(obj => obj[key]);
        assert.equal(Array.isArray(results), true);
        assert.include(arrayOfKeys("name"), name);
        assert.include(arrayOfKeys("email"), email);
        assert.include(arrayOfKeys("avatar_url"), avatar_url);
        assert.deepEqual(results[0].google_id, google_id);
        assert.deepEqual(results[0].google_token, google_token);
      });
    });

    it("GET gets one user by id", () => {
      return users.getUserById(userId).then(result => {
        assert.equal(result.name, name);
        assert.equal(result.email, email);
        assert.equal(result.email, email);
        assert.equal(result.avatar_url, avatar_url);
        assert.equal(result.google_token, google_token);
        return db.select("*").from(TABLES.USERS);
      });
    });

    it("DELETE deletes a user", () => {
      return users.deleteUser(userId).then(result => {
        assert.equal(result.message, "User deleted successfully");
      });
    });
  });
});
