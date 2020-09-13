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
   email:{type: String, required: [true, 'Email is required'], match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "email entered is not of a valid form"]},
   first_name:{type: String, required:[true, 'A first name is required'], minlength:[2, 'First name must be at least 2 characters long']},
   last_name:{type: String, required:[true, 'A last name is required'], minlength:[2, 'Last name must be at least 2 characters long']},
   password:{type: String, required:[true, 'A password is required'], minlength: [8, 'Your password must be at least 8 characters long']},
   birthday:{type: Date, required:[true, 'You must enter your birthdate']}
}, {timestamps: true})


// Create Object of Models
const User = mongoose.model('User', UserSchema)


// Setting the static directoy for express
app.use(express.static(__dirname + '/static'));
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
app.get('/', (req, res) => {
    res.render('index')
});
app.post('/register', (req, res) => {
    User.findOne({email:req.body.email}, (err,user) => {
        if(user){
            req.flash('reg', "That email is already in use.")
            return res.redirect('/')
        }
        else {
            if(req.body.password != req.body.passwordConfirm){
                req.flash('reg', "Passwords do not match")
                return res.redirect('/')
            }
        }
        bcrypt.hash(req.body.password, 10)
            .then(hashed_password => {
                const char = req.body.password.search(/[a-z]/);
                const num = req.body.password.search(/[0-9]/);
                const upperChar = req.body.password.search(/[A-Z]/);
                const length = req.body.password.length;
                if(char<0 || num<0 || upperChar<0){
                    req.flash('reg', "Password requires at least one uppercase letter and one number")
                    hashed_password = req.body.password;
                    req.session.errors = 1;
                }
                if(length < 8){
                    hashed_password = req.body.password;
                }
                newUser = new User({first_name: req.body.first_name, last_name: req.body.last_name, email: req.body.email, birthday: req.body.birthday, password: hashed_password})
                newUser.validate((err) => {
                    if(err){
                        for(let key in err.errors){
                            req.flash('reg', err.errors[key].message);
                        }
                        res.redirect('/')
                    }
                    else if(req.session.errors){
                        console.log(req.session.errors);
                        res.redirect('/');
                    }
                    else {
                        newUser.save(err => {
                            req.session.user_id = newUser.id;
                            res.redirect('/success/'+newUser.id);
                        });
                    }
                });
            })
            .catch(err => res.redirect('/'))
    })
});
app.post('/login', (req, res) => {
    User.findOne({email: req.body.email}, (err,user) => {
        if(user){
            bcrypt.compare(req.body.password, user.password)
                .then(req.session.email = user.email, req.session.name = user.first_name, res.render('success', {user:req.session}))
                .catch(err => {res.json(err)})
        }
        else {
            req.flash('reg', "There is no user with those credentials.")
            res.redirect('/')
        }
    })    
});
app.post('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
});

// Setting the app to listen on specified port
 app.listen(PORT, () => console.log("listening on port: ", PORT) );