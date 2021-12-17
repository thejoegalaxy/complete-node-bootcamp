const AppError = require('../utils/appError');

//bad id value on query.
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

//duplicate field value.
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  //console.log(value);
  const message = `Duplicate field value: ${value}  Please use another value!`;
  return new AppError(message, 400);
};

//handle validation errors.
const handleValidationErrorDB = (err) => {
  //loop through errors object for each element return the el.message.
  const errors = Object.values(err.errors).map((el) => el.message);

  // join the array of error messages with a ". " and create the message.
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token.  Please login again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Token expired. Please login again', 401);

// development error handler response.
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// production error handler response
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details'
  } else {
    // 1) Log the error
    console.error('Error 😱', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      messge: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);

  err.statusCode = err.statusCode || 500; //default error status code.
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };
    //console.log(err.name, err.code);
    //castError is for example bad id value on a query.
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
