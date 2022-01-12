const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

//importing routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src  'self' api.titles.mapbox.com",
    "script-src-elem 'self' api.titles.mapbox.com"
  );
  next();
});

//view engine.
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1. GLOBAL Middleware
// serving static files.
// note: had to change this to establish public in /starter.
// for base.pug to work with css, etc.
app.use(express.static(path.join(__dirname, '/starter/public')));

// Set Security HTTP headers
//had to add if Production because helmet was stopping mapbox.  need a fix??
// if (process.env.NODE_ENV === 'production') {
//   //app.use(helmet());
//   // app.use(
//   //   helmet.contentSecurityPolicy({
//   //     useDefaults: true,
//   //     directives: {
//   //       "script-src": ["'self'", "cdn.jsdelivr.net/npm/axios/dist/axios.min.js"]
//   //     },
//   //   })
//   // );
// }

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
// form sends as urlencoded. 10kb limit.
//app.use(express.urlencoded({ extend: true, limit: '10kb' })); //turned this off unless using to update.
// parse the data from the cookie.
app.use(cookieParser());

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

app.use(compression());

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
  //console.log(__dirname);
  //console.log(req.cookies);
  next();
});

//tourRouter, userRouter, reviewRouter middleware
// mounting routers.
// 3. Routes.
app.use('/', viewRouter);
app.use('/login', viewRouter);
//app.use('/tours', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//route handler for all un matched routes.
app.all('*', (req, res, next) => {
  //when an err is passed into next, express will skip all other middleware on the stack
  //and assume there is an error and execute the global error handling middleware.
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// error handling middlware.
app.use(globalErrorHandler);

module.exports = app;
