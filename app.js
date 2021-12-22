const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

//importing routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// 1. GLOBAL Middleware
// Set Security HTTP headers
app.use(helmet());

//development logging.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// rate limiter; limit requests from same api.
const limiter = rateLimit({
  max: 100, //number of requests. helps against ddos and brute force attacks.
  windowMs: 60 * 60 * 1000, // per hour in milliseconds.
  message: 'Too many request from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//Body parser, reading data from body into req.body.
app.use(express.json({ limit: '10kb' })); //will limit the body to 10kb.

// data sanitization against NoSQL query injection.
// filters out all $ and .
app.use(mongoSanitize());

// data sanitization against XSS.
app.use(xss());

//Prevent parameter pollution.
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// serving static files.
app.use(express.static(`${__dirname}/starter/public`));

// Our own middleware.
// The order of the middlewares below matters.
// app.use((req, res, next) => {
//   console.log('Hello from the middleware 😎');
//   next();
// });

//middleware creating a requestTime value.
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
  next();
});

//tourRouter, userRouter, reviewRouter middleware
// mounting routers.
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

//route handler for all un matched routes.
app.all('*', (req, res, next) => {
  //when an err is passed into next, express will skip all other middleware on the stack
  //and assume there is an error and execute the global error handling middleware.
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// error handling middlware.
app.use(globalErrorHandler);

module.exports = app;
