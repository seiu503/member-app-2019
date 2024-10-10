// test/models_content_spec.js
/* globals describe afterEach it beforeEach */

/* ================================= SETUP ================================= */

process.env.NODE_ENV = "testing";

import { assert } from "chai";
import { db, TABLES } from "../app/config/knexConfig.js";
import content from "../db/models/content.js";
import utils from "../app/utils/index.js";
import knexCleaner from "knex-cleaner";

const content_type = "headline";
const content_type2 = "image_url";
const content1 = "Join SEIU Today!";
const content2 = "http://example.com/image.png";

const updated_content_type = "body_copy";
const updated_content_type2 = "redirect_url";
const updated_content = "Here's why you should join the union";
const updated_content2 = "http://example.com/redirect";

/* ================================= TESTS ================================= */

let id;
let id2;

describe("content model tests", () => {
  after(() => {
    return knexCleaner.clean(db);
  });
  it("POST creates a new content record", () => {
    return content
      .newContent(content_type, content1)
      .then(result => {
        assert.deepEqual(result[0].content_type, content_type);
        assert.deepEqual(result[0].content, content1);
        return db.select("*").from(TABLES.CONTENT);
      })
      .then(([result]) => {
        assert.equal(result.content_type, content_type);
        assert.equal(result.content, content1);
        id = result.id;
      });
  });

  describe("", () => {
    let contentId;
    let contentId2;

    // seed with 2 content items before each test
    beforeEach(() => {
      return content.newContent(content_type, content1).then(record => {
        contentId = record[0].id;
        content.newContent(content_type2, content2).then(record => {
          contentId2 = record[0].id;
        });
      });
    });

    it("PUT updates a content record", () => {
      const updates = {
        content_type: updated_content_type,
        content: updated_content
      };
      return content.updateContent(contentId, updates).then(results => {
        assert.equal(results[0].content_type, updated_content_type);
        assert.equal(results[0].content, updated_content);
        assert.isAbove(results[0].updated_at, results[0].created_at);
      });
    });

    it("GET gets all content", () => {
      return content.getContent().then(results => {
        const arrayOfKeys = key => results.map(obj => obj[key]);
        assert.equal(Array.isArray(results), true);
        assert.include(arrayOfKeys("content_type"), content_type);
        assert.include(arrayOfKeys("content"), content1);
      });
    });

    it("GET gets all content of one type", () => {
      return content.getContentByType(content_type2).then(results => {
        const arrayOfKeys = key => results.map(obj => obj[key]);
        assert.equal(Array.isArray(results), true);
        assert.include(arrayOfKeys("content_type"), content_type2);
        assert.include(arrayOfKeys("content"), content2);
        assert.equal(results[0].content_type, content_type2);
        assert.equal(results[0].content, content2);
      });
    });

    it("GET gets one content item by id", () => {
      return content.getContentById(contentId).then(result => {
        assert.equal(result.content_type, content_type);
        assert.equal(result.content, content1);
        return db.select("*").from(TABLES.CONTENT);
      });
    });

    it("DELETE deletes a content item", () => {
      return content.deleteContent(contentId).then(result => {
        assert.equal(result.message, "Content deleted successfully");
      });
    });
  });
});
