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

const name = `firstname lastname`;
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
  before(() => {
    return knexCleaner.clean(db);
    const sandbox = sinon.createSandbox();
    sandbox.restore();
  });
  after(() => {
    return knexCleaner.clean(db);
    sandbox.restore();
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
        console.log(`########################`);
        console.log(result);
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
          console.log("aa_models_users_spec.js > 72: seed user");
          console.log(userId);
          console.log(user);
        });
    });

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
      console.log("aa_models_users_spec.js > 107: getting seed user");
      console.log(userId);
      return users.getUserById(userId).then(returnedUser => {
        console.log(`########## 116 #########`);
        console.log(returnedUser);
        assert.equal(returnedUser.name, name);
        assert.equal(returnedUser.email, email);
        assert.equal(returnedUser.avatar_url, avatar_url);
        assert.equal(returnedUser.google_token, google_token);
      });
    });

    it("DELETE deletes a user", () => {
      return users.deleteUser(userId).then(result => {
        assert.equal(result.message, "User deleted successfully");
      });
    });
  });
});
