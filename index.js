/**
 * mongoose-query-paginate
 */
var Query = require('mongoose').Query;

/**
 * paginate
 *
 * @param {Object} options
 */
Query.prototype.paginate = function(options, callback) {
  var defaults = {
    perPage: 10, // Number of items to display on each page.
    delta  :  5, // Number of page numbers to display before and after the current one.
    page   :  1  // Initial page number.
  };

  options = options || defaults;
  options.perPage = options.perPage || defaults.perPage;
  options.delta = options.delta || defaults.delta;
  options.page = options.page || defaults.page;

  var query = this;
  var model = query.model;
  model.count(query._conditions, function(err, count) {
    query.skip((options.page - 1) * options.perPage).limit(options.perPage).execFind(function(err, results) {
      if (err) {
        callback(err, {});
        return;
      }

      var page = ~~options.page || 0;
      var delta = options.delta;
      var last = Math.ceil(count / options.perPage);
      var current = page;
      var start = page - delta > 1 ? page - delta : 1;
      var end = current + delta + 1 < last ? current + delta : last;

      var pages = [];
      for (var i = start; i <= end; i++) {
        pages.push(i);
      }

      var pager = {
        'results': results,
        'options': options,
        'current': current,
        'last': last,
        'prev': current == start ? null : current - 1,
        'next': current == end ? null : current + 1,
        'pages': pages,
        'count': count
      };
      callback(err, pager);
    });
  });
};
