/**
 * test
 */
//var should = require('should');
const assert = require("assert");

const mongoose = require("mongoose");
require("../index");

describe("mongoose-query-paginate", function () {
  let Comment;
  let conn;
  before(async function () {
    conn = await mongoose.connect("mongodb://localhost:27017/query-test");

    const CommentSchema = new mongoose.Schema({
      number: Number,
      name: String,
      body: String,
    });

    Comment = conn.model("Comment", CommentSchema);

    await Comment.deleteMany({});
  });

  describe("paginate", function () {
    before(async function () {
      await Comment.deleteMany({});
      var promises = [];
      for (var i = 1; i <= 100; i++) {
        promises.push(insert(i));
      }
      await Promise.all(promises);

      async function insert(i) {
        return new Comment({
          number: i,
          name: "name" + i,
          body: "body" + i,
        }).save();
      }
    });

    after(async function () {
      await conn.disconnect();
    });

    it("default pager", async function () {
      const pager = await Comment.find().paginate({});
      assert.equal(pager.count, 100);
      assert.equal(pager.current, 1);
      assert.equal(pager.last, 10);
      assert.equal(pager.prev, null);
      assert.equal(pager.next, 2);
      assert.equal(pager.pages.join(","), "1,2,3,4,5,6");
    });

    it("options.page", async function () {
      const pager = await Comment.find().paginate({ page: 2 });
      assert.equal(pager.current, 2);
      assert.equal(pager.prev, 1);
      assert.equal(pager.next, 3);
    });

    it("options.perPage", async function () {
      const pager = await Comment.find().paginate({ perPage: 5 });
      assert.equal(pager.results.length, 5);
    });

    it("options.delta", async function () {
      const pager = await Comment.find().paginate({ delta: 3 });
      assert.equal(pager.pages.join(","), "1,2,3,4");
    });

    it("options.delta & page", async function () {
      const pager = await Comment.find().paginate({ delta: 3, page: 4 });
      assert.equal(pager.pages.join(","), "1,2,3,4,5,6,7");
    });

    it("options.offset", async function () {
      const pager = await Comment.find().sort("number").paginate({ offset: 2 });
      assert.equal(pager.results[0].number, 3);
    });

    it("options.offset & page", async function () {
      const pager = await Comment.find()
        .sort("number")
        .paginate({ offset: 2, page: 2, perPage: 5 });
      assert.equal(pager.results[0].number, 8);
    });

    it("custom query", async function () {
      const query = Comment.find().where("number").lte(50).sort("-number");
      const pager = await query.paginate({});
      const numbers = pager.results.map(function (v) {
        return v.number;
      });
      assert.equal(
        numbers.join(","),
        [50, 49, 48, 47, 46, 45, 44, 43, 42, 41].join(",")
      );
    });

    it("no data", async function () {
      const query = Comment.find().where("number").gt(1000);
      const pager = await query.paginate({});
      assert.equal(pager.count, 0);
      assert.equal(pager.prev, null);
      assert.equal(pager.next, null);
    });
  });
});
