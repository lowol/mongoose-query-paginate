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
    Comment.remove({}, function(err) {
      var promises = [];
      for (var i = 1; i <= 100; i++) {
        insert(i);
      }
      Promise.all(promises).then(function(data) {
        done();
      }, function(err) {
        done(err);
      });
    });

    function insert(i) {
      return new Comment({
        number: i,
        name: 'name' + i,
        body: 'body' + i
      }).save();
    }
  });

  after(function() {
    conn.close();
  });

  it('default pager', function(done) {
    Comment.find().paginate({}, function(err, pager) {
      assert.equal(err, null);
      assert.equal(pager.count, 100);
      assert.equal(pager.current, 1);
      assert.equal(pager.last, 10);
      assert.equal(pager.prev, null);
      assert.equal(pager.next, 2);
      assert.equal(pager.pages.join(','), '1,2,3,4,5,6');
      done(err);
    });
  });

  it('options.page', function(done) {
    Comment.find().paginate({page: 2}, function(err, pager) {
      assert.equal(pager.current, 2);
      assert.equal(pager.prev, 1);
      assert.equal(pager.next, 3);
      done(err);
    });
  });

  it('options.perPage', function(done) {
    Comment.find().paginate({perPage: 5}, function(err, pager) {
      assert.equal(pager.results.length, 5);
      done(err);
    });
  });

  it('options.delta', function(done) {
    Comment.find().paginate({delta: 3}, function(err, pager) {
      assert.equal(pager.pages.join(','), '1,2,3,4');
      done(err);
    });
  });

  it('options.delta & page', function(done) {
    Comment.find().paginate({delta: 3, page: 4}, function(err, pager) {
      assert.equal(pager.pages.join(','), '1,2,3,4,5,6,7');
      done(err);
    });
  });

  it('options.offset', function(done) {
    Comment.find().sort('number').paginate({offset: 2}, function(err, pager) {
      assert.equal(pager.results[0].number, 3);
      done(err);
    });
  });

  it('options.offset & page', function(done) {
    Comment.find().sort('number').paginate({offset: 2, page: 2, perPage: 5}, function(err, pager) {
      assert.equal(pager.results[0].number, 8);
      done(err);
    });
  });

  it('custom query', function(done) {
    var query = Comment.find().where('number').lte(50).sort('-number');
    query.paginate({}, function(err, pager) {
      var numbers = pager.results.map(function(v) {
        return v.number;
      });
      assert.equal(numbers.join(','), [50,49,48,47,46,45,44,43,42,41].join(','));
      done(err);
    });
  });

  it('no data', function(done) {
    var query = Comment.find().where('number').gt(1000);
    query.paginate({}, function(err, pager) {
      assert.equal(pager.count, 0);
      assert.equal(pager.prev, null);
      assert.equal(pager.next, null);
      done(err);
    });
  });

});
