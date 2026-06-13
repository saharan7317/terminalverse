// TerminalVerse — Main Terminal Component

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTerminalStore } from '../../stores/terminalStore';
import { commandRegistry, parseCommand } from '../../utils/commandRegistry';
import { applyTheme, getTheme } from '../../styles/themes';
import { initializeCommands } from '../../data/commands';
import { colorize, dim } from '../../utils/ansiColors';
import type { CommandOutput, ThemeName } from '../../types/commands';
import BootSequence, { BootHeader } from './BootSequence';
import TerminalInput from './TerminalInput';
import TerminalOutputComponent from './TerminalOutput';
import SnakeGame from '../Games/SnakeGame';

// Initialize commands on first import
initializeCommands();

export default function Terminal() {
  const {
    lines,
    isBooting,
    theme,
    addInputLine,
    addOutputLine,
    clearLines,
    setBootComplete,
    setTheme,
    pushHistory,
    navigateHistoryUp,
    navigateHistoryDown,
  } = useTerminalStore();

  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply theme on mount and change
  useEffect(() => {
    applyTheme(getTheme(theme));
  }, [theme]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, activeGame]);

  // Handle command execution
  const handleCommand = useCallback(async (raw: string) => {
    if (isProcessing) return;

    // Add input line to history
    addInputLine(raw);
    pushHistory(raw);

    // Handle pipe commands: split by |
    const pipedCommands = raw.split('|').map(c => c.trim()).filter(Boolean);

    // For now, execute the first command (pipe support is display-only for grep)
    const mainRaw = pipedCommands[0];
    const grepFilter = pipedCommands.length > 1 ? pipedCommands[1] : null;

    const parsed = parseCommand(mainRaw);

    if (!parsed.command) return;

    // Look up command
    const cmd = commandRegistry.get(parsed.command);

    if (!cmd) {
      // Fuzzy match suggestions
      const suggestions = commandRegistry.fuzzyMatch(parsed.command);
      const outputs: CommandOutput[] = [{
        type: 'html',
        content: `\n  ${colorize('✗', 'error')} ${colorize(`Command not found: ${parsed.command}`, 'error')}` +
          (suggestions.length > 0
            ? `\n  ${dim('Did you mean:')} ${suggestions.map(s => colorize(s, 'primary')).join(', ')}?`
            : `\n  ${dim("Type 'help' to see available commands.")}`) +
          '\n',
      }];
      addOutputLine(outputs);
      return;
    }

    // Execute command
    setIsProcessing(true);
    try {
      let outputs = await Promise.resolve(cmd.handler(parsed));

      // Handle system commands
      const systemOutput = outputs.find(o => o.type === 'system');
      if (systemOutput) {
        if (systemOutput.content === '__CLEAR__') {
          clearLines();
          setIsProcessing(false);
          return;
        }

        if (systemOutput.content.startsWith('__THEME_SWITCH__:')) {
          const newTheme = systemOutput.content.split(':')[1] as ThemeName;
          setTheme(newTheme);
          applyTheme(getTheme(newTheme));
          outputs = [{
            type: 'html',
            content: `\n  ${colorize('✓', 'success')} Theme switched to ${colorize(newTheme, 'accent')}\n`,
          }];
        }

        if (systemOutput.content === '__GAME_SNAKE__') {
          setActiveGame('snake');
          setIsProcessing(false);
          return;
        }
      }

      // Apply grep filter if piped
      if (grepFilter) {
        const grepParsed = parseCommand(grepFilter);
        if (grepParsed.command === 'grep' && grepParsed.args[0]) {
          const term = grepParsed.args[0].toLowerCase();
          outputs = outputs.map(o => {
            if (o.type === 'html' || o.type === 'text') {
              const filteredLines = o.content
                .split('\n')
                .filter(line => {
                  // Strip HTML for grep matching
                  const plain = line.replace(/<[^>]*>/g, '').toLowerCase();
                  return plain.includes(term) || line.trim() === '';
                });
              return { ...o, content: filteredLines.join('\n') };
            }
            return o;
          });
        }
      }

      addOutputLine(outputs);
    } catch (err) {
      addOutputLine([{
        type: 'error',
        content: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }]);
    }
    setIsProcessing(false);
  }, [isProcessing, addInputLine, addOutputLine, clearLines, pushHistory, setTheme]);

  const handleGameExit = useCallback(() => {
    setActiveGame(null);
    addOutputLine([{
      type: 'html',
      content: `\n  ${dim('Game ended. Back to terminal.')}\n`,
    }]);
  }, [addOutputLine]);

  // Boot sequence — animated intro, shown only once
  if (isBooting) {
    return (
      <div className="terminal-container" ref={containerRef}>
        <div className="terminal-screen" ref={scrollRef}>
          <BootSequence onComplete={() => setBootComplete(true)} />
        </div>
        <div className="scanline-overlay" />
      </div>
    );
  }

  // Active game
  if (activeGame === 'snake') {
    return (
      <div className="terminal-container" ref={containerRef}>
        <div className="terminal-screen" ref={scrollRef}>
          <SnakeGame onExit={handleGameExit} />
        </div>
        <div className="scanline-overlay" />
      </div>
    );
  }

  return (
    <div className="terminal-container" ref={containerRef} id="terminal-container">
      <div className="terminal-screen" ref={scrollRef}>
        {/* Boot header — always visible at top */}
        <BootHeader />

        {/* Render all command history lines */}
        {lines.map(line => (
          <div key={line.id} className="terminal-line">
            {line.type === 'input' && (
              <div className="terminal-input-display">
                <span className="terminal-prompt">
                  <span className="prompt-user">ayush</span>
                  <span className="prompt-at">@</span>
                  <span className="prompt-host">terminalverse</span>
                  <span className="prompt-separator">:</span>
                  <span className="prompt-path">~</span>
                  <span className="prompt-dollar">$ </span>
                </span>
                <span className="input-text">{line.command}</span>
              </div>
            )}
            {line.type === 'output' && line.outputs && (
              <TerminalOutputComponent outputs={line.outputs} />
            )}
          </div>
        ))}

        {/* Active input line */}
        <TerminalInput
          onSubmit={handleCommand}
          onHistoryUp={navigateHistoryUp}
          onHistoryDown={navigateHistoryDown}
          disabled={isProcessing}
        />

        {/* Spacer for scroll padding */}
        <div className="terminal-bottom-spacer" />
      </div>

      {/* CRT Effects */}
      <div className="scanline-overlay" />
      <div className="crt-flicker" />
    </div>
  );
}
