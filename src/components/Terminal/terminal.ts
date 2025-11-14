// Terminal command logic

export interface TerminalState {
  currentPath: string;
  history: string[];
  historyIndex: number;
}

export interface FileSystemNode {
  type: 'file' | 'directory';
  name: string;
  content?: string;
  url?: string;
  metadata?: any;
  children?: { [key: string]: FileSystemNode };
}

export interface FileSystem {
  [key: string]: FileSystemNode;
}

export interface SearchIndexEntry {
  type: string;
  slug: string;
  title?: string;
  description?: string;
  content: string;
  tags: string[];
  pubDate: Date;
  url: string;
}

export interface KnowledgeBase {
  about: any;
  skills: any;
  projects: any;
}

// Virtual file system - will be populated from terminal-index.json
export let fileSystem: FileSystem = {
  'about.md': {
    type: 'file',
    name: 'about.md',
    content: 'Navigate to /about on the website to learn more about Stephen McCullough.'
  },
  'now.md': {
    type: 'file',
    name: 'now.md',
    content: 'Navigate to /now on the website to see what Stephen is currently working on.'
  },
  'projects': {
    type: 'directory',
    name: 'projects',
    children: {
      'swm-cc.md': {
        type: 'file',
        name: 'swm-cc.md',
        content: 'This site. Built with Astro 5, Tailwind CSS 4, and MDX.\nView: /projects/building-swm-cc'
      },
      'whatisonthe-tv.md': {
        type: 'file',
        name: 'whatisonthe-tv.md',
        content: 'TV tracking app. FastAPI + SvelteKit.\nView: /projects/building-whatisonthetv'
      },
      'jotter.md': {
        type: 'file',
        name: 'jotter.md',
        content: 'Self-hosted bookmark manager. Rails 8 + Hotwire.\nView: /projects/building-jotter'
      },
      'the-mcculloughs-org.md': {
        type: 'file',
        name: 'the-mcculloughs-org.md',
        content: 'Family photo archive. Rails 8 monolith.\nView: /projects/the-mcculloughs-org'
      }
    }
  },
  'writing': {
    type: 'directory',
    name: 'writing',
    children: {}
  },
  'notes': {
    type: 'directory',
    name: 'notes',
    children: {}
  },
  'thoughts': {
    type: 'directory',
    name: 'thoughts',
    children: {}
  }
};

// Search index and knowledge base (populated at runtime)
let searchIndex: SearchIndexEntry[] = [];
let knowledgeBase: KnowledgeBase | null = null;

// Setter functions to update data from loaded index
export function setFileSystem(fs: FileSystem) {
  Object.keys(fileSystem).forEach(key => delete fileSystem[key]);
  Object.assign(fileSystem, fs);
}

export function setSearchIndex(index: SearchIndexEntry[]) {
  searchIndex = index;
}

export function setKnowledgeBase(kb: KnowledgeBase) {
  knowledgeBase = kb;
}

export function createTerminalState(): TerminalState {
  return {
    currentPath: '/',
    history: [],
    historyIndex: -1
  };
}

export function parseCommand(input: string): { command: string; args: string[] } {
  const parts = input.trim().split(/\s+/);
  const command = parts[0] || '';
  const args = parts.slice(1);
  return { command, args };
}

export function resolvePath(currentPath: string, targetPath: string): string {
  if (targetPath.startsWith('/')) {
    return targetPath;
  }

  if (targetPath === '.') {
    return currentPath;
  }

  if (targetPath === '..') {
    const parts = currentPath.split('/').filter(p => p);
    parts.pop();
    return '/' + parts.join('/');
  }

  const parts = currentPath.split('/').filter(p => p);
  parts.push(targetPath);
  return '/' + parts.join('/');
}

export function getNode(path: string, fs: FileSystem = fileSystem): FileSystemNode | null {
  if (path === '/' || path === '') {
    return {
      type: 'directory',
      name: '/',
      children: fs
    };
  }

  const parts = path.split('/').filter(p => p);
  let current: FileSystemNode | null = null;
  let children = fs;

  for (const part of parts) {
    if (!children[part]) {
      return null;
    }
    current = children[part];
    if (current.type === 'directory' && current.children) {
      children = current.children;
    }
  }

  return current;
}

