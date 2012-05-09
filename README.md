# monitjs

A node.js client library for interacting with Monit (and converts Monits XML responses into JSON).

_Copyright 2012, FeedHenry Ltd. Licensed under the
MIT license, please see the LICENSE file.  All rights reserved._

## Installation
    npm install monitjs

## Example usage

    var monitjs = require('monitjs');
    var monit = new monitjs.Monit('http://admin:monit@localhost:28122');
    
    // get status of all services
    monit.status(function(err, data) {
      console.dir(data);
    });

    // get status of a single service
    monit.status('foo', function(err, data) {
      console.dir(data);
    });

    // get summary of single service
    monit.summary('foo', function(err, data) {
      console.dir(data);
    });

    // start service ('stop' and 'restart' are similar)
    monit.start('foo', function(err, data) {
      console.dir(data);
    });


See the tests for more sample API usage.

