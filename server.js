const mongoose = require('mongoose');
const dotenv = require('dotenv');

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
    useFindAndModify: false
})
.then(() => console.log('DB connection successful!'));

// //testTour document is an instance of the Tour model.
// //methods that you can operation on.
// const testTour = new Tour({
//     name: 'The Park Camper',
//     price: 997
// });

// testTour.save().then(doc => {
//     console.log(doc);
// }).catch(err => {
//     console.log('ERROR 😱:',err);
// });

// Start Server.
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
