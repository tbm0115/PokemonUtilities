'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sitemap = require('express-sitemap');
var zlib = require('zlib');
var gzip = zlib.createGzip();

var routes = require('./routes/index');
var pokemon = require('./routes/pokemon');
var users = require('./routes/users');

var app = express();

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

app.use('/', routes);
app.use('/pokemon', pokemon);
app.use('/users', users);

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
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});

/*
 * sitemap
 */
var _sitemap = sitemap({
  http: 'https',
  url: 'utilities.games',
  sitemap: 'public/sitemap.xml', // path for .XMLtoFile
  robots: 'public/robots.txt',
  map: {
    '/': ['get'],
    '/pokemon': ['get'],
    '/pokemon/:entry': ['get'],
    '/pokemon/comparison/stats': ['get'],
    '/pokemon/comparison/stats-lite/:data': ['get'],
    '/pokemon/progress': ['get']
  },
  route: {
    'https://utilities.games/': {
      lastmod: '2018-10-28',
      changefreq: 'always',
      priority: 1.0
    },
    'https://utilities.games/pokemon': {
      lastmod: '2018-10-20',
      changefreq: 'irregular'
    },
    'https://utilities.games/pokemon/:entry': {
      lastmod: '2018-10-20',
      changefreq: 'irregular'
    },
    'https://utilities.games/pokemon/comparison/stats': {
      lastmod: '2018-10-28',
      changefreq: 'irregular'
    },
    'https://utilities.games/pokemon/comparison/stats-lite/:data': {
      lastmod: '2018-10-28',
      changefreq: 'always'
    },
    'https://utilities.games/pokemon/progress': {
      lastmod: '2018-10-20',
      changefreq: 'never'
    }
  }
}).XMLtoFile();
//var map = sitemap({
//  generate: app
//});
//app.get('/sitemap.xml', function (req, res) {
//  map.XMLtoWeb(res);
//}).get('/robots.txt', function (req, res) {
//  map.TXTtoWeb(res);
//});
//sitemap.generate(app); // generate sitemap from express route, you can set generate inside sitemap({})

//sitemap.XMLtoFile(); // write this map to file
