#!/usr/bin/env bash
init:
	bundle install

run:
	jekyll build --watch

run:
	bundle exec jekyll serve	

build:
	bundle exec jekyll build 