export function executeCommand(
  command: string,
  args: string[],
  state: TerminalState
): { output: string; newState?: Partial<TerminalState> } {
  const cmd = command.toLowerCase();

  switch (cmd) {
    case 'help':
      return { output: getHelpText(args[0]) };

    case 'clear':
    case 'cls':
      return { output: 'CLEAR' }; // Special signal to clear terminal

    case 'exit':
    case 'quit':
      return { output: 'EXIT' }; // Special signal to close terminal

    case 'ls':
    case 'dir':
      return executeLS(args, state);

    case 'cd':
      return executeCD(args, state);

    case 'pwd':
      return { output: state.currentPath };

    case 'cat':
      return executeCAT(args, state);

    case 'tree':
      return executeTREE(args, state);

    case 'whoami':
      return { output: getWhoAmI() };

    case 'about':
      return { output: 'Stephen McCullough - Software Engineer\nView full bio: /about' };

    case 'projects':
      return executeProjects();

    case 'swanson':
      return { output: getSwanson() };

    case 'ask':
      return executeASK(args);

    case '':
      return { output: '' };

    default:
      // Check if input looks like a question
      const fullInput = [command, ...args].join(' ');
      if (isQuestion(fullInput)) {
        return executeASK([fullInput]);
      }

      return {
        output: `Command not found: ${command}\nType 'help' for available commands or ask Swanson a question.`
      };
  }
}

// Check if input looks like a question
function isQuestion(input: string): boolean {
  const lowerInput = input.toLowerCase().trim();

  // Question words
  const questionWords = ['what', 'who', 'when', 'where', 'why', 'how', 'does', 'is', 'can', 'tell', 'show', 'explain'];
  const startsWithQuestion = questionWords.some(word => lowerInput.startsWith(word + ' '));

  // Contains question mark
  const hasQuestionMark = input.includes('?');

  // Phrases that indicate questions
  const questionPhrases = ['tell me about', 'what about', 'how about', 'know about'];
  const hasQuestionPhrase = questionPhrases.some(phrase => lowerInput.includes(phrase));

  return startsWithQuestion || hasQuestionMark || hasQuestionPhrase;
}

function getHelpText(specificCommand?: string): string {
  if (specificCommand) {
    const helps: { [key: string]: string } = {
      ls: 'ls [path] - List directory contents',
      cd: 'cd <path> - Change directory (.. for parent, / for root)',
      pwd: 'pwd - Print working directory',
      cat: 'cat <file> - Display file contents',
      tree: 'tree [path] - Display directory tree',
      clear: 'clear - Clear terminal screen',
      exit: 'exit - Close terminal',
      help: 'help [command] - Show help for a command',
      whoami: 'whoami - Display information about Stephen',
      projects: 'projects - Quick list of active projects',
      swanson: 'swanson - Meet Swanson, Stephen\'s AI alter ego',
      ask: 'ask <question> - Ask Swanson anything about Stephen (or just type your question naturally)'
    };
    return helps[specificCommand] || `No help available for: ${specificCommand}`;
  }

  return `Available commands:

File System:
  ls [path]          List directory contents
  cd <path>          Change directory
  pwd                Print working directory
  cat <file>         Display file contents
  tree [path]        Display directory tree

Information:
  whoami             About Stephen McCullough
  swanson            Meet Stephen's AI alter ego
  projects           List active projects
  help [command]     Show this help or help for specific command
  clear              Clear terminal
  exit               Close terminal

Chat with Swanson (AI):
  ask <question>     Ask Swanson anything about Stephen

You can also just type questions directly:
  "Tell me about his Rails experience"
  "What projects is he working on?"
  "Does he know TypeScript?"

Navigate the site like a file system:
  ls projects/       View available project articles
  cat projects/jotter.md   Read about the Jotter project`;
}

function executeLS(args: string[], state: TerminalState): { output: string } {
  const targetPath = args[0] ? resolvePath(state.currentPath, args[0]) : state.currentPath;
  const node = getNode(targetPath);

  if (!node) {
    return { output: `ls: cannot access '${args[0] || targetPath}': No such file or directory` };
  }

  if (node.type === 'file') {
    return { output: args[0] || targetPath };
  }

  if (!node.children) {
    return { output: '' };
  }

  const entries = Object.entries(node.children).map(([name, child]) => {
    return child.type === 'directory' ? `${name}/` : name;
  });

  return { output: entries.join('\n') };
}

