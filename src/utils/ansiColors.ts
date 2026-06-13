// TerminalVerse — ANSI Color Utilities

// Maps semantic color names to CSS variable references
const COLOR_MAP: Record<string, string> = {
  green: 'var(--tv-primary)',
  primary: 'var(--tv-primary)',
  magenta: 'var(--tv-secondary)',
  secondary: 'var(--tv-secondary)',
  cyan: 'var(--tv-accent)',
  accent: 'var(--tv-accent)',
  red: 'var(--tv-error)',
  error: 'var(--tv-error)',
  yellow: 'var(--tv-warning)',
  warning: 'var(--tv-warning)',
  white: 'var(--tv-fg)',
  dim: 'var(--tv-dim)',
  success: 'var(--tv-success)',
};

// These utility functions accept either plain text or pre-formatted HTML.
// They do NOT escape their input, so they can be safely nested:
//   bold(colorize('hello', 'accent'))  →  <span bold><span color>hello</span></span>
// User-supplied text (e.g., command input) is already sanitized at the input layer.

export function colorize(text: string, color: string): string {
  const cssColor = COLOR_MAP[color] || color;
  return `<span style="color:${cssColor}">${text}</span>`;
}

export function bold(text: string): string {
  return `<span style="font-weight:bold">${text}</span>`;
}

export function dim(text: string): string {
  return `<span style="opacity:0.5">${text}</span>`;
}

export function underline(text: string): string {
  return `<span style="text-decoration:underline">${text}</span>`;
}

export function link(text: string, url: string): string {
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="color:var(--tv-accent);text-decoration:underline;cursor:pointer">${escapeHtml(text)}</a>`;
}

export function colorBold(text: string, color: string): string {
  const cssColor = COLOR_MAP[color] || color;
  return `<span style="color:${cssColor};font-weight:bold">${text}</span>`;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Create a line with a repeated character
export function hr(char: string = '─', length: number = 60): string {
  return colorize(char.repeat(length), 'dim');
}

// Pad string to fixed width
export function pad(text: string, width: number, char: string = ' '): string {
  if (text.length >= width) return text.slice(0, width);
  return text + char.repeat(width - text.length);
}

// Strip HTML tags for measuring raw text length
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}
