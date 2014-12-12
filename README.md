ifpa-api
========

A node wrapper class for the International Flipper Pinball Association (IFPA) API.

Installation
============

npm install ifpa-api

Usage
=====

Construct an instance of the IfpaApi class providing your API key as a parameter. You can get an API key by following the instructions on http://www.ifpapinball.com/api/documentation/

```javascript
var IfpaApi = require('ifpa-api');
var ifpaApiInstance = new IfpaApi('<your_key');

ifpaApiInstance.getCalendarEvents('Sweden').then(
  function(data){
    console.log(data);
  },
  function(err){
    console.log(err);
  }
);
```
