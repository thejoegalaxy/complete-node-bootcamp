const mongoose = require('mongoose');
const dotenv = require('dotenv');

// listening for uncaughtException
process.on('uncaughtException', (err) => {
  // console.log('UNCAUGHT EXCEPTION! 😱  Shutting down... ');
  // console.log(err.name, err.message);
  process.exit(1);
});

//configuration file for environment variables
dotenv.config({ path: './config.env' });

//importing app
const app = require('./app');

// create DB var by getting config.env
// DB password & replacing placeholder.
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//extra fields to deal with deprecation warnings.
// just use them in your apps.
mongoose
  //Local mongoDB connection.
  //.connect(process.env.DATABASE_LOCAL, {
  // Atlas remote DB
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

// Start Server.
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//each time there is an unhandledRejection
// the process object will emit an object called unhandledRejection
// we can subscribe to that event.
// handles all unhandled promise rejections for entire app.
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 😱  Shutting down... ');
  server.close(() => {
    process.exit(1);
  });
});
