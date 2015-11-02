var fs = require('fs');
var yaml = require('js-yaml');
var assert = require('chai').assert
var posts = fs.readdirSync("_posts/");
var path = require("path");
var path_exists = require('path-exists');

posts.forEach(function(post) {
  describe(post, function() {
    var ext = post.split('.');
    var data = read_post(post);
    it('all file extensions inside blog/ should be .html', function(){
      assert.equal(ext[ext.length - 1], 'html');
    });  

    var metadata = data.metadata;
    it('ensure that the YAML is correct', function(){
      assert.equal(typeof metadata, 'object');
      var meta_keys = ['type', 'layout', 'published', 'status', 'image-large', 'image-small'];
      for (var key in meta_keys) { 
        assert.ok(meta_keys[key] in metadata, 'exists')
      }
    });

    it('ensure that the header and list graphics exist', function(){
      var large_filepath = path.resolve(__dirname) + "/.." + metadata['image-large'];
      var small_filepath = path.resolve(__dirname) + "/.." + metadata['image-small'];
      assert.isTrue(path_exists.sync(large_filepath));
      assert.isTrue(path_exists.sync(small_filepath));
    });

  });
});

function read_post(filename) {
  var buffer = fs.readFileSync("_posts/" + filename), file = buffer.toString('utf8');

  it('all blog urls should no longer have the date inside them', function(){
    var urls = file.match(/\/blog\/\d{4}\/\d{2}\/\d{2}\//g);
    assert.ok(!urls, filename + ' has some articles with old an old blog uri');
  });

  try {
    var parts = file.split('---'), frontmatter = parts[1];

    it(filename, function() {
      assert.doesNotThrow(function() { yaml.load(frontmatter); });
    });

    return {
      name: filename,
      file: file,
      metadata: yaml.load(frontmatter),
      content: parts[2]
    };
  } catch(err) {}
}

