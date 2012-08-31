/**
 * test
 */
//var should = require('should');
var assert = require('assert');

var mongoose = require('mongoose');
require('../index');

var conn = mongoose.createConnection('mongodb://localhost/query-test');
//conn.db.dropDatabase();

var CommentSchema = new mongoose.Schema({
  number: Number,
  name: String,
  body: String
});
var Comment = conn.model('Comment', CommentSchema);

describe('paginate', function() {

  before(function(done) {
    return Comment.remove({}, function(err) {
      insert(1, 23, done);
    });

    function insert(i, max, fn) {
      if (i > max) return fn();

      new Comment({
        number: i,
        name: 'name' + i,
        body: 'body' + i
      }).save(function(err) {
        if (err) {
          console.log(err);
          fn(err);
          return;
        }
        insert(++i, max, fn);
      });
    }

  });

  after(function() {
    conn.close();
  });

 it('options.offset & page', function(done) {
    Comment.find().paginate({offset: 2, perPage: 5, page: 5}, function(err, pager) {
      assert.equal(pager.count, 23);
      assert.equal(pager.last, 5);
      done(err);
    });
  });

 it('large options.offset', function(done) {
    Comment.find().paginate({offset: 30, perPage: 5, page: 2}, function(err, pager) {
      assert.equal(pager.count, 23);
      assert.equal(pager.last, null);
      done(err);
    });
  });


});
