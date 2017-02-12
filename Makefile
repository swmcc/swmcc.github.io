#!/usr/bin/env bash

now=`date +"%Y-%m-%d"`

init:
	bundle install

run:
	bundle exec jekyll serve	

build:
	bundle exec jekyll build 

test: 
	rspec

newEntry:
	echo $1
	touch `date +"%Y-%m-%d"`
