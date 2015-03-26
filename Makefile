#!/usr/bin/env bash
now=`date +"%Y-%m-%d"`

init:
	bundle install
	npm install

run:
	jekyll build --watch

tests:
	mocha 

newEntry:
	touch _posts/${now}-${title}.html

run:
	jekyll serve --watch

build:
	jekyll build

push:
	git push origin new

pull:
	git pull origin new