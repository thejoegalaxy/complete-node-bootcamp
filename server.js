const mongoose = require('mongoose');
const dotenv = require('dotenv');
//configuration file for environment variables
//importing app
const app = require('./app');

dotenv.config({ path: './config.env' });

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
    useFindAndModify: false
})
.then(() => console.log('DB connection successful!'));

// Start Server.
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
