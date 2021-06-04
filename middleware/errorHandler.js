const colors = require('colors');
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.log(err.message);

  //mongoos bad objects
  if (err.name === `CastError`) {
    const message = `Resourse not found`;
    error = new ErrorResponse(message, 404);
  }

  //mongoos dublicate key
  if (err.code === 11000) {
    const message = 'Dublicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  //mongoos validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statuscode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
