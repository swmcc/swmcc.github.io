#!/usr/bin/env bash

init:
	gem install bundle
	bundle install

run:
	bundle exec jekyll serve	

build:
	bundle exec jekyll build 

test: 
	bundle exec rspec --format doc
