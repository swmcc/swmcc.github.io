var fs = require('fs');
var assert = require('assert');

var metadata = new Object();

var files  = {
    default: '_layouts/default.html',
    config: '_config.yml'
};

describe('test the config setup', function(){
  it('Check to see if the _config.yml file is setup correctly', function(){
    assert.equal(typeof files, 'object');
    assert.ok('default' in files, 'files includes the default file');
    assert.ok('config' in files, 'files includes the config file');
  });
});

describe('test that config.yml is set up correctly', function(){
 it('Check to see if the about links exists', function(){
 });
});

