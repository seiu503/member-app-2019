// test/models_users_spec.js
/* globals describe afterEach it beforeEach */

/* ================================= SETUP ================================= */

const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

process.env.NODE_ENV = "testing";

const { assert } = require("chai");
const sinon = require("sinon");
const passport = require("passport");
const { db, TABLES } = require("../app/config/knex");
const users = require("../db/models/users");
const utils = require("../app/utils");
const knexCleaner = require("knex-cleaner");

const name = `firstname lastname`;
const name2 = `firstname2 ${utils.randomText()}`;
const email = `${utils.randomText()}@test.com`;
const type = "admin";
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
  before(() => {
    return knexCleaner.clean(db);
  });
  after(() => {
    return knexCleaner.clean(db);
  });
  beforeEach(() => {
    sinon.restore();
  });

  it("POST creates a new user", () => {
    return users
      .createUser(name, email, avatar_url, google_id, google_token, type)
      .then(result => {
        assert.deepEqual(result[0].name, name);
        assert.deepEqual(result[0].email, email);
        assert.deepEqual(result[0].avatar_url, avatar_url);
        assert.deepEqual(result[0].google_id, google_id);
        assert.deepEqual(result[0].google_token, google_token);
        assert.deepEqual(result[0].type, type);
        return db.select("*").from(TABLES.USERS);
      })
      .then(([result]) => {
        assert.equal(result.name, name);
        assert.equal(result.email, email);
        assert.equal(result.avatar_url, avatar_url);
        assert.equal(result.google_id, google_id);
        assert.equal(result.google_token, google_token);
        assert.equal(result.type, type);
        userId = result.id;
      });
  });

  describe("secured routes", () => {
    let userId, test_google_id, test_email;

    // seed with a user before each test
    before(() => {
      return knexCleaner.clean(db).then(() => {
        return users
          .createUser(name, email, avatar_url, google_id, google_token, type)
          .then(user => {
            userId = user[0].id;
            test_google_id = user[0].google_id;
          });
      });
    });

    it("PUT updates a user", () => {
      const updates = {
        name: updatedName,
        email: updatedEmail,
        avatar_url: updatedAvatar_url
      };
      return users.updateUser(userId, updates).then(results => {
        test_email = results[0].email;
        assert.equal(results[0].email, updatedEmail);
        assert.equal(results[0].name, updatedName);
        assert.equal(results[0].avatar_url, updatedAvatar_url);
        assert.equal(results[0].google_token, google_token);
        assert.equal(results[0].google_id, google_id);
        assert.equal(results[0].type, type);
        assert.isAtLeast(results[0].updated_at, results[0].created_at);
      });
    });

    it("GET gets all users", () => {
      return users.getUsers().then(results => {
        const arrayOfKeys = key => results.map(obj => obj[key]);
        assert.equal(Array.isArray(results), true);
        assert.include(arrayOfKeys("name"), updatedName);
        assert.include(arrayOfKeys("email"), updatedEmail);
        assert.include(arrayOfKeys("type"), type);
        assert.include(arrayOfKeys("avatar_url"), updatedAvatar_url);
        assert.deepEqual(results[0].google_id, google_id);
        assert.deepEqual(results[0].google_token, google_token);
        assert.deepEqual(results[0].type, type);
      });
    });

    it("GET gets one user by id", () => {
      return users.getUserById(userId).then(returnedUser => {
        assert.equal(returnedUser.name, updatedName);
        assert.equal(returnedUser.email, updatedEmail);
        assert.equal(returnedUser.avatar_url, updatedAvatar_url);
        assert.equal(returnedUser.google_token, google_token);
        assert.equal(returnedUser.type, type);
      });
    });

    it("GET gets one user by email", () => {
      return users.getUserByEmail(test_email).then(returnedUser => {
        assert.equal(returnedUser.name, updatedName);
        assert.equal(returnedUser.email, updatedEmail);
        assert.equal(returnedUser.avatar_url, updatedAvatar_url);
        assert.equal(returnedUser.google_token, google_token);
        assert.equal(returnedUser.type, type);
      });
    });

    it("GET gets one user by email", () => {
      return users.getUserByGoogleId(test_google_id).then(returnedUser => {
        assert.equal(returnedUser.name, updatedName);
        assert.equal(returnedUser.email, updatedEmail);
        assert.equal(returnedUser.avatar_url, updatedAvatar_url);
        assert.equal(returnedUser.google_token, google_token);
        assert.equal(returnedUser.type, type);
      });
    });

    it("DELETE deletes a user", () => {
      return users.deleteUser(userId).then(result => {
        assert.equal(result.message, "User deleted successfully");
      });
    });
  });
});
