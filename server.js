var https = require('https');
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-oauth2').Strategy;
var jwtDecode = require('jwt-decode');


// Configure the Oauth2 strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the itsyou.online API on the user's
// behalf.  The function must invoke `cb` with a user object, which will be set at `req.user` 
// in route handlers after authentication.
passport.use(new Strategy({
    authorizationURL: 'https://itsyou.online/v1/oauth/authorize',
    tokenURL: 'https://itsyou.online/v1/oauth/access_token',
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://" + process.env.SERVER_HOST + ":" + process.env.SERVER_PORT + "/login/iyo/callback",
    scope: 'user:name'
  },
  function(accessToken, refreshToken, profile, cb) {
    // We will use the access token to get JWT and .

    // Basic options for http requests:
    var options = {
      host: 'itsyou.online',
      headers: {'Authorization': 'token ' + accessToken}
    };
    console.log(options);
    // Get JWT using accessToken
    options['path'] = '/v1/oauth/jwt'
    https.request(options, function(response) {
      var jwt = '';
      response.on('data', function (chunk) {
        jwt += chunk;
      });
      response.on('end', function () {
        //Get user data
        jwt_data = jwtDecode(jwt);
        username = jwt_data['username'];
        options['path'] = "/api/users/"+username+"/info"
        https.request(options, function(response) {
          var user_data = '';
          response.on('data', function (chunk) {
            user_data += chunk;
          });
          response.on('end', function () {
            cb(null, user_data);
          });
        }).end();

      });
    }).end();
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete user profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  obj = JSON.parse(obj);
  cb(null, obj);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/iyo',
  passport.authenticate('oauth2'));

app.get('/login/iyo/callback', 
  passport.authenticate('oauth2', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

app.listen(Number(process.env.SERVER_PORT), process.env.SERVER_HOST);
