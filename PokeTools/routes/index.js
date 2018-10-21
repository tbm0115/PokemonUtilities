'use strict';
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Home' });
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
