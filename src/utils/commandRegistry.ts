// TerminalVerse — Command Registry

import type { RegisteredCommand, ParsedCommand } from '../types/commands';

class CommandRegistryClass {
  private commands: Map<string, RegisteredCommand> = new Map();
  private aliases: Map<string, string> = new Map();

  register(command: RegisteredCommand): void {
    this.commands.set(command.name, command);
    command.aliases.forEach(alias => {
      this.aliases.set(alias, command.name);
    });
  }

  get(name: string): RegisteredCommand | undefined {
    const resolved = this.aliases.get(name) || name;
    return this.commands.get(resolved);
  }

  getAll(): RegisteredCommand[] {
    return Array.from(this.commands.values());
  }

  getVisible(): RegisteredCommand[] {
    return this.getAll().filter(cmd => !cmd.hidden);
  }

  getByCategory(category: string): RegisteredCommand[] {
    return this.getAll().filter(cmd => cmd.category === category && !cmd.hidden);
  }

  getNames(): string[] {
    const names = Array.from(this.commands.keys());
    const aliasNames = Array.from(this.aliases.keys());
    return [...names, ...aliasNames];
  }

  search(query: string): RegisteredCommand[] {
    const lower = query.toLowerCase();
    return this.getAll().filter(
      cmd =>
        cmd.name.includes(lower) ||
        cmd.description.toLowerCase().includes(lower) ||
        cmd.aliases.some(a => a.includes(lower))
    );
  }

  // Fuzzy match using Levenshtein distance
  fuzzyMatch(input: string, maxDistance: number = 2): string[] {
    const suggestions: Array<{ name: string; distance: number }> = [];

    for (const name of this.getNames()) {
      const dist = levenshtein(input.toLowerCase(), name.toLowerCase());
      if (dist <= maxDistance) {
        suggestions.push({ name, distance: dist });
      }
    }

    return suggestions
      .sort((a, b) => a.distance - b.distance)
      .map(s => s.name)
      .slice(0, 3);
  }

  // Tab completion
  complete(partial: string): string[] {
    const lower = partial.toLowerCase();
    return this.getNames()
      .filter(name => name.toLowerCase().startsWith(lower))
      .sort();
  }
}

// Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}

// Parse raw command string into structured object
export function parseCommand(raw: string): ParsedCommand {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { command: '', args: [], flags: {}, raw: '' };
  }

  const tokens = tokenize(trimmed);
  const command = tokens[0]?.toLowerCase() || '';
  const args: string[] = [];
  const flags: Record<string, string | boolean> = {};

  let i = 1;
  while (i < tokens.length) {
    const token = tokens[i];

    if (token.startsWith('--')) {
      const flagName = token.slice(2);
      // Check if next token is a value (not a flag)
      if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
        flags[flagName] = tokens[i + 1];
        i += 2;
      } else {
        flags[flagName] = true;
        i++;
      }
    } else if (token.startsWith('-') && token.length === 2) {
      const flagName = token.slice(1);
      if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
        flags[flagName] = tokens[i + 1];
        i += 2;
      } else {
        flags[flagName] = true;
        i++;
      }
    } else {
      args.push(token);
      i++;
    }
  }

  return { command, args, flags, raw: trimmed };
}

// Tokenize input respecting quoted strings
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuote: string | null = null;

  for (const char of input) {
    if (inQuote) {
      if (char === inQuote) {
        inQuote = null;
      } else {
        current += char;
      }
    } else if (char === '"' || char === "'") {
      inQuote = char;
    } else if (char === ' ' || char === '\t') {
      if (current) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current) tokens.push(current);
  return tokens;
}

// Singleton
export const commandRegistry = new CommandRegistryClass();
