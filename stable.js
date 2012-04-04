var async   = require('async');
var express = require('express');
var util    = require('util');
var geohash = require("geohash").GeoHash;
var gm      = require('googlemaps');  //https://github.com/moshen/node-googlemaps/blob/master/lib/googlemaps.js
var _       = require('underscore')._;

///////////////////////////////////////////////////////////////////
//    Database
////////////////////////////////////////////////////////////////

// app.js
var databaseUrl = process.env.MONGOHQ_URL ; //""; // "username:password@example.com/mydb"
var collections = ["users", "events"]
var db = require("mongojs").connect(databaseUrl, collections);

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


//var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;
//var articleProvider = new ArticleProvider('localhost', 27017); //mongo host

///////////////////////////////////////////////////////////////////
//    Server stuff
////////////////////////////////////////////////////////////////


// create an express webserver
var app = express.createServer(
  express.logger(),
  express.static(__dirname + '/public'),
  express.bodyParser(),
  express.cookieParser(),
  // set this to a secret value to encrypt session cookies
  express.session({ secret: process.env.SESSION_SECRET || 'topsecret55887456' }),
  require('faceplate').middleware({
    app_id: process.env.FACEBOOK_APP_ID,
    secret: process.env.FACEBOOK_SECRET,
    scope:  'user_likes,user_photos,user_photo_video_tags,email,user_work_history,offline_access,location,friends,languages,user_website' //TODO: offline_access is deprecated now.
  })
);

//app.use(express.bodyParser()); //used to parse posted JSON //already there...

// listen to the PORT given to us in the environment
var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log("Listening on " + port);
});

app.dynamicHelpers({
  'host': function(req, res) {
    return req.headers['host'];
  },
  'scheme': function(req, res) {
    req.headers['x-forwarded-proto'] || 'http'
  },
  'url': function(req, res) {
    return function(path) {
      return app.dynamicViewHelpers.scheme(req, res) + app.dynamicViewHelpers.url_no_scheme(path);
    }
  },
  'url_no_scheme': function(req, res) {
    return function(path) {
      return '://' + app.dynamicViewHelpers.host(req, res) + path;
    }
  },
});

function render_page(req, res) {
  req.facebook.app(function(app) {
    req.facebook.me(function(user) {
      res.render('index.ejs', {
        layout:    false,
        req:       req,
        app:       app,
        user:      user
      });
    });
  });
}

///////////////////////////////////////////////////////////////////
//    FB connect
////////////////////////////////////////////////////////////////

function handle_facebook_request(req, res) {

  // if the user is logged in
  if (req.facebook.token) {

    async.parallel([
      function(cb) {
        // query 4 friends and send them to the socket for this socket id
        req.facebook.get('/me/friends', { limit: 20 }, function(friends) {
          req.friends = friends;
          cb();
        });
      },
      function(cb) {
        // query 16 photos and send them to the socket for this socket id
        req.facebook.get('/me/photos', { limit: 16 }, function(photos) {
          req.photos = photos;
          cb();
        });
      },
      function(cb) {
        // query 4 likes and send them to the socket for this socket id
        req.facebook.get('/me/likes', { limit: 20 }, function(likes) {
          req.likes = likes;
          cb();
        });
      },
      function(cb) {
        // use fql to get a list of my friends that are using this app
        req.facebook.fql('SELECT uid, name, is_app_user, pic_square FROM user WHERE uid in (SELECT uid2 FROM friend WHERE uid1 = me()) AND is_app_user = 1', function(result) {
          req.friends_using_app = result;
          cb();
        });
      }
    ], function() {
      render_page(req, res);
    });

  } else {
    render_page(req, res);
  }
}

///////////////////////////////////////////////////////////////////
//    Geo Location API V1
////////////////////////////////////////////////////////////////

app.get('/', handle_facebook_request);
app.post('/', handle_facebook_request);

app.get('/echo', function(req, res){
	echo = req.param("echo", "no param")
	res.send('ECHO: '+echo); 
});

app.get('/template', function(req, res){
  res.render('test.ejs', { title: 'New Template Page', layout: true }); 
});

app.post('/posttest', function(req, res){
  res.send(req.body);
});


app.get('/friends', function(req, res){
  req.facebook.get('/me/friends', { limit:5000 }, function(friends) {
      //res.send('friends: ' + require('util').inspect(friends));
      res.send(data); //plain json
    });
});

app.get('/me', function(req, res){
  req.facebook.get('/me', { }, function(data) {
      //res.send('friends: ' + require('util').inspect(data));
      res.send(data); //plain json
    });
});

app.get('/me2', function(req, res){
  req.facebook.get('/me', { fields: 'email, name, locale, work, languages, education, location, website,friends'}, function(data) {
      //res.send('' + require('util').inspect(data));
      res.send(data); //plain json
    });
});


app.post('/api/setCity', function(req, res){
  var id = '12345'
db.users.update({id: id}, {$inc:{level:1}}, {multi:false}, function(err) {
    // the update is complete
});

///////////////////////////////////////////////////////////////////
//    Geo Location API V1
////////////////////////////////////////////////////////////////

app.get('/geohash/:id', function(req, res){
  var latlon = geohash.decodeGeoHash(req.params['id']);
  lat = latlon.latitude[2];
  lon = latlon.longitude[2];
  zoom = req.params["id"].length+2;
  res.render('geohash.ejs', { layout: false, lat:lat, lon:lon, zoom:zoom, geohash:req.params['id']});
});

app.get('/reverseGeo/:lat/:long', function(req, res){
  gm.reverseGeocode('41.850033,-87.6500523', function(err, data){
    util.puts(JSON.stringify(data));
    res.send(data); 
  });
});

app.get('/getCoord/:address', function(req, res){
  // var address = '520 rue fortune, montreal';
  var address = req.param("address", "montreal")
  gm.geocode(address, function(err, data){
    util.puts(JSON.stringify(data));
    var coords = data.results[0].geometry.location; //return the geometry of the top matching location...
    res.send(coords); 
  });
});



function getElevation(lat,lng, callback){ 
  var options = {
    host: 'maps.googleapis.com',
    port: 80,
    path: '/maps/api/elevation/json?locations='+lat+','+lng+'&sensor=true'
  };
  http.get(options, function(res) {
    data = "";
    res.on('data', function (chunk) {
    data += chunk; });
    res.on('end', function (chunk) { 
      el_response = JSON.parse(data);
      callback(el_response.results[0].elevation); 
    }); 
  })
}



/*
function get_distance(points) { //return the computed driving distance from google maps API
getElevation(40.714728,-73.998672, function(elevation){
  elevations.push(elevation);

elevations.push(elevation);
console.log("Elevations: "+elevations); });

var elevations= []
};
*/





