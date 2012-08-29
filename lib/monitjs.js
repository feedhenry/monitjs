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
  this.q.push({url: this.url + '_status?format=xml', service: service, funct: 'doStatus'}, callback);
};

// Summary info
Monit.prototype.summary = function(service, callback) {
  if (arguments.length === 1) {
    callback = service;
    service = undefined;
  }
  this.q.push({url: this.url + '_status?format=xml&level=summary', service: service, funct: 'doStatus'}, callback);
};

// Start service
Monit.prototype.start = function(service, callback) {
  this.q.push({url: this.url + '_doaction', service: service, action: 'start', funct: 'doAction'}, callback);
};

// Stop service
Monit.prototype.stop = function(service, callback) {
  this.q.push({url: this.url + '_doaction', service: service, action: 'stop', funct: 'doAction'}, callback);
};

// Restart service
Monit.prototype.restart = function(service, callback) {
  this.q.push({url: this.url + '_doaction', service: service, action: 'restart', funct: 'doAction'}, callback);
};

// operations on _doaction POST endpoint. Note: monit doesn't return any data after a successful action.
function doAction (url, service, action, callback) {
  request({url: url, method:'POST', body: 'service=' + service + '&action=' + action}, function(err, response, body){
    if(err) return callback(err);
    // Workaround monit 'service unavailable' errors
    if(response.statusCode === 503) {
      return setTimeout(function(){
        return doAction(url, service, action, callback);
      }, 1000);
    }
    if(response.statusCode !== 200) return callback({statusCode: response.statusCode , error: body});
    return callback(err, body);
  });  
};

// operations on the _status endpoint
function doStatus(url, service, callback) {
  request(url, function(err, response, body){
    if(err) return callback(err);
    // Workaround monit 'service unavailable' errors
    if(response.statusCode === 503) {
      return setTimeout(function(){
        return doAction(url, service, action, callback);
      }, 1000);
    }
    if(response.statusCode !== 200) return callback({statusCode: response.statusCode , error: body});

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

  var self = this;
  this.url = monitUrl;
  // Only want to perform 1 monit action at a time
  this.q = async.queue(function (task, callback) {
    if (task.funct == "doAction") return doAction(task.url, task.service, task.action, callback);
    return doStatus(task.url, task.service, callback);
  }, 1);
  if (!this.url.match(/\/$/)) this.url = monitUrl + '/';
};

exports.Monit = Monit;