/**
 * mongoose-query-paginate
 */
var Query = require("mongoose").Query;

/**
 * paginate
 *
 * @param {Object} options
 */
Query.prototype.paginate = async function (options) {
  const defaults = {
    perPage: 10, // Number of items to display on each page.
    delta: 5, // Number of page numbers to display before and after the current one.
    page: 1, // Initial page number.
    offset: 0, // Offset number.
  };

  options = options || defaults;
  options.perPage = options.perPage || defaults.perPage;
  options.delta = options.delta || defaults.delta;
  options.page = options.page || defaults.page;
  options.offset = options.offset || defaults.offset;

  const query = this;
  const model = query.model;

  const count = await model.count(query._conditions);
  const _skip = (options.page - 1) * options.perPage + options.offset;
  const results = await query.skip(_skip).limit(+options.perPage).exec();

  results = results || [];
  const page = parseInt(options.page, 10) || 0;
  const delta = options.delta;
  let offset_count = count - options.offset;
  offset_count = offset_count > 0 ? offset_count : 0;
  const last = Math.ceil(offset_count / options.perPage);
  const current = page;
  const start = page - delta > 1 ? page - delta : 1;
  const end = current + delta + 1 < last ? current + delta : last;

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const prev = !count || current == start ? null : current - 1;
  const next = !count || current == end ? null : current + 1;
  if (!offset_count) {
    prev = next = last = null;
  }

  return {
    results: results,
    options,
    current,
    last,
    prev,
    next,
    pages,
    count,
  };
};
