// Client-side terminal handler
import {
  createTerminalState,
  parseCommand,
  executeCommand,
  type TerminalState
} from './terminal';

let terminalState: TerminalState = createTerminalState();
let commandHistory: string[] = [];
let historyIndex = -1;

export function initTerminal() {
  const modal = document.getElementById('terminal-modal');
  const toggleBtn = document.getElementById('terminal-toggle');
  const closeBtn = document.getElementById('terminal-close');
  const backdrop = modal?.querySelector('.terminal-backdrop');
  const input = document.getElementById('terminal-input') as HTMLInputElement;
  const output = document.getElementById('terminal-output');

  if (!modal || !toggleBtn || !closeBtn || !input || !output) {
    console.error('Terminal elements not found');
    return;
  }

  // Show welcome message
  appendOutput(getWelcomeMessage(), 'muted');

  // Toggle modal
  toggleBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    input.focus();
  });

  // Close modal
  const closeModal = () => {
    modal.classList.add('hidden');
  };

  closeBtn.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Handle input
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const command = input.value.trim();
      if (command) {
        handleCommand(command);
        commandHistory.push(command);
        historyIndex = commandHistory.length;
      }
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        input.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        input.value = '';
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      clearTerminal();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // TODO: Tab completion
    }
  });

  function handleCommand(commandStr: string) {
    // Echo command
    appendOutput(`${getPrompt()}${commandStr}`, 'command');

    const { command, args } = parseCommand(commandStr);
    const result = executeCommand(command, args, terminalState);

    // Handle special commands
    if (result.output === 'CLEAR') {
      clearTerminal();
      return;
    }

    // Update state if needed
    if (result.newState) {
      terminalState = { ...terminalState, ...result.newState };
    }

    // Output result
    if (result.output) {
      const className = result.output.includes('not found') || result.output.includes('No such')
        ? 'error'
        : 'output';
      appendOutput(result.output, className);
    }

    // Scroll to bottom
    scrollToBottom();
  }

  function appendOutput(text: string, className: string = 'output') {
    const line = document.createElement('div');
    line.className = className;
    line.textContent = text;
    output.appendChild(line);
  }

  function clearTerminal() {
    if (output) {
      output.innerHTML = '';
      appendOutput(getWelcomeMessage(), 'muted');
    }
  }

  function scrollToBottom() {
    const terminalBody = modal?.querySelector('.terminal-body');
    if (terminalBody) {
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  }

  function getPrompt(): string {
    const path = terminalState.currentPath === '/' ? '~' : terminalState.currentPath.replace('/', '');
    return `visitor@swm.cc:${path}$ `;
  }

  // Update prompt display when path changes
  function updatePrompt() {
    const promptElement = modal?.querySelector('.terminal-prompt');
    if (promptElement) {
      promptElement.textContent = getPrompt();
    }
  }

  // Watch for state changes
  const originalHandleCommand = handleCommand;
  handleCommand = function(commandStr: string) {
    originalHandleCommand(commandStr);
    updatePrompt();
  };
}

function getWelcomeMessage(): string {
  return `╔═══════════════════════════════════════════════════════════════╗
║              SWMCC Operating System v2025.11.14               ║
║         Definitely Not Running on a Raspberry Pi Zero         ║
╚═══════════════════════════════════════════════════════════════╝

[    0.000000] Initialising swmcc kernel...
[    0.142857] Loading personality modules... OK
[    0.314159] Mounting /dev/coffee... OK
[    0.420420] Starting procrastination daemon... FAILED (as expected)
[    0.666666] Loading Rails monolith driver... OK
[    0.777777] Detecting Python installations... Found 47 versions
[    0.888888] Enabling sarcasm module... OH GREAT, ANOTHER TERMINAL
[    1.000000] System ready. Probably.

Type 'help' for available commands, or just ask me stuff.

Examples:
  ls                      # List site sections
  cd projects             # Navigate to projects
  cat projects/jotter.md  # Read about Jotter
  whoami                  # About Stephen
  tree                    # Show directory structure
  help                    # Show all commands

`;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTerminal);
} else {
  initTerminal();
}
