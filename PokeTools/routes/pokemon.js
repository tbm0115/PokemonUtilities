'use strict';
var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET Pokemon Entry page. */
router.get('/:entry', function (req, res) {
  var pRaw = fs.readFileSync(__dirname + '/../public/PokeApi/api/v2/p/' + req.params['entry'] + '/index.json');
  var pokemon = JSON.parse(pRaw);
  pokemon['nameUpper'] = pokemon['name'].substr(0, 1).toUpperCase() + pokemon['name'].substr(1);
  res.render('pokemon', { pokemon: pokemon });// title: '#' + pokemon.id + ' ' + pokemon.nameUpper });
  //res.render('index', { title: 'Express' });
});

module.exports = router;
