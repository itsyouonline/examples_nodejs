This example demonstrates how to use [Express](http://expressjs.com/) 4.x and
[Passport](http://passportjs.org/) to authenticate users using [itsyou.online](http://itsyou.online).  It's based entirely using the [express-4.x-facebook-example](https://github.com/passport/express-4.x-facebook-example). Use
this example as a starting point for your own web applications.

## Instructions

To install this example on your computer, clone the repository and install
dependencies.

```bash
$ git clone git@github.com:itsyouonline/examples_nodejs.git
$ cd examples_nodejs
$ npm install
```

The example uses environment variables to configure the CLIENT_ID, CLIENT_SECRET, SERVER_HOST, SERVER_PORT needed to access itsyou.online API and set the callback URL.

Start the server with those variables set to the appropriate values.

```bash
export CLIENT_ID=<YOUR_ORGANIZATION_GLOBAL_ID>
export CLIENT_SECRET=<YOUR_API_SECRET>
export SERVER_HOST=<HOST> #i.e: localhost
export SERVER_PORT=<PORT> #i.e: 3000
```

Open a web browser and navigate to [http://HOST:PORT/](http://HOST:PORT/)
to see the example in action.

The example uses [passport.js](http://passport.js) with [passport-oauth2](https://github.com/jaredhanson/passport-oauth2) plugin to authenticate with [itsyou.online](http://itsyou.online)
```python
passport.use(new Strategy({
    authorizationURL: 'https://itsyou.online/v1/oauth/authorize',
    tokenURL: 'https://itsyou.online/v1/oauth/access_token',
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://" + process.env.SERVER_HOST + ":" + process.env.SERVER_PORT + "/login/iyo/callback",
    scope: 'user:name'
  },
  function(accessToken, refreshToken, profile, cb) {
    // We will use the access token to get JWT and the user data
  }
));

```

You can change the scope with one of [available scopes](https://github.com/itsyouonline/identityserver/blob/master/docs/oauth2/availableScopes.md)