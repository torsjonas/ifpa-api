ifpa-api
========

A Promise based node client for the International Flipper Pinball Association (IFPA) API.

Installation
============

npm install ifpa-api

Usage
=====

Construct an instance of the IfpaApi class providing your API key as a parameter. You can get an API key by following the instructions on http://www.ifpapinball.com/api/documentation/

```javascript
const IfpaApi = require('ifpa-api');
const ifpaApi = new IfpaApi('<your_key');

ifpaApi.getActiveCalendarEvents('Sweden')
  .then(result => console.log(JSON.stringify(result)));

ifpaApi.getPlayerInformation(20000)
  .then(result => console.log(JSON.stringify(result)));

```
