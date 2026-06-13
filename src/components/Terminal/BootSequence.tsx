// TerminalVerse — Boot Sequence Component
// Now serves two roles:
// 1. Animated intro on first load (full screen, skippable)
// 2. Static header rendered permanently at the top of the terminal

import { useState, useEffect, useCallback } from 'react';

interface BootSequenceProps {
  onComplete: () => void;
}

interface BootLine {
  text: string;
  color: string;
  delay: number;
}

const BOOT_LINES: BootLine[] = [
  { text: '', color: '', delay: 200 },
  { text: '  ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗', color: 'var(--tv-accent)', delay: 50 },
  { text: '  ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║', color: 'var(--tv-accent)', delay: 50 },
  { text: '     ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║', color: 'var(--tv-accent)', delay: 50 },
  { text: '     ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║', color: 'var(--tv-accent)', delay: 50 },
  { text: '     ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗', color: 'var(--tv-accent)', delay: 50 },
  { text: '     ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝', color: 'var(--tv-accent)', delay: 50 },
  { text: '', color: '', delay: 100 },
  { text: '  ██╗   ██╗███████╗██████╗ ███████╗███████╗', color: 'var(--tv-secondary)', delay: 50 },
  { text: '  ██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝', color: 'var(--tv-secondary)', delay: 50 },
  { text: '  ██║   ██║█████╗  ██████╔╝███████╗█████╗  ', color: 'var(--tv-secondary)', delay: 50 },
  { text: '  ╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝  ', color: 'var(--tv-secondary)', delay: 50 },
  { text: '   ╚████╔╝ ███████╗██║  ██║███████║███████╗', color: 'var(--tv-secondary)', delay: 50 },
  { text: '    ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝', color: 'var(--tv-secondary)', delay: 50 },
  { text: '', color: '', delay: 300 },
  { text: '  [BOOT] Initializing TerminalVerse v1.0...', color: 'var(--tv-primary)', delay: 400 },
  { text: '  [OK]   Loading personality module...', color: 'var(--tv-primary)', delay: 300 },
  { text: '  [OK]   Mounting portfolio filesystem...', color: 'var(--tv-primary)', delay: 250 },
  { text: '  [OK]   Connecting to GitHub API...', color: 'var(--tv-primary)', delay: 350 },
  { text: '  [OK]   Scanning for easter eggs...', color: 'var(--tv-primary)', delay: 200 },
  { text: '  [OK]   Activating cyberpunk theme...', color: 'var(--tv-primary)', delay: 200 },
  { text: '', color: '', delay: 200 },
  { text: '  ═══════════════════════════════════════════════════════════════', color: 'var(--tv-dim)', delay: 100 },
  { text: '  Welcome to TerminalVerse — An interactive CLI portfolio', color: 'var(--tv-fg)', delay: 100 },
  { text: "  Type 'help' to see available commands.", color: 'var(--tv-accent)', delay: 100 },
  { text: '  ═══════════════════════════════════════════════════════════════', color: 'var(--tv-dim)', delay: 100 },
  { text: '', color: '', delay: 100 },
];

// Exported for the static header
export { BOOT_LINES };

/**
 * Animated boot sequence — shown once on first visit.
 * Skippable by clicking or pressing any key.
 */
export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [skipped, setSkipped] = useState(false);

  const skip = useCallback(() => {
    if (!skipped) {
      setSkipped(true);
      setVisibleLines(BOOT_LINES.length);
      setTimeout(onComplete, 300);
    }
  }, [skipped, onComplete]);

  useEffect(() => {
    if (skipped) return;

    if (visibleLines >= BOOT_LINES.length) {
      setTimeout(onComplete, 500);
      return;
    }

    const delay = BOOT_LINES[visibleLines]?.delay || 100;
    const timer = setTimeout(() => {
      setVisibleLines(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [visibleLines, skipped, onComplete]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Skip boot on any keypress
      if (e.key !== 'F5' && e.key !== 'F12') {
        skip();
      }
    };
    const handleClick = () => skip();

    window.addEventListener('keydown', handleKey);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('click', handleClick);
    };
  }, [skip]);

  return (
    <div className="boot-sequence" onClick={skip}>
      <div className="boot-lines">
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className="boot-line"
            style={{
              color: line.color || 'var(--tv-fg)',
              animation: 'fadeIn 0.15s ease-out',
            }}
          >
            <pre>{line.text}</pre>
          </div>
        ))}
      </div>
      {visibleLines < BOOT_LINES.length && (
        <div className="boot-skip-hint">
          Press any key to skip...
        </div>
      )}
    </div>
  );
}

/**
 * Static boot header — always rendered at the top of the terminal.
 * No animation, just the final state of the boot output.
 */
export function BootHeader() {
  return (
    <div className="boot-header">
      {BOOT_LINES.map((line, i) => (
        <div
          key={i}
          className="boot-line"
          style={{ color: line.color || 'var(--tv-fg)' }}
        >
          <pre>{line.text}</pre>
        </div>
      ))}
    </div>
  );
}
