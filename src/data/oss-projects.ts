export interface OSSProject {
  name: string;
  repo: string;
  myDescription?: string;  // Your detailed description
  links: {
    github: string;
    pypi?: string;
    rubygems?: string;
    npm?: string;
  };
  type: 'package' | 'contribution';
}

export const ossProjects: OSSProject[] = [
  // My Packages
  {
    name: 'mailview',
    repo: 'swmcc/mailview',
    myDescription: 'I built this because I missed letter_opener from the Ruby world when working in Python. During development, you don\'t want emails actually being sent - you want to inspect them locally. Mailview captures all outgoing emails and serves them up in a clean browser UI at /_mail. Just add the middleware to your FastAPI or ASGI app and every email gets intercepted, stored, and made viewable. No more checking logs or setting up fake SMTP servers.',
    links: {
      github: 'https://github.com/swmcc/mailview',
      pypi: 'https://pypi.org/project/mailview/',
    },
    type: 'package',
  },
  {
    name: 'mailjunky-python',
    repo: 'swmcc/mailjunky-python',
    myDescription: 'The official Python SDK for the Mailjunky transactional email service. I wrote this to make it dead simple to send emails from Python apps - just instantiate the client with your API key and call send(). Handles HTML and plain text bodies, attachments, and all the edge cases you\'d expect. I use this in production for whatisonthe.tv to send watchlist notifications and digests.',
    links: {
      github: 'https://github.com/swmcc/mailjunky-python',
      pypi: 'https://pypi.org/project/mailjunky/',
    },
    type: 'package',
  },
  {
    name: 'mailjunky',
    repo: 'swmcc/mailjunky',
    myDescription: 'The Ruby counterpart to mailjunky-python. Same clean API, same reliability, just for the Ruby ecosystem. Built this because I work across both Python and Ruby projects and wanted a consistent email sending experience regardless of which stack I\'m in. Follows Ruby conventions and plays nicely with Rails applications.',
    links: {
      github: 'https://github.com/swmcc/mailjunky',
      rubygems: 'https://rubygems.org/gems/mailjunky',
    },
    type: 'package',
  },
  {
    name: 'tvdb_api',
    repo: 'swmcc/tvdb_api',
    myDescription: 'A Ruby wrapper for TheTVDB API that I built while working on TV-related projects. TheTVDB is the definitive source for TV show metadata, and I needed a clean way to fetch show information, episode details, and artwork from Ruby applications. This gem handles authentication, rate limiting, and provides a nice object-oriented interface to the API.',
    links: {
      github: 'https://github.com/swmcc/tvdb_api',
      rubygems: 'https://rubygems.org/gems/tvdb_api',
    },
    type: 'package',
  },
  // Contributions
  {
    name: 'tvdb-v4-python',
    repo: 'thetvdb/tvdb-v4-python',
    myDescription: 'I use this library extensively in whatisonthe.tv for fetching TV show and movie metadata. When I encountered bugs or missing features, I contributed fixes back upstream rather than maintaining a fork. It\'s rewarding to contribute to a library that thousands of other developers depend on, and it keeps my own projects on the mainline version.',
    links: {
      github: 'https://github.com/thetvdb/tvdb-v4-python',
      pypi: 'https://pypi.org/project/tvdb-v4-official/',
    },
    type: 'contribution',
  },
];

export const sectionIntro = `A collection of open source packages I maintain and projects I contribute to. These are tools I've built to solve problems I encountered, or contributions to projects I use and care about.`;
