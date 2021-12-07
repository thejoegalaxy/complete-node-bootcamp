const express = require('express');
const morgan = require('morgan');

//importing routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1. Middleware
app.use(morgan('dev'));

app.use(express.json());

//Our own middleware.
// The order of the middlewares below matters.
app.use((req, res, next) => {
    console.log('Hello from the middleware 😎');
    next();
});

//middleware creating a requestTime value.
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

//tourRouter, userRouter middleware 
// mounting routers.
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

module.exports = app;
