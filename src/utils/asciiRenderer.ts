// TerminalVerse — ASCII Rendering Utilities

import { colorize, bold, dim, pad, stripHtml } from './ansiColors';

// ─── ASCII Table ─────────────────────────────────────────────────────────────

interface TableOptions {
  headerColor?: string;
  borderColor?: string;
  padding?: number;
}

export function renderTable(
  headers: string[],
  rows: string[][],
  options: TableOptions = {}
): string {
  const { headerColor = 'accent', borderColor = 'dim', padding = 1 } = options;
  const padChar = ' '.repeat(padding);

  // Calculate column widths
  const colWidths = headers.map((h, i) => {
    const maxRow = rows.reduce((max, row) => Math.max(max, stripHtml(row[i] || '').length), 0);
    return Math.max(stripHtml(h).length, maxRow);
  });

  const border = (left: string, mid: string, right: string, fill: string) =>
    colorize(
      left + colWidths.map(w => fill.repeat(w + padding * 2)).join(mid) + right,
      borderColor
    );

  const formatRow = (cells: string[], color?: string) =>
    colorize('│', borderColor) +
    cells
      .map((cell, i) => {
        const raw = stripHtml(cell);
        const cellPad = ' '.repeat(Math.max(0, colWidths[i] - raw.length));
        const content = color ? colorize(raw, color) : cell;
        return padChar + content + cellPad + padChar;
      })
      .join(colorize('│', borderColor)) +
    colorize('│', borderColor);

  const lines: string[] = [];
  lines.push(border('┌', '┬', '┐', '─'));
  lines.push(formatRow(headers, headerColor));
  lines.push(border('├', '┼', '┤', '─'));
  rows.forEach(row => lines.push(formatRow(row)));
  lines.push(border('└', '┴', '┘', '─'));

  return lines.join('\n');
}

// ─── ASCII Bar Chart ─────────────────────────────────────────────────────────

interface BarChartOptions {
  maxWidth?: number;
  barChar?: string;
  emptyChar?: string;
  showPercentage?: boolean;
  labelWidth?: number;
  barColor?: string;
}

export function renderBarChart(
  data: Array<{ label: string; value: number; color?: string }>,
  options: BarChartOptions = {}
): string {
  const {
    maxWidth = 30,
    barChar = '█',
    emptyChar = '░',
    showPercentage = true,
    barColor = 'primary',
  } = options;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const labelWidth = Math.max(...data.map(d => d.label.length));

  return data
    .map(item => {
      const barLen = Math.round((item.value / maxVal) * maxWidth);
      const emptyLen = maxWidth - barLen;
      const label = pad(item.label, labelWidth);
      const color = item.color || barColor;
      const bar = colorize(barChar.repeat(barLen), color) + dim(emptyChar.repeat(emptyLen));
      const pct = showPercentage ? ` ${dim(String(item.value))}` : '';
      return `  ${colorize(label, 'accent')} ${bar}${pct}`;
    })
    .join('\n');
}

// ─── ASCII Tree ──────────────────────────────────────────────────────────────

interface TreeNode {
  label: string;
  children?: TreeNode[];
  color?: string;
}

export function renderTree(nodes: TreeNode[], prefix: string = ''): string {
  const lines: string[] = [];

  nodes.forEach((node, index) => {
    const isLast = index === nodes.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = isLast ? '    ' : '│   ';

    const label = node.color ? colorize(node.label, node.color) : node.label;
    lines.push(dim(prefix + connector) + label);

    if (node.children && node.children.length > 0) {
      lines.push(renderTree(node.children, prefix + childPrefix));
    }
  });

  return lines.join('\n');
}

// ─── ASCII Timeline ──────────────────────────────────────────────────────────

interface TimelineEntry {
  date: string;
  title: string;
  description: string;
  details?: string[];
}

export function renderTimeline(entries: TimelineEntry[]): string {
  const lines: string[] = [];

  entries.forEach((entry, index) => {
    const isLast = index === entries.length - 1;
    const bullet = colorize('●', 'accent');
    const pipe = colorize('│', 'dim');
    const dateLine = `  ${bullet} ${bold(colorize(entry.date, 'warning'))}`;
    const titleLine = `  ${pipe}   ${bold(colorize(entry.title, 'primary'))}`;
    const descLine = `  ${pipe}   ${entry.description}`;

    lines.push(dateLine);
    lines.push(titleLine);
    lines.push(descLine);

    if (entry.details) {
      entry.details.forEach(detail => {
        lines.push(`  ${pipe}     ${dim('▸')} ${detail}`);
      });
    }

    if (!isLast) {
      lines.push(`  ${pipe}`);
    }
  });

  return lines.join('\n');
}

// ─── ASCII Box ───────────────────────────────────────────────────────────────

export function renderBox(content: string, title?: string, color: string = 'dim'): string {
  const contentLines = content.split('\n');
  const maxLen = Math.max(...contentLines.map(l => stripHtml(l).length), title ? stripHtml(title).length + 2 : 0);
  const width = maxLen + 4;

  const lines: string[] = [];
  const topBorder = title
    ? colorize('╔══ ', color) + bold(colorize(title, 'accent')) + colorize(' ' + '═'.repeat(Math.max(0, width - stripHtml(title).length - 6)) + '╗', color)
    : colorize('╔' + '═'.repeat(width - 2) + '╗', color);

  lines.push(topBorder);
  contentLines.forEach(line => {
    const raw = stripHtml(line);
    const padding = ' '.repeat(Math.max(0, width - raw.length - 4));
    lines.push(colorize('║', color) + ' ' + line + padding + ' ' + colorize('║', color));
  });
  lines.push(colorize('╚' + '═'.repeat(width - 2) + '╝', color));

  return lines.join('\n');
}

// ─── Progress Bar ────────────────────────────────────────────────────────────

export function renderProgressBar(
  value: number,
  max: number = 10,
  width: number = 20,
  color: string = 'primary'
): string {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  const pct = Math.round((value / max) * 100);
  return colorize('█'.repeat(filled), color) + dim('░'.repeat(empty)) + ` ${pct}%`;
}

// ─── Skill Dots ──────────────────────────────────────────────────────────────

export function renderSkillDots(level: number, max: number = 10, color: string = 'primary'): string {
  const filled = Math.min(level, max);
  const empty = max - filled;
  return colorize('●'.repeat(filled), color) + dim('○'.repeat(empty));
}
