const advancedResults = (model, populate) => async (req, res, next) => {
  let query;
  //copy of query
  const QueryCat = { ...req.query };

  //filtering our query for some query params
  const removefields = ['select', 'sort', 'page', 'limit'];
  removefields.forEach((param) => delete QueryCat[param]);

  //makeing query suported for money conditions
  let queryStr = JSON.stringify(QueryCat);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  query = model.find(JSON.parse(queryStr));

  //making removerfileds to take more than one value
  // Select fields
  if (req.query.select) {
    const field = req.query.select.split(',').join(' ');
    query = query.select(field);
  }
  // Sort
  if (req.query.sort) {
    const SortBy = req.query.sort.split(',').join(' ');
    query = query.sort(SortBy);
  } else {
    query = query.sort('-createdAt');
  }
  // pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  if (populate) {
    query = query.populate(populate);
  }

  query = query.skip(startIndex).limit(limit);

  //Executing query

  const results = await query;

  // pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
