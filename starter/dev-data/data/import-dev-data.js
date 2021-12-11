const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require("../../../models/tourModel");
//configuration file for environment variables
//importing app

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

// READ JSON file
//read file create an array of javascript objects
const tours =  JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8'));

//Import Data into DB
const importData = async () => {
    try{
        await Tour.create(tours);
        console.log('Data successfully loaded!');
        process.exit();
    }catch(err){
        console.log(err);
    }
}

// Delete all from db
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted!');
        process.exit();
    }catch(err) {
        console.log(err);
    }
}

if(process.argv[2] === '--import') {
    importData();
}else if (process.argv[2] === '--delete') {
    deleteData();
}

console.log(process.argv);