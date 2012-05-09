var assert = require('assert');
var util = require('util');
var monitjs = require("monitjs");
var fs = require('fs');
var async = require('async');

module.exports = {

  'test status': function(){
    var monit = new monitjs.Monit("http://amin:monit@10.0.0.1:2812");
 
    monit.status(function(err, status){
      assert.equal(err, undefined, "Unexpected err: " + util.inspect(err));
       console.log("** All summary: " + util.inspect(status, true, null));
    });

    monit.summary(function(err, summary){
       assert.equal(err, undefined, "Unexpected err: " + util.inspect(err));
       console.log("\n\n** All status: " + util.inspect(summary, true, null));
    });

    monit.status('system_localhost', function(err, status){
       assert.equal(err, undefined, "Unexpected err: " + util.inspect(err));
       console.log("\n\n** Status system_localhost: " + util.inspect(status, true, null));
    });

    monit.summary('system_localhost', function(err, summary){
       assert.equal(err, undefined, "Unexpected err: " + util.inspect(err));
       console.log("\n\n** Summary system_localhost: " + util.inspect(summary, true, null));
    });

    // Start service example - purposely commented (unless you have a service called 'foo')
    /*
    monit.restart('foo', function(err, data){
       assert.equal(err, undefined, "Unexpected err: " + util.inspect(err));
       console.log("data: " + util.inspect(data));
    });
    */
  }
};
