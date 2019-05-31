// test/models_form_meta_spec.js
/* globals describe afterEach it beforeEach */

/* ================================= SETUP ================================= */

process.env.NODE_ENV = "testing";

const { assert } = require("chai");
const { db, TABLES } = require("../app/config/knex");
const form_meta = require("../db/models/form_meta");
const utils = require("../app/utils");

const form_meta_type = "headline";
const form_meta_type2 = "image_url";
const content = "Join SEIU Today!";
const content2 = "http://example.com/image.png";

const updated_form_meta_type = "body_copy";
const updated_form_meta_type2 = "redirect_url";
const updated_content = "Here's why you should join the union";
const updated_content2 = "http://example.com/redirect";

/* ================================= TESTS ================================= */

let id;
let id2;

describe("form_meta model tests", () => {
  before(() => {
    return db.migrate.rollback().then(() => {
      return db.migrate.latest();
    });
  });

  after(() => {
    return db.migrate.rollback();
  });

  it("POST creates a new form meta record", () => {
    return form_meta
      .createFormMeta(form_meta_type, content)
      .then(result => {
        assert.deepEqual(result[0].form_meta_type, form_meta_type);
        assert.deepEqual(result[0].content, content);
        return db.select("*").from(TABLES.FORM_META);
      })
      .then(([result]) => {
        assert.equal(result.form_meta_type, form_meta_type);
        assert.equal(result.content, content);
        id = result.id;
      });
  });

  describe("", () => {
    let contentId;
    let contentId2;

    // seed with 2 content items before each test
    beforeEach(() => {
      return form_meta.createFormMeta(form_meta_type, content).then(record => {
        contentId = record[0].id;
        form_meta.createFormMeta(form_meta_type2, content2).then(record => {
          contentId2 = record[0].id;
        });
      });
    });

    it("PUT updates a form meta record", () => {
      const updates = {
        form_meta_type: updated_form_meta_type,
        content: updated_content
      };
      return form_meta.updateFormMeta(contentId, updates).then(results => {
        assert.equal(results[0].form_meta_type, updated_form_meta_type);
        assert.equal(results[0].content, updated_content);
        assert.isAbove(results[0].updated_at, results[0].created_at);
      });
    });

    it("GET gets all form meta content", () => {
      return form_meta.getFormMeta().then(results => {
        const arrayOfKeys = key => results.map(obj => obj[key]);
        assert.equal(Array.isArray(results), true);
        assert.include(arrayOfKeys("form_meta_type"), form_meta_type);
        assert.include(arrayOfKeys("content"), content);
      });
    });

    it("GET gets all form meta content of one type", () => {
      return form_meta.getFormMetaByType(form_meta_type2).then(results => {
        const arrayOfKeys = key => results.map(obj => obj[key]);
        assert.equal(Array.isArray(results), true);
        assert.include(arrayOfKeys("form_meta_type"), form_meta_type2);
        assert.include(arrayOfKeys("content"), content2);
        assert.equal(results[0].form_meta_type, form_meta_type2);
        assert.equal(results[0].content, content2);
      });
    });

    it("GET gets one form meta content item by id", () => {
      return form_meta.getFormMetaById(contentId).then(result => {
        assert.equal(result.form_meta_type, form_meta_type);
        assert.equal(result.content, content);
        return db.select("*").from(TABLES.FORM_META);
      });
    });

    it("DELETE deletes a content item", () => {
      return form_meta.deleteFormMeta(contentId).then(result => {
        assert.equal(result.message, "Form meta deleted successfully");
      });
    });
  });
});
