'use strict';
var express = require('express');
var router = express.Router();
var fs = require('fs');

class Cookbook {
  constructor() {
    this.recipes = require(__dirname + '/../public/BOTW/js/recipes.json');
    this.ingredients = require(__dirname + '/../public/BOTW/js/ingredients.json');
  }
}
var botwCookbook = new Cookbook();

/* GET Index page. */
router.get('/', function (req, res) {
  res.render('botw/index', {
    title: 'The Legend of Zelda: Breath of the Wild'
  });
});

router.get('/recipes', function (req, res) {
  res.render('botw/recipes', {
    title: 'Recipes - The Legend of Zelda: Breath of the Wild',
    cookbook: botwCookbook
  });
});
router.get('/ingredients', function (req, res) {
  res.render('botw/ingredients', {
    title: 'Ingredients - The Legend of Zelda: Breath of the Wild',
    cookbook: botwCookbook
  });
});


var fncRouteRecipeEntry = function (req, res) {
  if (typeof (this) !== "undefined" && this !== null && typeof (this.name) !== "undefined" && this.name !== null) {
    res.render('botw/recipeCard', {
      title: this.name + " - Recipes - The Legend of Zelda: Breath of the Wild",
      recipe: this
    });
  } else {
    res.render('botw/404', {
      q: this
    });
  }
};
var fncRouteIngredientEntry = function (req, res) {
  if (typeof (this) !== "undefined" && this !== null && typeof (this.name) !== "undefined" && this.name !== null) {
    res.render('botw/ingredientCard', {
      title: this.name + " - Ingredients - The Legend of Zelda: Breath of the Wild",
      ingredient: this,
      qty: req.query.qty
    });
  } else {
    res.render('botw/404', {
      q: this
    });
  }
};
botwCookbook.recipes.forEach(function (recipe) {
  router.get('/recipes/' + encodeURI(recipe.name), fncRouteRecipeEntry.bind(recipe));
});
botwCookbook.ingredients.forEach(function (ingredient) {
  router.get('/ingredients/' + encodeURI(ingredient.name), fncRouteIngredientEntry.bind(ingredient));
});


module.exports = router;

/*
 * sitemap
 */
var sitemap = require('express-sitemap');
var map = sitemap({
  http: 'https',
  url: 'utilities.games/botw',
  sitemap: 'public/BOTW/sitemap.xml', // path for .XMLtoFile
  robots: 'public/BOTW/robots.txt'
});
map.generate(router);
map.toFile();