function executeCD(args: string[], state: TerminalState): { output: string; newState?: Partial<TerminalState> } {
  if (!args[0]) {
    return { output: '', newState: { currentPath: '/' } };
  }

  const targetPath = resolvePath(state.currentPath, args[0]);
  const node = getNode(targetPath);

  if (!node) {
    return { output: `cd: no such file or directory: ${args[0]}` };
  }

  if (node.type !== 'directory') {
    return { output: `cd: not a directory: ${args[0]}` };
  }

  return { output: '', newState: { currentPath: targetPath === '/' ? '/' : targetPath } };
}

function executeCAT(args: string[], state: TerminalState): { output: string } {
  if (!args[0]) {
    return { output: 'cat: missing file operand\nTry \'cat --help\' for more information.' };
  }

  const targetPath = resolvePath(state.currentPath, args[0]);
  const node = getNode(targetPath);

  if (!node) {
    return { output: `cat: ${args[0]}: No such file or directory` };
  }

  if (node.type === 'directory') {
    return { output: `cat: ${args[0]}: Is a directory` };
  }

  return { output: node.content || 'File is empty' };
}

function executeTREE(args: string[], state: TerminalState): { output: string } {
  const targetPath = args[0] ? resolvePath(state.currentPath, args[0]) : state.currentPath;
  const node = getNode(targetPath);

  if (!node) {
    return { output: `tree: ${args[0] || targetPath}: No such file or directory` };
  }

  const lines: string[] = [targetPath === '/' ? '/' : targetPath.split('/').pop() || '/'];
  buildTree(node, '', lines, true);

  return { output: lines.join('\n') };
}

function buildTree(node: FileSystemNode, prefix: string, lines: string[], isLast: boolean): void {
  if (node.type !== 'directory' || !node.children) {
    return;
  }

  const entries = Object.entries(node.children);
  entries.forEach(([name, child], index) => {
    const isLastEntry = index === entries.length - 1;
    const marker = isLastEntry ? '└── ' : '├── ';
    const displayName = child.type === 'directory' ? `${name}/` : name;

    lines.push(prefix + marker + displayName);

    if (child.type === 'directory') {
      const newPrefix = prefix + (isLastEntry ? '    ' : '│   ');
      buildTree(child, newPrefix, lines, isLastEntry);
    }
  });
}

function getWhoAmI(): string {
  return `IMAGE:/profile.svg

Stephen McCullough
Software Engineer | Northern Ireland

Currently building AI Operating Systems and personal projects.
Specialising in Rails, Python, and modern web architecture.

Visit /about for more information
Run 'projects' to see current work`;
}

function executeProjects(): { output: string } {
  return {
    output: `Active Projects:

• swm.cc - This site (Astro 5 + Tailwind CSS 4)
• whatisonthe.tv - TV tracking app (FastAPI + SvelteKit)
• Jotter - Bookmark manager (Rails 8 + Hotwire)
• the-mcculloughs.org - Family photo archive (Rails 8)

Run 'ls projects/' for full list
Visit /projects on the website for detailed articles`
  };
}

// Ask Swanson a question (AI chat mode)
function executeASK(args: string[]): { output: string } {
  if (args.length === 0) {
    return { output: 'Ask me anything about Stephen! For example:\n  "Tell me about his Rails experience"\n  "What projects is he working on?"\n  "Does he know TypeScript?"' };
  }

  const question = args.join(' ').toLowerCase();

  // If no data loaded yet, show message
  if (!knowledgeBase || searchIndex.length === 0) {
    return { output: 'Swanson is still loading data... Try again in a moment.' };
  }

  // Detect what the question is about
  const response = generateSwansonResponse(question);

  return { output: response };
}

