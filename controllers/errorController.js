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
const sendErrorDev = (err, req, res) => {
  // we are going to test if the url is /api and send a json error
  // otherwise we'll send a html error.
  // A. API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // B. RENDERED WEBSITE
  console.error('Error 😱', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

// production error handler response
const sendErrorProd = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B.
    // Programming or other unknown error: don't leak error details'
    // 1) Log the error
    console.error('Error 😱', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      messge: 'Something went very wrong!',
    });
  }
  // Operational, trusted error: send message to client
  // B) Rendered website.
  if (err.isOperational) {
    //console.log(err.message);
    // RENDERED WEBSITE
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
    // Programming or other unknown error: don't leak error details'
  }

  // B)
  // 1) Log the error
  console.error('Error 😱', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);

  err.statusCode = err.statusCode || 500; //default error status code.
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
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
    sendErrorProd(error, req, res);
  }
};
