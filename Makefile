#!/usr/bin/env bash

run:
	jekyll serve --watch

build:
	jekyll build

push:
	git push origin new

pull:
	git pull origin new
