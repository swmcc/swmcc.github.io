# theonlystephen.com

Personal website of Stephen McCullough

## Dependencies

Here's what you need to run the website locally.

### Bundler

This will install all gems required to run the app.

    gem install bundler
    cd swmcc.github.io
    bundle install

### Run site locally

This site is built on Jekyll. To run the site in your browser locally use:

    jekyll serve

Note that Compass must be running when making changes to CSS, see below.

Please refer to Jekyll's documentation for help with setting it up http://jekyllrb.com/docs/home/

### Compass

To use sass, Compass is being used. Edit scss within sass folder, do not edit the css files directly. To install and watch scss files for changes:

    gem install compass
    compass install compass
    compass watch

