/**
 * Pagination middleware — attaches `req.pagination` to every request.
 *
 * Usage: add `paginate` before any route handler that needs pagination.
 *
 * Query params:
 *   ?page=1          Current page (1-based, default 1)
 *   ?limit=20        Items per page (default 20, max 100)
 *   ?sort=createdAt  Field to sort by (default createdAt)
 *   ?order=desc      Sort direction: asc | desc (default desc)
 *
 * Controllers read `req.pagination` and call `paginateQuery()` to build
 * the Mongoose query, then use `buildMeta()` to include pagination metadata
 * in the response.
 */

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const paginate = (req, res, next) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT));
  const skip  = (page - 1) * limit;
  const sort  = req.query.sort  || 'createdAt';
  const order = req.query.order === 'asc' ? 1 : -1;

  req.pagination = { page, limit, skip, sort, order };
  next();
};

/**
 * Apply pagination to a Mongoose query.
 *
 * @param {mongoose.Query} query - e.g. BOMRequest.find({...})
 * @param {object}         pag   - req.pagination
 * @returns {mongoose.Query} query with .sort().skip().limit() applied
 */
const paginateQuery = (query, pag) => {
  return query
    .sort({ [pag.sort]: pag.order })
    .skip(pag.skip)
    .limit(pag.limit);
};

/**
 * Build the pagination metadata block for API responses.
 *
 * @param {number} total  - Total documents matching the filter (from countDocuments)
 * @param {object} pag    - req.pagination
 * @returns {object} pagination metadata
 */
const buildMeta = (total, pag) => ({
  total,
  page:       pag.page,
  limit:      pag.limit,
  totalPages: Math.ceil(total / pag.limit),
  hasNextPage: pag.page < Math.ceil(total / pag.limit),
  hasPrevPage: pag.page > 1,
});

module.exports = { paginate, paginateQuery, buildMeta };
