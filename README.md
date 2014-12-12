ifpa-api
========

A node wrapper class for the International Flipper Pinball Association (IFPA) API. The wrapper method calls return q deferreds.

Installation
============

npm install ifpa-api

Usage
=====

var IfpaApi = require('ifpa-api');


// Construct an instance of the IfpaApi class providing your API key as a parameter.
// You can get an API key by following the instructions 
// on http://www.ifpapinball.com/api/documentation/.

var ifpaApiInstance = new IfpaApi('<your_key');

ifpaApiInstance.getCalendarEvents('Sweden').then(
  function(data){
    console.log(data);
  },
  function(err){
    console.log(err);
  }
);
