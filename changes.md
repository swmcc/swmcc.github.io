# Changes

The site is now built in [jekyll](http://jekyllrb.com). I have tried to
keep the files as simple as possible. It basically works like this:

# File Structure

You care about the following files:

```
  - index.html

  - blog/index.html

  - _layouts/*

  - _posts/*
```

## index.html

The front page of this site. At the start of every file to be built there is
a ```---``` section with some markup inside so jekyll knows what to do.

Jekyll knows what file to help build this with by looking in the ```layout``` 
element. It will just use whatever is ```_layout/<element>.html```

## blog/index.html

Just the blog index page. It simply goes through whtever is in ```_posts``` and
builds a list. It also takes the tags and whacks them in. 

## _layouts/* 

The layout files live in ```_layouts``` file. In here there are several 
files:

## _posts/*

This is where the blog posts are kept. I would live in here alone as I run a 
few tests on the markup. The only thing I can see in here is that some html
elements are behaving oddly. I can go in and change them later but the only
thing that needs changing now is the default behaviour of a 'a' link.

```
  - blog_index

  - default

  - post
```

### Files

The filenames require some attention but they get the job done for the time
being.

#### blog_index

This is the file that ```blog/index.html``` uses. I moved it out to a be
a ```_layout``` file as I will want to have various other index pages such
as yearly, monthly, category and tags index pages.

#### default

This is basically where the ```index.html``` file gets used. I think the 
portfolio pages are just going to be blog entries just treated differently.
Probably no need to have this as a ```_layout``` file but screw it.

#### post

This is the file that each individual blog entry uses. So anything in 
```_posts``` use this. 


### Deployment

#### Commands

```
  - make run - will run the local jekyll server

  - make pull - simply pulls stuff from the new branch. My changes.

  - make push - simply pushes stuff to the new branch.
```

When you push to new (and the tests pass - they always will) it will get 
deployed to [here](http://new.theonlystephen.com). 

