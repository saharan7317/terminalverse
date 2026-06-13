// TerminalVerse — Command Type Definitions

export interface CommandFlag {
  name: string;
  alias?: string;
  description: string;
  type: 'boolean' | 'string';
  default?: string | boolean;
}

export interface ParsedCommand {
  command: string;
  args: string[];
  flags: Record<string, string | boolean>;
  raw: string;
}

export type OutputType = 'text' | 'ascii' | 'table' | 'chart' | 'error' | 'system' | 'html' | 'break';

export interface CommandOutput {
  type: OutputType;
  content: string;
  color?: string;
  animate?: boolean;
  delay?: number;
}

export interface RegisteredCommand {
  name: string;
  description: string;
  usage: string;
  category: 'navigation' | 'portfolio' | 'data' | 'system' | 'game' | 'hidden';
  flags: CommandFlag[];
  examples: string[];
  aliases: string[];
  hidden: boolean;
  handler: (parsed: ParsedCommand) => CommandOutput[] | Promise<CommandOutput[]>;
}

export type ThemeName = 'cyberpunk' | 'vintage' | 'minimal';

export interface ThemeConfig {
  name: ThemeName;
  displayName: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    error: string;
    warning: string;
    success: string;
    dim: string;
    border: string;
  };
  font: string;
  effects: {
    scanlines: boolean;
    glow: boolean;
    flicker: boolean;
  };
}
