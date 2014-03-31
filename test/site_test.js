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
  
      var buffer = fs.readFileSync(files['config']),
      file = buffer.toString('utf8');
    
      it(files['config'], function() {
        assert.doesNotThrow(function() { jsyaml.load(frontmatter); });
      });

//      assert.ok('name' in file, '_config contains a name parameter'); 

  });
});

