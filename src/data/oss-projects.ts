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
    myDescription: '', // Add your description here
    links: {
      github: 'https://github.com/swmcc/mailview',
      pypi: 'https://pypi.org/project/mailview/',
    },
    type: 'package',
  },
  {
    name: 'mailjunky-python',
    repo: 'swmcc/mailjunky-python',
    myDescription: '', // Add your description here
    links: {
      github: 'https://github.com/swmcc/mailjunky-python',
      pypi: 'https://pypi.org/project/mailjunky/',
    },
    type: 'package',
  },
  {
    name: 'mailjunky',
    repo: 'swmcc/mailjunky',
    myDescription: '', // Add your description here
    links: {
      github: 'https://github.com/swmcc/mailjunky',
      rubygems: 'https://rubygems.org/gems/mailjunky',
    },
    type: 'package',
  },
  {
    name: 'tvdb_api',
    repo: 'swmcc/tvdb_api',
    myDescription: '', // Add your description here
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
    myDescription: '', // Add your description here
    links: {
      github: 'https://github.com/thetvdb/tvdb-v4-python',
      pypi: 'https://pypi.org/project/tvdb-v4-official/',
    },
    type: 'contribution',
  },
];

export const sectionIntro = `A collection of open source packages I maintain and projects I contribute to. These are tools I've built to solve problems I encountered, or contributions to projects I use and care about.`;
