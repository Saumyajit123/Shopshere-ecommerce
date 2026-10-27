const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function getPagination(query = {}, defaultLimit = DEFAULT_LIMIT) {
  const requestedPage = Number.parseInt(query.page, 10);
  const requestedLimit = Number.parseInt(query.limit, 10);

  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const limit =
    Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, MAX_LIMIT)
      : defaultLimit;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

function buildPagination(totalItems, page, limit) {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    currentPage: page,
    limit,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
    previousPage: page - 1,
    nextPage: page + 1,
  };
}

module.exports = {
  getPagination,
  buildPagination,
};
