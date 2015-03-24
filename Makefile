#!/usr/bin/env bash
now=`date +"%Y-%m-%d"`

init:
	bundle install
	npm install

run:
	bundle exec jekyll serve

tests:
	mocha 

newEntry:
	touch _posts/${now}-${title}.html
