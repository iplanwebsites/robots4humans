var async = require('async');
var express = require('express');
var util = require('util');
var gm = require('googlemaps'); //https://github.com/moshen/node-googlemaps/blob/master/lib/googlemaps.js
var _       = require('underscore')._;
/*
var geohash = require("geohash").GeoHash;

var _       = require('underscore')._;
*/

///////////////////////////////////////////////////////////////////
//    Database
////////////////////////////////////////////////////////////////
// app.js
var databaseUrl = process.env.MONGOHQ_URL; //""; // "username:password@example.com/mydb"
var collections = ["users", "events"]
var db = require("mongojs").connect(databaseUrl, collections);

db.users.ensureIndex({
    id: 1
}); //info: http://www.mongodb.org/display/DOCS/Indexes

//geo loc indexes
db.users.ensureIndex({
    'home.loc': '2d'
});
db.users.ensureIndex({
    'work.loc': '2d'
});


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
}), require('faceplate').middleware({
    app_id: process.env.FACEBOOK_APP_ID,
    secret: process.env.FACEBOOK_SECRET,
    scope: 'user_likes,user_photos,user_photo_video_tags,email,user_work_history,location,friends,languages,user_website'
    //NOTE: SCOPE is set on CLIENT SIDE TOKEN!
}));

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
    req.facebook.app(function (app) {
        req.facebook.me(function (user) {
            res.render('fb_test.ejs', {
                layout: false,
                req: req,
                app: app,
                user: user
            });
        });
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



///////////////////////////////////////////////////////////////////
//    Payment Provider  //tut: http://www.catonmat.net/blog/stripe-payments-with-node/
////////////////////////////////////////////////////////////////
var stripe_secret = process.env.STRIPE_SECRET;
var stripe_secret_dev = process.env.STRIPE_SECRET_DEV;

var stripe = require('stripe')(stripe_secret_dev); //maybe publi key goes here??

app.post("/plans/browserling_developer", function (req, res) {
    stripe.customers.create({
        card: req.body.stripeToken,
        email: req.session.email,
        //  // customer's email (get it from db or session)"...",
        plan: "test" // this value has to be created on stripe.com as well...
    }, function (err, customer) {
        if (err) {
            var msg = customer.error.message || "unknown";
            res.send("Error while processing your payment: " + msg);
        } else {
            var id = customer.id;
            console.log('Success! Customer with Stripe ID ' + id + ' just signed up!');
            // save this customer to your database here!
            res.send('ok');
        }
    });
});

app.get('/pay', function (req, res) {
    res.render('pay_form.ejs', {
        title: 'New Template Page',
        layout: true
    });
});




///////////////////////////////////////////////////////////////////
//    Facebook user data fetch tries
////////////////////////////////////////////////////////////////


app.get('/old-index', index);
app.post('/old-index', handle_facebook_request); //required?? //garbage?
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




app.get('/fb', handle_facebook_request);

app.get('/echo', function (req, res) {
    echo = req.param("echo", "no param")
    res.send('ECHO: ' + echo);
});

app.get('/template', function (req, res) {
    res.render('test.ejs', {
        title: 'New Template Page',
        layout: true
    });
});

app.post('/posttest', function (req, res) {
    res.send(req.body);
});


app.get('/friends', function (req, res) {
    req.facebook.get('/me/friends', {
        limit: 5000
    }, function (friends) {
        res.send(friends); //plain json
    });
});

app.get('/me', function (req, res) {
    req.facebook.get('/me', {
        fields: 'email, name, locale, work, languages, education, location, website,friends'
    }, function (data) {
        res.send(data); //plain json
    });
});

///////////////////////////////////////////////////////////////////
//    CONSTANTS
////////////////////////////////////////////////////////////////
app.get('/api/constant', function (req, res) {
  var c={
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
    STRIPE_PUBLIC_DEV: process.env.STRIPE_PUBLIC_DEV,
    STRIPE_PUBLIC: process.env.STRIPE_PUBLIC,
    BASE_PRICE: 1900
  }
  res.send(c);
});



///////////////////////////////////////////////////////////////////
//    Logout
////////////////////////////////////////////////////////////////
app.get('/api/logout', function (req, res) {
  delete req.session.user;
  delete req.session.email;
  delete req.session.uid;
  res.send('good bye! sessions are gone!');
});






///////////////////////////////////////////////////////////////////
//    USER data, and facebook fetching
////////////////////////////////////////////////////////////////
app.get('/api/user', function (req, res) { // fetch data on facebook for our user, saves it to the database.
    ensureSession(req, res, function () {
        db.users.find({
            id: req.session.uid
        }, function (err, users) { // check if user exist... (poll mongo...)
            if (err || !users || (users.length ==0)) { //the dude's note on file
                console.log("No user found...");
                fetchFbUserDate(req, res, function () {
                    console.log("FB2 callback!");
                    res.send(req.user); //the user will have been populated by FB.
                }); //eo fb fetch
            } else {
                console.log("FOUND THE GUY ON FILE!!!" + users.length);
                res.send(users[0]); //the matching record from MOngo
            }
        }); //eo db search
    }); //eo ensure session
    console.log('Session ID : ' + req.session.uid);
}); //eo route

app.get('/ensuresession', function (req, res) { // sets session ID according to FB id
    console.log('ensuresession! + ' + req.session.uid);
    ensureSession(req, res, function () {
        console.log('CALL BAKC ENSURED! + ' + req.session.uid);
        res.send(req.session.uid);
    });
});

//TEST
app.get('/fb-setup', function (req, res) { 
        res.send(req.facebook);
});

function fbId(req, res, cb){
  // https://graph.facebook.com/me/?fields=id
  req.facebook.get('/me', {
      fields: 'id'
  }, function (data) {
      req.fbId = data.id;
      cb();
  });
}


function ensureFacebook(req, res, callback) {
    // if no facebook token, return error, ask to login...
    if (req.facebook.token) { //if logged on facebook...
        callback(req, res);
    } else {
        console.log('FB IS NOT SET, user should proceed to login on client side first');
        res.send({success: false, error: 'No Facebook Token'})
        //no callback/
        // TODO: redirect to home??
    }
}

function ensureSession(req, res, callback) { // make sure that user is connected, and session are set
    // TODO, make sure the FB token exists as well, if not, redirect to homepage, don't call the callback...
    // BUG, if not FB logged, crashes!!
    ensureFacebook(req, res, function () {
      fbId(req,res,function(){ //TODO: this might be optimized: we're checking with facebook everyhime that this token belong to the right user...
        if ((!req.session.uid) || (req.session.uid != req.fbId) || (req.session.uid == undefined)) { 
           req.session.uid = req.fbId;
            console.log('uid (FB just setted or changed) = ' + req.session.uid );
            callback(req, res);
            //});
        } else {
            console.log('uid = ' + ' (session...)' + req.session.uid);
            callback(req, res);
        }
      }); //fb ID fetch
        
    }); //eo ensure fb token
}

function ensureSessionOLD(req, res, callback) { // make sure that user is connected, and session are set
    // TODO, make sure the FB token exists as well, if not, redirect to homepage, don't call the callback...
    // BUG, if not FB logged, crashes!!
    ensureFacebook(req, res, function () {
        if ((!req.session.uid) || (req.session.uid == undefined)) {
            req.facebook.get('/me', {
                fields: 'id'
            }, function (data) {
                var id = data.id; //plain str
                req.session.uid = id;
                console.log('uid (FB just setted) = ' + id + data);
                callback(req, res);
            });
        } else {
            console.log('uid = ' + ' (session...)' + req.session.uid);
            callback(req, res);
        }
    });
}



function outputUser(req, res) { //set the sessions value according to FB data or FB, and output the thing to client
    // set sessions
    var id = req.user.me.id
    req.session.uid = id;
    req.session.email = req.me.email;
    
    res.send(req.user);
}


function fetchFbUserDate(req, res, callback) { //Only for the first time, or when we feel it's time to update user data from FB
  console.log('fetchFbUserDate()');
    async.parallel([

    function (cb) {
        // query 4 friends and send them to the socket for this socket id
        req.facebook.get('/me/friends', {
            limit: 2000
        }, function (friends) {
            req.friends = friends;
            cb();
        });
    }, function (cb) {
        // query 16 photos and send them to the socket for this socket id
        req.facebook.get('/me', {
            fields: 'email, name, first_name, last_name, hometown, religion, timezone, verified, updated_time, locale, work, languages, education, location, website, picture, gender, about, birthday' //add more fields as required, just make sure scope match...
        }, function (me) {
            req.me = me;
            cb();
        });
    /*}, function (cb) {
        // query 4 likes and send them to the socket for this socket id
        req.facebook.get('/me/likes', {
            limit: 500
        }, function (likes) {
            req.likes = likes;
            cb();
        });*/
    }, function (cb) {
        // query 4 likes and send them to the socket for this socket id
        req.facebook.get('/me/likes', {
            limit: 500
        }, function (likes) {
            req.likes = likes;
            cb();
        });
    }, function (cb) {
        // use fql to get a list of my friends that are using this app
        req.facebook.fql('SELECT uid, name, is_app_user, pic_square FROM user WHERE uid in (SELECT uid2 FROM friend WHERE uid1 = me()) AND is_app_user = 1', function (result) {
            req.friends_using_app = result;
            cb();
        });
    }], function () { //Once we received all data from FB...
        console.log('ASYNC CALLS finished');
        console.log(req.me.email + '1');
        var user = { //create user object to be inserted
            id: req.session.uid,
            email: req.me.email,
            sex: req.me.gender,
            birthday: req.me.birthday,
            photo: "http://graph.facebook.com/" + req.session.uid + "/picture?type=large",
            photo_square: "http://graph.facebook.com/" + req.session.uid + "/picture?type=square",
            friends: req.friends,
            likes: req.likes,
            me: req.me,
            fb_token: req.facebook.token  //this line haven't been tested...
        }
        console.log(req.me.email);
        console.log(user.id);
        req.user = user; //so it's accessible down the line
        console.log(req.user);
        callback(req, res);
        
        // save the fb fetches in the database
        db.users.save(user, function (err, saved) {
            if (err || !saved) console.log("User not saved");
            else console.log("User saved");
        });
        
    }); //eo async fb callback
} //eo function




///////////////////////////////////////////////////////////////////
//    Driver/Passenger Querry
////////////////////////////////////////////////////////////////

function user_data(req, res, callback){ //fetches main user data from DB for internal access...
  db.users.find({
      id: req.session.uid  //TODO: only request what we need in the query, friends, + loc data.
  }, function (err, users) { // check if user exist... (poll mongo...)
      if (err || !users || (users.length ==0)) { //the dude's note on file
          console.log("error while fetching user data,,,");
      } else {
          req.user = users[0];
          callback(req, res);
      }
    });//eo DB main user call
}



app.get('/api/rides', function (req, res) { // fetch data on facebook for our user, saves it to the database.
    ensureSession(req, res, function () {
      user_data(req, res, function () {
      
        myFriends  = _.pluck(req.user.friends, 'id'); //returns an array of naked friend ids (for use in 'indexOf' filtering)
        console.log('-------my friends---');
        console.log(myFriends);
        // Search for rides nearby...
        db.users.find({ }, function (err, users) { // TOOD: $near + LIMIT(200) //DO NOT INCLUDE FRIENDS AND LIKE DATA... too big!
            if (err || !users || (users.length ==0)) { //
                console.log("No rides found...");
                // FETCH MORE??  //return apologizes?
            } else {
                console.log("FOUND RIDES: " + users.length);
                  
                  console.log(users.length);
                  async.forEach(users, 
                    function(item, cb){
                      //isFriend?
                      // with underscore, checks if u.id is part of [myfriends]
                      //item['isFriend'] = false; //TODO!! //pluck that thing
                      item['isFriend'] = _.has( myFriends, item['id'] );  //http://documentcloud.github.com/underscore/#has
                      
                      //delete item['me']['name'];
                      delete item['me']['website'];
                      delete item['friends'];
                      delete item['email'];
                      delete item['_id'];
                      delete item['me']['name'];
                      delete item['me']['last_name'];
                      delete item['me']['email']; //TODO, these should be deleted upfront, not pulled from the DB in the first place!
                      
                      item['mutual'] = item['id'];
                      req.facebook.get('/me/mutualfriends/'+ item['id'], { //ttps://graph.facebook.com/me/mutualfriends/FRIEND_ID
                          limit: 2000}, function (data) {
                          item['mutual'] = data;  //TODO: BUG: SCOPE PROBLEM!!
                          cb();
                      });//eo fb get
                      
                      //console.log(item);
                      //cb();
                  }, function(err){
                    console.log('====DONE FILTER ====');
                 
                      res.send(users); // results now equals an array of the existing items, manipulated....
                  });
                  
                  //mutual friends
                  
                  //in a loop, make the 200 call users.length, async
                  /*req.facebook.get('/me/mutualfriends/'+u.id, { //ttps://graph.facebook.com/me/mutualfriends/FRIEND_ID
                      limit: 2000
                  }, function (data) {
                      u.mutual = data;
                      //cb();
                  });//eo fb get*/
                  
                
                //res.send(users2); //the matching record from MOngo
            }
        }); //eo db search
      }); //eo user_data
    }); //eo ensure session
    //console.log('Session ID : ' + req.session.uid);
}); //eo route


/*function isMyFriend(dude_id){
  //myFriends = req.user;
 // https://graph.facebook.com/me/mutualfriends/FRIEND_ID
}*/
/*
db.users.find({sex: "female"}, function(err, users) {
  if( err || !users) console.log("No female users found");
  else users.forEach( function(femaleUser) {
    console.log(femaleUser);
  } );
});*/



///////////////////////////////////////////////////////////////////
//    USER SET LOCATION Location API V1
////////////////////////////////////////////////////////////////
//   /api/setlocation/?home=laval&work=montreal
app.get('/api/setlocation', function (req, res) { // fetch data on facebook for our user, saves it to the database.
    // TODO: ENsure user is logged!
  ensureSession(req, res, function(){
    async.parallel([ // call google-maps for both addresses async
    function (cb) {
        gm.geocode(req.param("home") || 'Oakland', function (err, data) {//return the geometry of the top matching location...
            req.home = data.results[0];
            req.home['loc'] = [req.home.geometry.location.lng, req.home.geometry.location.lat]; //for geospatial indexing
            cb();
        });
    }, function (cb) {
        gm.geocode(req.param("work") || 'San Francisco', function (err, data) {
            req.work = data.results[0];
            req.work['loc'] = [req.work.geometry.location.lng, req.work.geometry.location.lat]; //for geospatial indexing
            cb();
        });
    }, function (cb) {
        gm.distance(req.param("home") || 'montreal', req.param("work") || 'toronto', function (err, data) {
            req.commute = data.rows[0].elements[0]; //only keep distance + duration.
            cb();
        });
    }], function () { //Once we received all data from FB...
        var loc = {
            home: req.home,
            work: req.work,
            commute: req.commute,
            updated: new Date()
        }
        var uid = req.session.uid;
        db.users.update({id: uid}, { $set: { loc: loc }}, function (err, updated) {
            if (err || !updated) console.log("User not updated: " + req.session.uid);
            else console.log("User updated");
        });
        res.send(loc);
    }); //eo parrallel calls
  });//eo ensure-session
});

///////////////////////////////////////////////////////////////////
//    USER SET schedule
////////////////////////////////////////////////////////////////
//   /api/setlocation/?home=laval&work=montreal
app.get('/setschedule', function (req, res) { // fetch data on facebook for our user, saves it to the database.
    // TODO: ENsure user is logged!
  ensureSession(req, res, function(){
        var schedule = {
            starthour: req.params['starthour'],
            finishhour: req.params['finishhour'],
            days: req.params['days'],
            flex: req.params['flex'],
            car: req.params['car'],
            updated: new Date()
        }
        var uid = req.session.uid;
        db.users.update({id: uid}, { $set: { schedule: schedule }}, function (err, updated) {
            if (err || !updated) console.log("User schedule not updated: " + req.session.uid);
            else console.log("User updated with new schedule");
        });
        res.send(schedule); // on production, we can just return the DB success handler...
    }); //eo parrallel calls
});




///////////////////////////////////////////////////////////////////
//    Geo Location API V1
////////////////////////////////////////////////////////////////
app.get('/geohash/:id', function (req, res) {
    var latlon = geohash.decodeGeoHash(req.params['id']);
    lat = latlon.latitude[2];
    lon = latlon.longitude[2];
    zoom = req.params["id"].length + 2;
    res.render('geohash.ejs', {
        layout: false,
        lat: lat,
        lon: lon,
        zoom: zoom,
        geohash: req.params['id']
    });
});

app.get('/reverseGeo/:lat/:long', function (req, res) {
    gm.reverseGeocode('41.850033,-87.6500523', function (err, data) {
        util.puts(JSON.stringify(data));
        res.send(data);
    });
});

app.get('/getCoord/:address', function (req, res) {
    // var address = '520 rue fortune, montreal';
    var address = req.param("address", "montreal")
    gm.geocode(address, function (err, data) {
        util.puts(JSON.stringify(data));
        var coords = data.results[0].geometry.location; //return the geometry of the top matching location...
        res.send(coords);
    });
});



function getElevation(lat, lng, callback) {
    var options = {
        host: 'maps.googleapis.com',
        port: 80,
        path: '/maps/api/elevation/json?locations=' + lat + ',' + lng + '&sensor=true'
    };
    http.get(options, function (res) {
        data = "";
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function (chunk) {
            el_response = JSON.parse(data);
            callback(el_response.results[0].elevation);
        });
    });
};


///////////////////////////////////////////////////////////////////
//    DB EXAMPLES
////////////////////////////////////////////////////////////////
// examples....  (http://howtonode.org/node-js-and-mongodb-getting-started-with-mongojs)
/*
db.users.find({sex: "female"}, function(err, users) {
  if( err || !users) console.log("No female users found");
  else users.forEach( function(femaleUser) {
    console.log(femaleUser);
  } );
});

db.users.save({email: "srirangan@gmail.com", password: "iLoveMongo", sex: "male"}, function(err, saved) {
  if( err || !saved ) console.log("User not saved");
  else console.log("User saved");
});

db.users.update({email: "srirangan@gmail.com"}, {$set: {password: "iReallyLoveMongo"}}, function(err, updated) {
  if( err || !updated ) console.log("User not updated");
  else console.log("User updated");
});
*/



///////////////////////////////////////////////////////////////////
//    FB Demo Fetch (garbage) -loooong  //http://howtonode.org/facebook-connect
////////////////////////////////////////////////////////////////



function handle_facebook_request(req, res) { // default facebook example, Do some fetches on facebook graph asyncrounously

    // if the user is logged in
    if (req.facebook.token) {

        async.parallel([

        function (cb) {
            // query 4 friends and send them to the socket for this socket id
            req.facebook.get('/me/friends', {
                limit: 20
            }, function (friends) {
                req.friends = friends;
                cb();
            });
        }, function (cb) {
            // query 16 photos and send them to the socket for this socket id
            req.facebook.get('/me/photos', {
                limit: 16
            }, function (photos) {
                req.photos = photos;
                cb();
            });
        }, function (cb) {
            // query 4 likes and send them to the socket for this socket id
            req.facebook.get('/me/likes', {
                limit: 20
            }, function (likes) {
                req.likes = likes;
                cb();
            });
        }, function (cb) {
            // use fql to get a list of my friends that are using this app
            req.facebook.fql('SELECT uid, name, is_app_user, pic_square FROM user WHERE uid in (SELECT uid2 FROM friend WHERE uid1 = me()) AND is_app_user = 1', function (result) {
                req.friends_using_app = result;
                cb();
            });
        }], function () {
            render_page(req, res);
        });

    } else {
        render_page(req, res);
    }
}


///////////////////////////////////////////////////////////////////
//    FINI
////////////////////////////////////////////////////////////////
/*
function get_distance(points) { //return the computed driving distance from google maps API
getElevation(40.714728,-73.998672, function(elevation){
  elevations.push(elevation);

elevations.push(elevation);
console.log("Elevations: "+elevations); });

var elevations= []
};
*/

//})