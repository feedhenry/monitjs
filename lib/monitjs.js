var util = require('util');
var http = require('http');
var async = require('async');
var request = require('request');
var xml2js = require('xml2js');

// Get Monit Status Information
Monit.prototype.status = function(service, callback) {
  if (arguments.length === 1) {    
    callback = service;
    service = undefined;
  }
  doStatus(this.url + '_status?format=xml', service, callback);
};

// Summary info
Monit.prototype.summary = function(service, callback) {
  if (arguments.length === 1) {
    callback = service;
    service = undefined;
  }
  doStatus(this.url + '_status?format=xml&level=summary', service, callback);
};

// Start service
Monit.prototype.start = function(service, callback) {
  doAction(this.url + '_doaction', service, 'start', callback);
};

// Stop service
Monit.prototype.stop = function(service, callback) {
  doAction(this.url + '_doaction', service, 'stop', callback);
};

// Restart service
Monit.prototype.restart = function(service, callback) {
  doAction(this.url + '_doaction', service, 'restart', callback);
};

// operations on _doaction POST endpoint. Note: monit doesn't return any data after a successful action.
function doAction(url, service, action, callback) {
  request({url: url, method:'POST', body: 'service=' + service + '&action=' + action}, function(err, response, body){
    if(err) return callback(err);
    if(response.statusCode !== 200) return callback("Bad response: " + response.statusCode + " error: " + body);
    return callback(err, body);
  });  
};


// operations on the _status endpoint
function doStatus(url, service, callback) {
  request(url, function(err, response, body){
    if(err) return callback(err);
    if(response.statusCode !== 200) return callback("Bad response: " + response.statusCode + " error: " + body);

    // convert xml response into json
    var parser = new xml2js.Parser();
    parser.parseString(body, function(err, json){
      if(err) return cb(err);
      if (!service) return callback(err, json);

      // check if we need to filter out a service
      for (var i=0; i<json.service.length; i++) {
        var s = json.service[i];
        if (s.name === service) {
          return callback(undefined, s);
        }
      }
      return callback("Service not found: " + service);
    });
  });
};

// 'Constructor' function
function Monit(monitUrl) {
  if (!monitUrl) {
    throw new Error("Monit url required!");
  }

  this.url = monitUrl;
  if (!this.url.match(/\/$/)) this.url = monitUrl + '/';
};

exports.Monit = Monit;

