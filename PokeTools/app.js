'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var zlib = require('zlib');
var gzip = zlib.createGzip();

var routes = require('./routes/index');
var pokemon = require('./routes/pokemon');
var botw = require('./routes/botw');
var users = require('./routes/users');

const https = require('http-to-https');


var app = express();
app.use(https([/localhost(:\d{1,5})?/], [/\/insecure/], 301));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* GET home page. */
app.get('/', function (req, res) {
  var RSSParser = require('rss-parser');
  var parser = new RSSParser();
  parser.parseURL("https://blog.utilities.games/feed/", function (err, feed) {
    res.render('index', {
      title: 'Home',
      rss: feed
    });
  });
});
/* GET about page. */
app.get('/about', function (req, res) {
  res.render('about', { title: 'About' });
});
/* GET privacy policy page. */
app.get('/privacy', function (req, res) {
  res.render('privacy', { title: 'Privacy Policy' });
});
/* GET contact page. */
app.get('/contact', function (req, res) {
  res.render('contact', { title: 'Contact Us' });
});
//app.use('/', routes);
app.use('/pokemon', pokemon);
app.use('/botw', botw);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  if (err.status === 404) {
    res.status(404);
    res.render('error', {
      message: '404 Not Found',
      error: {}
    });
  } else {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  }
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});



/*
 * sitemap
 */
var sitemap = require('express-sitemap');
var map = sitemap({
  http: 'https',
  url: 'utilities.games',
  sitemap: 'public/sitemap.xml', // path for .XMLtoFile
  robots: 'public/robots.txt'
});
map.generate4(app, [ '/pokemon' ]);
//map.reset();
//map.generate(pokemon);
map.toFile();