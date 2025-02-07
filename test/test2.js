/**
 * test
 */
//var should = require('should');
var assert = require("assert");

var mongoose = require("mongoose");
require("../index");

describe("paginate", function () {
  let Comment;
  let conn;
  before(async function () {
    conn = await mongoose.connect("mongodb://localhost/query-test");

    const CommentSchema = new mongoose.Schema({
      number: Number,
      name: String,
      body: String,
    });
    Comment = conn.model("Comment", CommentSchema);
    await Comment.deleteMany({});
    const promises = [];
    for (let i = 1; i <= 23; i++) {
      promises.push(insert(i));
    }

    await Promise.all(promises);

    function insert(i) {
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

  it("options.offset & page", async function () {
    const pager = await Comment.find().paginate({
      offset: 2,
      perPage: 5,
      page: 5,
    });
    assert.equal(pager.count, 23);
    assert.equal(pager.last, 5);
  });
  it("large options.offset", async function () {
    const pager = await Comment.find().paginate({
      offset: 30,
      perPage: 5,
      page: 2,
    });
    assert.equal(pager.count, 23);
    assert.equal(pager.last, null);
  });
});
