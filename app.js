const express = require('express');
const morgan = require('morgan');

//importing routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1. Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/starter/public`));

//Our own middleware.
// The order of the middlewares below matters.
// app.use((req, res, next) => {
//   console.log('Hello from the middleware 😎');
//   next();
// });

//middleware creating a requestTime value.
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//tourRouter, userRouter middleware
// mounting routers.
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

//route handler for all un matched routes.
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`
  // })
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;

  //when an err is passed into next, express will skip all other middleware on the stack
  //and assume there is an error and execute the global error handling middleware.
  next(err);
});

// error handling middlware.
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500; //default error status code.
  err.status = err.status || 'error'
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;