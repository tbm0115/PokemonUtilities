﻿//This is the service worker with the Cache-first network

var CACHE = 'pokeutilities-precache-v1.7';
var precacheFiles = [
  /* Add an array of files to precache for your app */
  "./offline.html",
  "./stylesheets/main.css",
  "./jquery/dist/jquery.min.js",
  "./Pokemon/js/Pokemon.es5.min.js",
  "./Pokemon/js/Comparison.es5.min.js",
  "./Pokemon/css/Pokemon.min.css",
  "./Pokemon/css/Layout.min.css",
  "./PokeAPI/api/v2/pd/1/index.json",
  "./PokeAPI/sprites/items/poke-ball.png",
  "./images/404-pokemon.png",
  "./images/icon_spritesheet.png"
];

//Install stage sets up the cache-array to configure pre-cache content
self.addEventListener('install', function (evt) {
  console.log('[SW] The service worker is being installed.');
  evt.waitUntil(precache().then(function () {
    console.log('[SW] Skip waiting on install');
    return self.skipWaiting();
  }));
});


//allow sw to control of current page
self.addEventListener('activate', function (event) {
  console.log('[SW] Claiming clients for current page');
  return self.clients.claim();
});

self.addEventListener('fetch', function (evt) {
  //console.log('[SW] The service worker is serving the asset.' + evt.request.url);
  evt.respondWith(fromCache(evt.request).catch(fromServer(evt.request)));
  evt.waitUntil(update(evt.request));
});


function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll(precacheFiles);
  });
}

function fromCache(request) {
  //we pull files from the cache first thing so we can show them fast
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || fromServer(request);// Promise.reject('no-match');
    });
  });
}

function update(request) {
  //this is where we call the server to get the newest version of the 
  //file to use the next time we show view
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response);
    });
  });
}

function fromServer(request) {
  //this is the fallback if it is not in the cache to go to the server and get it
  return fetch(request).then(function (response) { return response; });
}
