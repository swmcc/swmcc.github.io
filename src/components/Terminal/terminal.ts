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
  children?: { [key: string]: FileSystemNode };
}

export interface FileSystem {
  [key: string]: FileSystemNode;
}

// Virtual file system - we'll populate this from actual site content
export const fileSystem: FileSystem = {
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

    case '':
      return { output: '' };

    default:
      return {
        output: `Command not found: ${command}\nType 'help' for available commands.`
      };
  }
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
      help: 'help [command] - Show help for a command',
      whoami: 'whoami - Display information about Stephen',
      projects: 'projects - Quick list of active projects'
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
  projects           List active projects
  help [command]     Show this help or help for specific command
  clear              Clear terminal

Try asking questions like:
  "Tell me about his Rails experience"
  "What projects is he working on?"

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
  return `Stephen McCullough
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
