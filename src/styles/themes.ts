// TerminalVerse — Theme Definitions

import type { ThemeConfig, ThemeName } from '../types/commands';

export const themes: Record<ThemeName, ThemeConfig> = {
  cyberpunk: {
    name: 'cyberpunk',
    displayName: 'Cyberpunk',
    colors: {
      background: '#0a0a0f',
      foreground: '#c0c0c0',
      primary: '#00ff41',
      secondary: '#ff00ff',
      accent: '#00ffff',
      error: '#ff0040',
      warning: '#ffaa00',
      success: '#00ff41',
      dim: '#4a4a5a',
      border: '#1a1a2e',
    },
    font: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
    effects: {
      scanlines: true,
      glow: true,
      flicker: true,
    },
  },
  vintage: {
    name: 'vintage',
    displayName: 'Vintage Handheld',
    colors: {
      background: '#8bac0f',
      foreground: '#0f380f',
      primary: '#0f380f',
      secondary: '#306230',
      accent: '#0f380f',
      error: '#0f380f',
      warning: '#306230',
      success: '#0f380f',
      dim: '#4a6a2a',
      border: '#306230',
    },
    font: '"Press Start 2P", "JetBrains Mono", monospace',
    effects: {
      scanlines: false,
      glow: false,
      flicker: false,
    },
  },
  minimal: {
    name: 'minimal',
    displayName: 'Minimal',
    colors: {
      background: '#1a1a1a',
      foreground: '#e0e0e0',
      primary: '#ffffff',
      secondary: '#888888',
      accent: '#ffffff',
      error: '#ff6b6b',
      warning: '#ffd93d',
      success: '#6bcb77',
      dim: '#555555',
      border: '#333333',
    },
    font: '"SF Mono", "Consolas", "JetBrains Mono", monospace',
    effects: {
      scanlines: false,
      glow: false,
      flicker: false,
    },
  },
};

export function getTheme(name: ThemeName): ThemeConfig {
  return themes[name] || themes.cyberpunk;
}

export function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement;
  const { colors, font, effects } = theme;

  root.style.setProperty('--tv-bg', colors.background);
  root.style.setProperty('--tv-fg', colors.foreground);
  root.style.setProperty('--tv-primary', colors.primary);
  root.style.setProperty('--tv-secondary', colors.secondary);
  root.style.setProperty('--tv-accent', colors.accent);
  root.style.setProperty('--tv-error', colors.error);
  root.style.setProperty('--tv-warning', colors.warning);
  root.style.setProperty('--tv-success', colors.success);
  root.style.setProperty('--tv-dim', colors.dim);
  root.style.setProperty('--tv-border', colors.border);
  root.style.setProperty('--tv-font', font);

  root.classList.toggle('scanlines', effects.scanlines);
  root.classList.toggle('glow-enabled', effects.glow);
  root.classList.toggle('flicker-enabled', effects.flicker);

  root.setAttribute('data-theme', theme.name);
}