// Generate intelligent response based on question
function generateSwansonResponse(question: string): string {
  const q = question.toLowerCase();

  // About/who is Stephen
  if (q.match(/who (is|are) (you|stephen|he)/i) || q.includes('about stephen') || q.includes('about himself') || q === 'about' || q === 'whoami') {
    return `${knowledgeBase!.about.name} is a ${knowledgeBase!.about.role} based in ${knowledgeBase!.about.location}.

He's currently building ${knowledgeBase!.about.interests.join(', ')}.

For more details, check out:
  cat about.md
  ls projects/
  whoami`;
  }

  // Skills-based questions
  const skillKeywords = ['rails', 'python', 'typescript', 'javascript', 'astro', 'hotwire', 'tailwind', 'postgresql', 'elasticsearch', 'react', 'vue'];
  const askedSkill = skillKeywords.find(skill => q.includes(skill));

  if (askedSkill && knowledgeBase!.skills[askedSkill]) {
    const skillInfo = knowledgeBase!.skills[askedSkill];

    if (!skillInfo.mentioned) {
      return `Stephen hasn't written about ${askedSkill} yet. But that doesn't mean he doesn't know it.\n\nTry asking about: ${skillKeywords.filter(s => knowledgeBase!.skills[s]?.mentioned).join(', ')}`;
    }

    let response = `Stephen has written about ${askedSkill} in ${skillInfo.count} piece${skillInfo.count > 1 ? 's' : ''}.\n`;

    if (skillInfo.examples && skillInfo.examples.length > 0) {
      response += '\nHere are some examples:\n';
      skillInfo.examples.forEach((ex: any) => {
        response += `\n• ${ex.title}\n  ${ex.url}\n  "${ex.excerpt.substring(0, 120)}..."`;
      });
    }

    return response;
  }

  // Projects
  if (q.includes('project') || q.includes('working on') || q.includes('building')) {
    const projects = knowledgeBase!.projects.active;

    if (projects.length === 0) {
      return "Stephen hasn't documented any projects yet. Probably too busy building them.";
    }

    let response = `Stephen is currently working on ${projects.length} documented project${projects.length > 1 ? 's' : ''}:\n`;

    projects.forEach((p: any) => {
      response += `\n• ${p.title}\n  ${p.description}\n  View: ${p.url}`;
    });

    response += '\n\nRun "ls projects/" to see project files.';

    return response;
  }

  // Experience questions
  if (q.includes('experience')) {
    return `Stephen has experience across the full stack:

Backend: Ruby on Rails, Python (FastAPI), Node.js
Frontend: Astro, TypeScript, Hotwire (Turbo + Stimulus)
Database: PostgreSQL, SQLite
Infrastructure: Self-hosted tools, monolith architecture

He particularly enjoys Rails 8 and modern web standards.

Run "projects" or explore /writing for detailed articles about his work.`;
  }

  // General questions - search content
  const searchResults = searchContent(q);

  if (searchResults.length > 0) {
    let response = `I found ${searchResults.length} relevant piece${searchResults.length > 1 ? 's' : ''} about that:\n`;

    searchResults.slice(0, 3).forEach((result: any) => {
      response += `\n• ${result.title || result.type}\n  ${result.url}`;
    });

    if (searchResults.length > 3) {
      response += `\n\n...and ${searchResults.length - 3} more. Try refining your question.`;
    }

    return response;
  }

  // Fallback: didn't understand
  return `Hmm, I'm not sure about that. Try asking:
  "Tell me about his Rails experience"
  "What projects is he working on?"
  "Does he know TypeScript?"

Or explore the file system:
  ls projects/
  cat writing/building-with-astro.md`;
}

// Search through indexed content
function searchContent(query: string): any[] {
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  return searchIndex.filter(item => {
    const searchText = [
      item.title || '',
      item.description || '',
      item.content || '',
      ...item.tags
    ].join(' ').toLowerCase();

    return keywords.some(keyword => searchText.includes(keyword));
  }).slice(0, 10);
}

function getSwanson(): string {
  return `
   ██████╗ ██╗    ██╗ █████╗ ███╗   ██╗███████╗ ██████╗ ███╗   ██╗
  ██╔════╝ ██║    ██║██╔══██╗████╗  ██║██╔════╝██╔═══██╗████╗  ██║
  ███████╗ ██║ █╗ ██║███████║██╔██╗ ██║███████╗██║   ██║██╔██╗ ██║
  ╚════██║ ██║███╗██║██╔══██║██║╚██╗██║╚════██║██║   ██║██║╚██╗██║
  ███████║ ╚███╔███╔╝██║  ██║██║ ╚████║███████║╚██████╔╝██║ ╚████║
  ╚══════╝  ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝

  AI Agent v1.0 - Stephen's Digital Alter Ego

Hello. I'm Swanson, the AI representation of Stephen McCullough.
Think of me as Stephen's brain, but with better error handling and
fewer coffee dependencies.

I'm here to answer questions about Stephen's work, projects, and
technical experience. Unlike Stephen, I don't need sleep, don't
procrastinate (much), and my Git commits actually make sense.

Try asking me:
  "Tell me about Stephen's Rails experience"
  "What is he working on?"
  "Does he actually know what he's doing?"

Or just use 'help' to see what else you can do here.

Pro tip: I'm basically Stephen, but compiled and optimized.`;
}
