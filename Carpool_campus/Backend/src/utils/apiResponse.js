function success(res, { statusCode = 200, data = undefined, message = undefined, pagination = undefined } = {}) {
  const body = { success: true };
  if (data !== undefined) body.data = data;
  if (message !== undefined) body.message = message;
  if (pagination !== undefined) body.pagination = pagination;
  return res.status(statusCode).json(body);
}

function noContent(res) {
  return res.status(204).send();
}

function buildPagination({ page, limit, totalItems }) {
  return {
    page,
    limit,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / limit)),
  };
}

module.exports = { success, noContent, buildPagination };
