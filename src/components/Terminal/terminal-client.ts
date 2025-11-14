// Client-side terminal handler
import {
  createTerminalState,
  parseCommand,
  executeCommand,
  setFileSystem,
  setSearchIndex,
  setKnowledgeBase,
  type TerminalState
} from './terminal';

let terminalState: TerminalState = createTerminalState();
let commandHistory: string[] = [];
let historyIndex = -1;
let terminalDataLoaded = false;

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

  let hasBooted = false;

  // Load terminal data from generated index
  async function loadTerminalData() {
    if (terminalDataLoaded) return;

    try {
      const response = await fetch('/terminal-index.json');
      const data = await response.json();

      setFileSystem(data.fileSystem);
      setSearchIndex(data.searchIndex);
      setKnowledgeBase(data.knowledgeBase);

      terminalDataLoaded = true;
    } catch (error) {
      console.error('Failed to load terminal data:', error);
    }
  }

  // Toggle modal
  toggleBtn.addEventListener('click', async () => {
    // Check if mobile at click time (not page load)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || window.innerWidth < 768;

    if (isMobile) {
      showMobileWarning();
      return;
    }

    // Load terminal data before opening
    await loadTerminalData();

    modal.classList.remove('hidden');

    // Boot sequence on first open
    if (!hasBooted) {
      hasBooted = true;
      playBootSequence();
    } else {
      input.focus();
    }
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

    if (result.output === 'EXIT') {
      closeModal();
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

      // Check if output contains an image marker
      if (result.output.startsWith('IMAGE:')) {
        const lines = result.output.split('\n');
        const imagePath = lines[0].substring(6); // Remove 'IMAGE:' prefix
        const textContent = lines.slice(1).join('\n');

        // Create container with image on left and text on right
        const container = document.createElement('div');
        container.className = 'terminal-image-text-container';

        // Create image element
        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = 'Profile';
        img.className = 'terminal-image';

        // Create text element
        const textDiv = document.createElement('div');
        textDiv.className = 'terminal-image-text';
        textDiv.textContent = textContent.trim();

        container.appendChild(img);
        container.appendChild(textDiv);
        output.appendChild(container);
      } else {
        appendOutput(result.output, className);
      }
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

  // Boot sequence animation
  async function playBootSequence() {
    if (!input) return;

    // Disable input during boot
    input.disabled = true;

    const bootLines = [
      { text: '╔═══════════════════════════════════════════════════════════════╗', delay: 0 },
      { text: '║              SWMCC Operating System v2025.11.14               ║', delay: 100 },
      { text: '║         Definitely Not Running on a Raspberry Pi Zero         ║', delay: 100 },
      { text: '╚═══════════════════════════════════════════════════════════════╝', delay: 100 },
      { text: '', delay: 200 },
      { text: '🔧 Initialising swmcc kernel...', delay: 300 },
      { text: '🧠 Loading personality modules... OK', delay: 400 },
      { text: '☕ Mounting /dev/coffee... OK', delay: 350 },
      { text: '😴 Starting procrastination daemon... FAILED (as expected)', delay: 500 },
      { text: '🚂 Loading Rails monolith driver... OK', delay: 300 },
      { text: '🐍 Detecting Python installations... Found 47 versions', delay: 450 },
      { text: '🤖 Initialising AI agent "swanson" (Stephen\'s alter ego)... ONLINE', delay: 500 },
      { text: '🔍 Indexing content for intelligent search... OK', delay: 350 },
      { text: '😏 Enabling sarcasm module... Because clearly Stephen needs help with that', delay: 400 },
      { text: '✨ System ready. Stephen is not.', delay: 300 },
      { text: '', delay: 200 },
      { text: "Available Commands:", delay: 100 },
      { text: '', delay: 100 },
      { text: 'File System:', delay: 50 },
      { text: '  ls [path]               # List contents', delay: 50 },
      { text: '  cd <path>               # Change directory', delay: 50 },
      { text: '  pwd                     # Print working directory', delay: 50 },
      { text: '  cat <file>              # Read file contents', delay: 50 },
      { text: '  tree                    # Show directory structure', delay: 50 },
      { text: '', delay: 50 },
      { text: 'Information:', delay: 50 },
      { text: '  whoami                  # About Stephen', delay: 50 },
      { text: '  projects                # List active projects', delay: 50 },
      { text: '  help                    # Show all commands', delay: 50 },
      { text: '', delay: 50 },
      { text: 'Swanson AI Chat:', delay: 50 },
      { text: '  swanson                 # Enter/exit Swanson mode', delay: 50 },
      { text: '  Just ask naturally:     # "Tell me about Rails"', delay: 50 },
      { text: '                          # "What projects is he working on?"', delay: 50 },
      { text: '', delay: 50 },
      { text: 'Terminal:', delay: 50 },
      { text: '  clear                   # Clear screen', delay: 50 },
      { text: '  exit                    # Close terminal', delay: 50 },
      { text: '', delay: 100 }
    ];

    for (const line of bootLines) {
      await new Promise(resolve => setTimeout(resolve, line.delay));
      appendOutput(line.text, 'muted');
      scrollToBottom();
    }

    // Re-enable input and focus
    input.disabled = false;
    input.focus();
  }

  // Watch for state changes
  const originalHandleCommand = handleCommand;
  handleCommand = function(commandStr: string) {
    originalHandleCommand(commandStr);
    updatePrompt();
  };
}

function showMobileWarning() {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.2s ease-out;
  `;

  // Create warning card
  const card = document.createElement('div');
  card.style.cssText = `
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 2rem;
    max-width: 400px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.3s ease-out;
  `;

  card.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">📱 ➡️ 💻</div>
      <h2 style="color: var(--color-text-heading); font-size: 1.5rem; margin-bottom: 1rem; font-family: 'Space Grotesk', sans-serif;">
        Terminal Requires Bigger Screen
      </h2>
      <p style="color: var(--color-text); line-height: 1.6; margin-bottom: 1.5rem;">
        The SWMCC Operating System requires at least 47 pixels more than your current device has to offer.
        <br><br>
        Please try again on a desktop or laptop. Your thumbs will thank you.
      </p>
      <button id="mobile-warning-close" style="
        background: var(--color-accent);
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      ">
        Got it
      </button>
    </div>
  `;

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Close handlers
  const closeWarning = () => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 200);
  };

  const closeBtn = card.querySelector('#mobile-warning-close');
  closeBtn?.addEventListener('click', closeWarning);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeWarning();
    }
  });

  // Add animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    #mobile-warning-close:hover {
      opacity: 0.8;
    }
  `;
  document.head.appendChild(style);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTerminal);
} else {
  initTerminal();
}
