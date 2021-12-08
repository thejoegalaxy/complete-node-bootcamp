const dotenv = require('dotenv');

//configuration file for environment variables
dotenv.config({ path: './config.env'});

//importing app
const app = require('./app');


//console.log(process.env);

// Start Server.
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

