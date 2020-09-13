// Importing the Express framework
const express = require('express');
// Importing Mongoose
const mongoose = require('mongoose');
// Importing Session, flash and bcrypt
const session = require('express-session');
const flash = require('express-flash');
const bcrypt = require('bcrypt');

// Instantiating the Express app
const app = express();

// Setting the port
const PORT = 8080

// Connecting mongoose to the MongoDB
mongoose.connect('mongodb://localhost/mongooseLoginRegistration', {useNewUrlParser: true, useUnifiedTopology: true})

// Create Schema and models
const UserSchema = new mongoose.Schema({
   email:{type: String, required: true},
   first_name:{type: String, required:true},
   last_name:{type: String, required:true},
   password:{type: String, required:true},
   birthday:{type: Date, required:true}
}, {timestamps: true})


// Create Object of Models
const User = mongoose.model('User', UserSchema)

// Setting Express app to accept POST requests
app.use( express.urlencoded({extended: true}) );
// Setting up session for the app
app.set( 'trust proxy', 1 );
app.use( session({
    saveUnitialized: true,
    resave: 'true',
    secret: 'verysecret',
    cookie: {maxAge: 60000}
}) );
// Enabling flash messages 
app.use( flash() );

// Setting the view engine and directory for views
app.set( 'view engine', 'ejs' );
app.set( 'views', __dirname + '/views' );

// **ROUTES**

// Setting the app to listen on specified port
 app.listen(PORT, () => console.log("listening on port: ", PORT) );