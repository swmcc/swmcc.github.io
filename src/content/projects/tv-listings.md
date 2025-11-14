---
title: "TV-Listings: Perl and Linear TV"
description: "A Perl-based TV listings tracker from 2003-2007 that parsed XMLTV data, sent daily emails, and existed before streaming killed linear TV"
pubDate: 2025-11-14
tags: ["perl", "mysql", "xmltv", "nostalgia", "vintage"]
---

## The Project

[TV-Listings](https://github.com/swmcc/TV-Listings) is a Perl application I built between 2002 and 2007 for tracking TV shows in the era of linear television. It parsed weekly TV listings from [XMLTV](http://xmltv.org/), augmented them with season and star information, let you build watch lists, and sent daily emails showing what shows you were following that were airing that week.

It actually worked. People used it. I used it. This was my first proper project outside of work.

Then streaming happened, Sky+ got popular, and nobody needed to remember when their shows were on anymore.

## A Different Time

This was before:
- Netflix streaming (launched 2007)
- iPlayer (launched 2007)
- Sky+ was mainstream (it existed, but was [new and expensive](https://en.wikipedia.org/wiki/Sky%2B))
- Anyone had heard of "binge-watching"
- You could pause live TV without dedicated hardware

Linear TV meant if you wanted to watch a show, you needed to be in front of the television when it aired. Miss it? Hope for a repeat. VHS recordings were an option, but you had to remember to set the timer.

I built and used TV-Listings actively from 2002 onwards. By 2005-2006, I started to see the writing on the wall - I was losing interest because I found no real use for it anymore. Sky+ was becoming affordable and widespread, and even I'd stopped needing to manually track when shows aired.

Around the same time, it got harder to get the listings. XMLTV scrapers were increasingly unreliable - websites changed their layouts, blocking scrapers, connection timeouts became common, and some sources disappeared entirely. What had been a weekly automated process became a chore requiring manual intervention and troubleshooting.

## How It Worked

**XMLTV Parsing**

[XMLTV](http://xmltv.org/) was (and still is) an XML format for TV listings. Various scrapers would fetch listings from broadcasters and publish them in XMLTV format. I'd download the weekly listings for UK channels, parse the XML, and import it into MySQL.

The raw XMLTV data included:
- Programme title
- Channel
- Start/end times
- Brief synopsis
- Sometimes category information (drama, documentary, etc.)

**Data Augmentation**

XMLTV gave you the basics, but not much else. I augmented the data with:
- **Season and episode numbers** - Scraped from external sources when available
- **Star ratings** - Manual ratings or scraped from TV databases
- **Genre classification** - Beyond XMLTV's basic categories

This made the listings actually useful for deciding what to watch.

**Watch Lists and Search**

Users could:
- Build watch lists of shows they followed
- Search across programme titles and synopses
- Filter by channel, time, genre
- **Search by actors** - Find all upcoming shows featuring specific actors
- **Search by genre** - Filter by drama, documentary, comedy, etc.
- **Regular cast vs guest appearances** - I got the data fine-tuned enough to differentiate between regular cast members and guest stars, so you could track shows your favourite actors appeared in, whether they were series regulars or just making a one-off appearance

Search used [KinoSearch](https://metacpan.org/pod/KinoSearch) (a Perl full-text search engine) for searching synopses. MySQL handled everything else.

**Daily Emails**

The killer feature: daily emails showing what was on your watch list for the next 7 days. You'd wake up, check your email, and know exactly what shows you cared about were airing that week.

I even ran my own email server using [qmail](https://cr.yp.to/qmail.html) to send these notifications. Because running your own mail server in 2005 was apparently a reasonable thing to do. Wild west indeed.

Sounds quaint now. In 2005, this was genuinely useful.

## Use Cases (Gherkin-Style)

[Gherkin](https://cucumber.io/docs/gherkin/) didn't exist when TV-Listings was written, but I want to show concrete use cases. Here's what the application actually did:

**Scenario: Track all upcoming appearances by a specific actor**

```gherkin
Given I want to watch anything with Martin Sheen
When I search for "Martin Sheen" in the actors database
Then I see all upcoming programmes featuring Martin Sheen
  And I can see whether he's a series regular or guest star
  And I can add any of these programmes to my watch list
  And I receive email notifications when they're airing
```

**Example results:**
- *The West Wing* (Series 4, Episode 12) - BBC Two, Thursday 21:00 - Series regular
- *Midsomer Murders* (Guest appearance) - ITV1, Sunday 20:00 - Guest star
- *Apocalypse Now Redux* (Film) - Channel 4, Saturday 23:30 - Lead role

**Scenario: Add a TV programme to watch list**

```gherkin
Given "Spooks" has aired previously and I know I like it
When I search for "Spooks" in the programme database
And I add "Spooks" to my watch list
Then I receive daily email notifications
  And the email shows upcoming episodes for the next 7 days
  And each listing includes episode number, title, channel, and air time
```

**Scenario: Get notified about a one-off film**

```gherkin
Given "The Shawshank Redemption" is airing this week
And I have "drama" and "prison" as genres I follow
When the weekly listings are parsed
Then I receive an email notification
  And the email includes the film title, channel, date, and time
  And the email includes the synopsis and star rating
```

## The Technology Stack

**Perl**

Using Perl in 2003 made sense. This was Perl's peak - dynamic languages were ascendant, PHP and Perl dominated web development, and Ruby on Rails didn't exist yet (launched 2004).

The fact that I used Perl shows my age. I'm fine with that.

**mod_perl, Not CGI**

This ran on [mod_perl](https://perl.apache.org/), not CGI scripts. Important distinction:

**CGI** (Common Gateway Interface) spawns a new Perl process for every request. Slow, inefficient, but simple to deploy.

**mod_perl** embeds the Perl interpreter directly into Apache. The Perl code stays resident in memory, database connections persist between requests, and you get an order of magnitude better performance. The trade-off? More complex configuration, easier to leak memory, and you had to restart Apache to see code changes.

For an application making database queries and parsing XML on every request, mod_perl was essential. CGI would have been unusable.

**Template Toolkit**

[Template Toolkit](http://www.template-toolkit.org/) was the templating engine. Clean separation of logic and presentation, decent documentation, widely used in the Perl world.

No MVC framework. Just mod_perl handlers, Template Toolkit templates, and Apache configuration. The wild west.

**Class::DBI**

[Class::DBI](https://metacpan.org/pod/Class::DBI) was the ORM. It mapped database tables to Perl classes, gave you basic CRUD operations, and handled relationships.

It worked. It wasn't elegant. But this was before the era of "convention over configuration" - you wrote a lot of boilerplate.

**Test::More**

[Test::More](https://metacpan.org/pod/Test::More) was the testing framework. I actually wrote tests, which was uncommon in 2003 for side projects. Not comprehensive coverage, but enough to catch regressions.

**MySQL**

MySQL 4.x with MyISAM tables. InnoDB existed but wasn't the default storage engine (that didn't happen until MySQL 5.5 in 2010). MyISAM meant no foreign key constraints, no transactions, table-level locking. You wrote `ALTER TABLE` statements by hand and hoped for the best.

**KinoSearch**

[KinoSearch](https://metacpan.org/pod/KinoSearch) provided full-text search on programme synopses. It was a Perl port of Lucene concepts - build an index, query it, get ranked results.

Searching "crime drama London" across a week of TV listings actually worked reasonably well.

## Version Control Before Git

This project predates my use of Git. It was built in the days of:
- **Header comments for version history** - Yes, really. `# v1.2 - 2004-03-15 - Added search feature`
- **Manual backups** - Copy the directory, append a date, hope you remember what changed
- **No distributed version control** - Centralised or nothing

At work, we used [Aegis](http://aegis.sourceforge.net/), a change-based version control system that makes CVS look modern. It was... thorough. And slow. And required planning your changes in advance because reverting was painful.

Git didn't exist until 2005. GitHub didn't launch until 2008.

I migrated TV-Listings to GitHub in 2013 during a brief renaissance where I thought about modernising it. That never happened. The code sat there, a snapshot of 2007-era Perl web development, frozen in time.

## Why It Died

**Sky+ Became Mainstream**

By 2005-2006, [Sky+](https://en.wikipedia.org/wiki/Sky%2B) was affordable and widespread enough that the core value proposition of TV-Listings (knowing when your shows were on) became less relevant. I'd stopped using it myself. Set your shows to record via series link, forget about schedules, watch whenever. The manual tracking that TV-Listings provided was obsolete.

**Streaming Arrived**

Netflix streaming launched in 2007 (US) and expanded internationally. iPlayer launched in the UK. The entire concept of "when is my show on?" became irrelevant.

**Mobile Took Over**

Even if you wanted to check listings, you'd do it on your phone with an app, not a website.

**Linear TV Declined**

Younger audiences stopped watching linear TV entirely. By 2010, "appointment viewing" was dying. By 2015, it was niche.

TV-Listings solved a problem that stopped existing.

## Why It's Here

Pure nostalgia. This project has no relevance to modern development. The code is 20+ years old, uses long-deprecated libraries, and solves a problem nobody has anymore.

But I'm old enough now to think "screw it" and include it anyway.

This was the first project I built, deployed, and maintained that people actually used outside of work. It taught me:
- How to parse external data formats (XMLTV)
- Database design for time-based data (TV schedules)
- User experience for email notifications (don't spam people)
- The importance of testing (even when it wasn't trendy)
- How to deploy and maintain a live service

I can't find the frontend code - the templates, CSS, and JavaScript are lost to time. Probably a good thing. Those early CSS skills were... rough. The backend Perl code exists on GitHub, a digital fossil from when Perl ruled the web, version control meant header comments, and people needed to know when their shows were on.

## Conclusion

TV-Listings is historical curiosity. It's here because I'm sentimental and thought it would be funny to document a project from an era when:
- Perl was a legitimate web development choice
- Linear TV was the only TV
- Git didn't exist
- "Full-text search" meant compiling a C library and praying it worked

If you're curious what Perl application development looked like in 2003, the code is on [GitHub](https://github.com/swmcc/TV-Listings).

You can read about [whatisonthe.tv](/projects/building-whatisonthetv) if you want to see the modern version of "tracking what you watch" - spoiler: it's completely different and involves actual engineering instead of mod_perl handlers and XML parsing.
