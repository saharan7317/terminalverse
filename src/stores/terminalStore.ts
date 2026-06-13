// TerminalVerse — Zustand Terminal Store

import { create } from 'zustand';
import type { CommandOutput, ThemeName } from '../types/commands';

interface TerminalLine {
  id: string;
  type: 'input' | 'output';
  prompt?: string;
  command?: string;
  outputs?: CommandOutput[];
  timestamp: number;
}

interface TerminalState {
  // Display
  lines: TerminalLine[];
  isBooting: boolean;
  bootComplete: boolean;

  // Input
  currentInput: string;
  commandHistory: string[];
  historyIndex: number;

  // Theme
  theme: ThemeName;

  // Mode
  mode: 'cli' | 'visual';

  // Actions
  addInputLine: (command: string) => void;
  addOutputLine: (outputs: CommandOutput[]) => void;
  clearLines: () => void;
  setInput: (input: string) => void;
  setBooting: (booting: boolean) => void;
  setBootComplete: (complete: boolean) => void;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: 'cli' | 'visual') => void;

  // History navigation
  pushHistory: (command: string) => void;
  navigateHistoryUp: () => string;
  navigateHistoryDown: () => string;
  resetHistoryIndex: () => void;
}

let lineIdCounter = 0;
function nextLineId(): string {
  return `line-${++lineIdCounter}`;
}

// Load persisted theme
function loadTheme(): ThemeName {
  try {
    const saved = localStorage.getItem('tv_theme');
    if (saved && ['cyberpunk', 'vintage', 'minimal'].includes(saved)) {
      return saved as ThemeName;
    }
  } catch { /* ignore */ }
  return 'cyberpunk';
}

// Load persisted command history
function loadHistory(): string[] {
  try {
    const saved = localStorage.getItem('tv_cmd_history');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  lines: [],
  isBooting: true,
  bootComplete: false,
  currentInput: '',
  commandHistory: loadHistory(),
  historyIndex: -1,
  theme: loadTheme(),
  mode: 'cli',

  addInputLine: (command: string) => {
    set(state => ({
      lines: [
        ...state.lines,
        {
          id: nextLineId(),
          type: 'input',
          prompt: `ayush@terminalverse:~$`,
          command,
          timestamp: Date.now(),
        },
      ],
    }));
  },

  addOutputLine: (outputs: CommandOutput[]) => {
    set(state => ({
      lines: [
        ...state.lines,
        {
          id: nextLineId(),
          type: 'output',
          outputs,
          timestamp: Date.now(),
        },
      ],
    }));
  },

  clearLines: () => {
    set({ lines: [] });
  },

  setInput: (input: string) => {
    set({ currentInput: input });
  },

  setBooting: (booting: boolean) => {
    set({ isBooting: booting });
  },

  setBootComplete: (complete: boolean) => {
    set({ bootComplete: complete, isBooting: !complete });
  },

  setTheme: (theme: ThemeName) => {
    set({ theme });
    try {
      localStorage.setItem('tv_theme', theme);
    } catch { /* ignore */ }
  },

  setMode: (mode: 'cli' | 'visual') => {
    set({ mode });
  },

  pushHistory: (command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    set(state => {
      const history = [...state.commandHistory];
      // Don't duplicate consecutive commands
      if (history[history.length - 1] !== trimmed) {
        history.push(trimmed);
        // Limit to 100 entries
        if (history.length > 100) history.shift();
      }
      try {
        localStorage.setItem('tv_cmd_history', JSON.stringify(history));
      } catch { /* ignore */ }
      return { commandHistory: history, historyIndex: -1 };
    });
  },

  navigateHistoryUp: () => {
    const state = get();
    const { commandHistory, historyIndex } = state;
    if (commandHistory.length === 0) return state.currentInput;

    const newIndex = historyIndex === -1
      ? commandHistory.length - 1
      : Math.max(0, historyIndex - 1);

    set({ historyIndex: newIndex });
    return commandHistory[newIndex] || '';
  },

  navigateHistoryDown: () => {
    const state = get();
    const { commandHistory, historyIndex } = state;

    if (historyIndex === -1) return '';

    const newIndex = historyIndex + 1;
    if (newIndex >= commandHistory.length) {
      set({ historyIndex: -1 });
      return '';
    }

    set({ historyIndex: newIndex });
    return commandHistory[newIndex] || '';
  },

  resetHistoryIndex: () => {
    set({ historyIndex: -1 });
  },
}));
