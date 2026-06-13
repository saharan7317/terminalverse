// TerminalVerse — Terminal Input Component

import { useState, useRef, useEffect, useCallback } from 'react';
import { commandRegistry } from '../../utils/commandRegistry';

interface TerminalInputProps {
  onSubmit: (command: string) => void;
  onHistoryUp: () => string;
  onHistoryDown: () => string;
  disabled?: boolean;
}

export default function TerminalInput({ onSubmit, onHistoryUp, onHistoryDown, disabled }: TerminalInputProps) {
  const [input, setInput] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const [tabCompletions, setTabCompletions] = useState<string[]>([]);
  const [tabIndex, setTabIndex] = useState(-1);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus on mount and after each command
  useEffect(() => {
    if (!disabled) {
      hiddenInputRef.current?.focus();
    }
  }, [disabled]);

  // Global click-to-focus
  useEffect(() => {
    const handleClick = () => {
      if (!disabled) {
        hiddenInputRef.current?.focus();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [disabled]);

  // Sync cursor position from the hidden input
  const syncCursor = useCallback(() => {
    if (hiddenInputRef.current) {
      setCursorPos(hiddenInputRef.current.selectionStart ?? input.length);
    }
  }, [input.length]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    // Defer to next tick so selectionStart is updated
    requestAnimationFrame(() => {
      setCursorPos(e.target.selectionStart ?? e.target.value.length);
    });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // After any key, sync cursor position
    const syncAfter = () => {
      requestAnimationFrame(() => syncCursor());
    };

    switch (e.key) {
      case 'Enter': {
        e.preventDefault();
        const cmd = input.trim();
        if (cmd) {
          onSubmit(cmd);
          setInput('');
          setCursorPos(0);
          setTabCompletions([]);
          setTabIndex(-1);
        }
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        const prev = onHistoryUp();
        setInput(prev);
        setCursorPos(prev.length);
        setTabCompletions([]);
        setTabIndex(-1);
        // Move hidden input cursor to end
        requestAnimationFrame(() => {
          hiddenInputRef.current?.setSelectionRange(prev.length, prev.length);
        });
        break;
      }

      case 'ArrowDown': {
        e.preventDefault();
        const next = onHistoryDown();
        setInput(next);
        setCursorPos(next.length);
        setTabCompletions([]);
        setTabIndex(-1);
        requestAnimationFrame(() => {
          hiddenInputRef.current?.setSelectionRange(next.length, next.length);
        });
        break;
      }

      case 'ArrowLeft':
      case 'ArrowRight':
      case 'Home':
      case 'End': {
        // Let the hidden input handle cursor movement, then sync
        syncAfter();
        break;
      }

      case 'Tab': {
        e.preventDefault();
        const parts = input.split(' ');
        const partial = parts[parts.length - 1];

        if (tabCompletions.length > 0) {
          const nextIndex = (tabIndex + 1) % tabCompletions.length;
          setTabIndex(nextIndex);
          parts[parts.length - 1] = tabCompletions[nextIndex];
          const newInput = parts.join(' ');
          setInput(newInput);
          setCursorPos(newInput.length);
        } else {
          const completions = commandRegistry.complete(partial);
          if (completions.length === 1) {
            parts[parts.length - 1] = completions[0];
            const newInput = parts.join(' ') + ' ';
            setInput(newInput);
            setCursorPos(newInput.length);
            setTabCompletions([]);
          } else if (completions.length > 1) {
            setTabCompletions(completions);
            setTabIndex(0);
            parts[parts.length - 1] = completions[0];
            const newInput = parts.join(' ');
            setInput(newInput);
            setCursorPos(newInput.length);
          }
        }
        break;
      }

      case 'c': {
        if (e.ctrlKey) {
          e.preventDefault();
          setInput('');
          setCursorPos(0);
          setTabCompletions([]);
          setTabIndex(-1);
        } else {
          syncAfter();
        }
        break;
      }

      case 'l': {
        if (e.ctrlKey) {
          e.preventDefault();
          onSubmit('clear');
          setInput('');
          setCursorPos(0);
        } else {
          syncAfter();
        }
        break;
      }

      default:
        if (tabCompletions.length > 0) {
          setTabCompletions([]);
          setTabIndex(-1);
        }
        syncAfter();
        break;
    }
  }, [input, onSubmit, onHistoryUp, onHistoryDown, tabCompletions, tabIndex, syncCursor]);

  // Split text around cursor for rendering
  const textBefore = input.slice(0, cursorPos);
  const textAfter = input.slice(cursorPos);

  return (
    <div className="terminal-input-line" id="terminal-input-line" ref={containerRef}>
      <span className="terminal-prompt">
        <span className="prompt-user">ayush</span>
        <span className="prompt-at">@</span>
        <span className="prompt-host">terminalverse</span>
        <span className="prompt-separator">:</span>
        <span className="prompt-path">~</span>
        <span className="prompt-dollar">$ </span>
      </span>

      {/* Visible text with cursor at correct position */}
      <span className="input-display" onClick={() => hiddenInputRef.current?.focus()}>
        <span className="input-text-visible">{textBefore}</span>
        <span className="cursor-blink" aria-hidden="true" />
        <span className="input-text-visible">{textAfter}</span>
      </span>

      {/* Hidden actual input for keyboard capture */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="terminal-input-hidden"
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onSelect={syncCursor}
        disabled={disabled}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        aria-label="Terminal command input"
        id="terminal-command-input"
      />

      {tabCompletions.length > 1 && (
        <div className="tab-completions">
          {tabCompletions.map((comp, i) => (
            <span
              key={comp}
              className={`tab-completion-item ${i === tabIndex ? 'active' : ''}`}
            >
              {comp}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
