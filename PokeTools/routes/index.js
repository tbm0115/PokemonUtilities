'use strict';
var express = require('express');
var router = express.Router();

let RSSParser = require('rss-parser');
/* GET home page. */
router.get('/', function (req, res) {
  let parser = new RSSParser();
  parser.parseURL("https://blog.utilities.games/feed/", function (err, feed) {
    res.render('index', {
      title: 'Home',
      rss: feed
    });
  });
});
/* GET about page. */
router.get('/about', function (req, res) {
  res.render('about', { title: 'About' });
});
/* GET privacy policy page. */
router.get('/privacy', function (req, res) {
  res.render('privacy', { title: 'Privacy Policy' });
});
/* GET contact page. */
router.get('/contact', function (req, res) {
  res.render('contact', { title: 'Contact Us' });
});


module.exports = router;
