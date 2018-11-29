#!/usr/bin/env ruby

require 'date'
require 'ImageResize'

@title = ARGV.fetch(0)
@image = ARGV.fetch(1)
@blog = sprintf("%s-%s.html", Date.today.iso8601, @title)

File.open "_posts/#{@blog}", "w"
Image.resize(@image, "img/blog/#{@title}.png", 340, 340)
Image.resize(@image, "img/blog/header/#{@title}.png", 684, 345)

puts "Created"
