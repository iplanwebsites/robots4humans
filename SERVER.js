var async = require('async');
var express = require('express');
var util = require('util');

var _       = require('underscore')._;
/*
var geohash = require("geohash").GeoHash;

var _       = require('underscore')._;
*/


///////////////////////////////////////////////////////////////////
//    Express server setup
////////////////////////////////////////////////////////////////
// create an express webserver
var app = express.createServer(
express.logger(), express.static(__dirname + '/public'), express.bodyParser(),
//express.bodyDecoder(), //for stripe??
express.cookieParser(),
// set this to a secret value to encrypt session cookies
express.session({
    secret: process.env.SESSION_SECRET || 'topsecret55887456'
})
);

app.debug = true; // a silly attempt to centralized that...

var port = process.env.PORT || 3000; // listen to the PORT given to us in the environment

app.listen(port, function () {
    console.log("Listening on " + port);
});

app.dynamicHelpers({
    'host': function (req, res) {
        return req.headers['host'];
    },
    'scheme': function (req, res) {
        req.headers['x-forwarded-proto'] || 'http'
    },
    'url': function (req, res) {
        return function (path) {
            return app.dynamicViewHelpers.scheme(req, res) + app.dynamicViewHelpers.url_no_scheme(path);
        }
    },
    'url_no_scheme': function (req, res) {
        return function (path) {
            return '://' + app.dynamicViewHelpers.host(req, res) + path;
        }
    },
});



function render_page(req, res) {

            res.render('fb_test.ejs', {
                layout: false,
                req: req,
                app: app,
                user: user
            });

}


function index(req, res){  //TODO: MAKE the delivery 100% static, no node processing.
  res.sendfile(__dirname + '/public/index.html' );  //+ req.url
  /*res.render('public/index.html', {
      layout: false,
      req: req,
      app: app
  });*/
}

///////////////////////////////////////////////////////////////////
//    email server
////////////////////////////////////////////////////////////////
/*
var SendGrid = require('sendgrid').SendGrid;
var sendgrid = new SendGrid(
process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);

app.get('/emailme', function (req, res) { //testing route - should work locally as well once .env is populated with credential
    sendgrid.send({
        to: 'info@iplanwebsites.com',
        from: 'test@example.com',
        subject: 'test',
        text: 'Sending email with NodeJS through SendGrid!'
    }, function () {
        res.send('email sent!'); //handle error callback??
    });
});

*/


///////////////////////////////////////////////////////////////////
//    Facebook user data fetch tries
////////////////////////////////////////////////////////////////


app.get('/old-index', index);
app.get('/location', index);
app.get('/rides', index);
app.get('/me', index);
app.get('/messages', index);
app.get('/pay', index);
app.get('/profile', index);
app.get('/pref', index);
app.get('/prefs', index);
app.get('/preferences', index);
app.get('/promo', index);
app.get('/driver', index);
app.get('/passenger', index);
app.get('/driver/:user_id', index);
app.get('/passenger/:user_id', index);
app.get('/dashboard', index);
app.get('/home', index);
app.get('/settings', index);
app.get('/about', index);
app.get('/history', index);
app.get('/history', index);
app.get('/history', index);
app.get('/history', index);
app.get('/history', index);
app.get('/history', index);






