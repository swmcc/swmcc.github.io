var fs = require('fs');
var yaml = require('js-yaml');
var assert = require('assert');

var posts = fs.readdirSync("_posts/");

posts.forEach(function(post) {
  describe(post, function() {
    var ext = post.split('.');
    it('all file extensions inside blog/ should be .html', function(){
      assert.equal(ext[ext.length - 1], 'html');
    });  

    var data = read_post(post);
    var metadata = data.metadata;

    it('ensure that the YAML is correct', function(){
      assert.equal(typeof metadata, 'object');
      assert.ok('layout' in metadata, 'the layout element exists');
      assert.ok('title' in metadata, 'the title element exists');
      assert.ok('tags' in metadata, 'the tag element exists');
      assert.ok('published' in metadata, 'the published exists');
      assert.ok('status' in metadata, 'the status exists');
    });
  });
});

function read_post(filename) {
  var buffer = fs.readFileSync("_posts/" + filename), file = buffer.toString('utf8');

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

