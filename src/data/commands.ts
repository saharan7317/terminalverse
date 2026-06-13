// TerminalVerse — Command Definitions & Registration

import type { CommandOutput, ParsedCommand } from '../types/commands';
import { commandRegistry } from '../utils/commandRegistry';
import { colorize, bold, dim, link, colorBold, hr } from '../utils/ansiColors';
import { renderTable, renderBarChart, renderTree, renderTimeline, renderBox, renderSkillDots } from '../utils/asciiRenderer';
import { portfolioData } from './portfolio';
import { fetchRepos, fetchGitHubStats, formatRateLimitError } from '../utils/githubAPI';
import type { GitHubAPIError } from '../types/github';

// ─── HELP ────────────────────────────────────────────────────────────────────

commandRegistry.register({
  name: 'help',
  description: 'Display available commands or help for a specific command',
  usage: 'help [command]',
  category: 'system',
  flags: [],
  examples: ['help', 'help projects', 'help github'],
  aliases: ['?', 'h'],
  hidden: false,
  handler: (parsed: ParsedCommand): CommandOutput[] => {
    const specificCmd = parsed.args[0];

    if (specificCmd) {
      const cmd = commandRegistry.get(specificCmd);
      if (!cmd) {
        return [{ type: 'error', content: `No help available for unknown command: ${specificCmd}` }];
      }

      const lines: string[] = [];
      lines.push('');
      lines.push(bold(colorize(`  ${cmd.name}`, 'accent')) + dim(` — ${cmd.description}`));
      lines.push('');
      lines.push(`  ${dim('Usage:')}   ${colorize(cmd.usage, 'primary')}`);

      if (cmd.flags.length > 0) {
        lines.push(`  ${dim('Flags:')}`);
        cmd.flags.forEach(f => {
          const alias = f.alias ? colorize(`-${f.alias}`, 'warning') + ', ' : '    ';
          lines.push(`    ${alias}${colorize(`--${f.name}`, 'warning')}  ${dim(f.description)}`);
        });
      }

      if (cmd.examples.length > 0) {
        lines.push('');
        lines.push(`  ${dim('Examples:')}`);
        cmd.examples.forEach(ex => {
          lines.push(`    ${colorize('$', 'dim')} ${colorize(ex, 'primary')}`);
        });
      }

      if (cmd.aliases.length > 0) {
        lines.push('');
        lines.push(`  ${dim('Aliases:')} ${cmd.aliases.map(a => colorize(a, 'warning')).join(', ')}`);
      }

      lines.push('');
      return [{ type: 'html', content: lines.join('\n') }];
    }

    // List all commands grouped by category
    const categories: Record<string, typeof commandRegistry extends { getByCategory: (c: string) => infer R } ? R : never> = {
      portfolio: commandRegistry.getByCategory('portfolio'),
      data: commandRegistry.getByCategory('data'),
      system: commandRegistry.getByCategory('system'),
      game: commandRegistry.getByCategory('game'),
    };

    const lines: string[] = [];
    lines.push('');
    lines.push(bold(colorize('  TerminalVerse', 'accent')) + dim(' — Interactive CLI Portfolio'));
    lines.push(dim('  Type a command to explore. Use ') + colorize('help <command>', 'primary') + dim(' for details.'));
    lines.push('');

    const categoryLabels: Record<string, string> = {
      portfolio: '📁  Portfolio',
      data: '📡  Data',
      system: '⚙️   System',
      game: '🎮  Games',
    };

    Object.entries(categories).forEach(([cat, cmds]) => {
      if (cmds.length === 0) return;
      lines.push(`  ${bold(colorize(categoryLabels[cat] || cat, 'secondary'))}`);
      cmds.forEach(cmd => {
        const name = colorize(cmd.name.padEnd(14), 'primary');
        lines.push(`    ${name} ${dim(cmd.description)}`);
      });
      lines.push('');
    });

    lines.push(dim('  💡 Tip: There might be hidden commands to discover...'));
    lines.push('');

    return [{ type: 'html', content: lines.join('\n') }];
  },
});

// ─── ABOUT ───────────────────────────────────────────────────────────────────

commandRegistry.register({
  name: 'about',
  description: 'Learn about me — who I am and what I do',
  usage: 'about [--ascii]',
  category: 'portfolio',
  flags: [{ name: 'ascii', alias: 'a', description: 'Show ASCII art portrait', type: 'boolean' }],
  examples: ['about', 'about --ascii'],
  aliases: ['whoami', 'me'],
  hidden: false,
  handler: (parsed: ParsedCommand): CommandOutput[] => {
    const { personal, contact } = portfolioData;
    const showAscii = parsed.flags['ascii'] || parsed.flags['a'];

    const asciiArt = `
    ${colorize('     ╔══════════════╗', 'dim')}
    ${colorize('     ║', 'dim')}  ${colorize('┌─────┐', 'accent')}   ${colorize('║', 'dim')}
    ${colorize('     ║', 'dim')}  ${colorize('│ ◉ ◉ │', 'accent')}   ${colorize('║', 'dim')}
    ${colorize('     ║', 'dim')}  ${colorize('│  ▽  │', 'accent')}   ${colorize('║', 'dim')}
    ${colorize('     ║', 'dim')}  ${colorize('│ \\_/ │', 'accent')}   ${colorize('║', 'dim')}
    ${colorize('     ║', 'dim')}  ${colorize('└─────┘', 'accent')}   ${colorize('║', 'dim')}
    ${colorize('     ╚══════════════╝', 'dim')}`;

    const lines: string[] = [];
    lines.push('');

    if (showAscii) {
      lines.push(asciiArt);
      lines.push('');
    }

    lines.push(`  ${bold(colorize(`Hey there, I'm ${personal.name}!`, 'accent'))}`);
    lines.push(`  ${colorize(personal.title, 'secondary')}`);
    lines.push('');
    lines.push(`  ${colorize('📍', 'warning')} ${personal.location}`);
    lines.push('');

    // Word-wrap bio at ~70 chars
    const words = personal.bio.split(' ');
    let line = '  ';
    words.forEach(word => {
      if (line.length + word.length > 72) {
        lines.push(line);
        line = '  ';
      }
      line += word + ' ';
    });
    if (line.trim()) lines.push(line);

    lines.push('');
    lines.push(`  ${dim(personal.tagline)}`);
    lines.push('');

    // What I'm Up To
    lines.push(`  ${bold(colorize('🚀 What I\'m Up To', 'accent'))}`);
    lines.push('');
    personal.whatImUpTo.forEach(item => {
      lines.push(`  ${item}`);
    });
    lines.push('');

    // Beyond the Terminal
    lines.push(`  ${bold(colorize('🎵 Beyond the Terminal', 'accent'))}`);
    lines.push('');
    personal.beyondTerminal.forEach(item => {
      lines.push(`  ${item}`);
    });

    lines.push('');
    lines.push(`  ${hr('─', 50)}`);
    lines.push('');
    lines.push(`  ${colorize('GitHub:', 'dim')}    ${link(contact.github, `https://github.com/${contact.github}`)}`);
    if (contact.linkedin) {
      lines.push(`  ${colorize('LinkedIn:', 'dim')}  ${link(contact.linkedin, `https://linkedin.com/in/${contact.linkedin}`)}`);
    }
    if (contact.twitter) {
      lines.push(`  ${colorize('Twitter:', 'dim')}   ${link('@' + contact.twitter, `https://x.com/${contact.twitter}`)}`);
    }
    lines.push('');
    lines.push(`  ${dim('"The best way to predict the future is to write the code for it."')}`);
    lines.push('');

    return [{ type: 'html', content: lines.join('\n') }];
  },
});

// ─── PROJECTS ────────────────────────────────────────────────────────────────

commandRegistry.register({
  name: 'projects',
  description: 'Browse my portfolio projects (auto-syncs with GitHub)',
  usage: 'projects [--list|--grid|--detail <id>|--live]',
  category: 'portfolio',
  flags: [
    { name: 'list', alias: 'l', description: 'Compact list view (default)', type: 'boolean' },
    { name: 'grid', alias: 'g', description: 'ASCII grid view', type: 'boolean' },
    { name: 'detail', alias: 'd', description: 'Detailed view of a project', type: 'string' },
    { name: 'live', description: 'Show all GitHub repos (live fetch)', type: 'boolean' },
  ],
  examples: ['projects', 'projects --grid', 'projects --detail terminalverse', 'projects --live'],
  aliases: ['ls', 'proj'],
  hidden: false,
  handler: async (parsed: ParsedCommand): Promise<CommandOutput[]> => {
    const { projects } = portfolioData;
    const detailId = parsed.flags['detail'] || parsed.flags['d'];
    const showGrid = parsed.flags['grid'] || parsed.flags['g'];
    const showLive = parsed.flags['live'];

    // --live: show all repos from GitHub
    if (showLive) {
      try {
        const { data: repos, cached } = await fetchRepos(portfolioData.personal.username, 'pushed');
        const cacheIndicator = cached ? dim(' [cached]') : '';
        const lines: string[] = [''];
        lines.push(bold(colorize('  GitHub Repositories', 'accent')) + dim(` (${repos.length} total)`) + cacheIndicator);
        lines.push('');

        repos.slice(0, 20).forEach(r => {
          const star = r.stargazers_count > 0 ? colorize(` ⭐${r.stargazers_count}`, 'warning') : '';
          const name = colorBold(r.name.padEnd(24), 'primary');
          const desc = r.description
            ? (r.description.length > 40 ? r.description.slice(0, 40) + '…' : r.description)
            : dim('No description');
          const lang = r.language ? colorize(r.language, 'secondary') : '';
          lines.push(`  ${name} ${dim(desc)}${star} ${lang}`);
        });

        lines.push('');
        lines.push(dim(`  Showing ${Math.min(20, repos.length)} of ${repos.length} repos`));
        lines.push(dim(`  Use 'github --repos' for a detailed table view`));
        lines.push('');
        return [{ type: 'html', content: lines.join('\n') }];
      } catch (err) {
        const apiErr = err as GitHubAPIError;
        return [{ type: 'error', content: `GitHub API Error: ${formatRateLimitError(apiErr)}` }];
      }
    }

    // Try to merge local projects with live GitHub repos (silently)
    let mergedProjects = [...projects];
    try {
      const { data: repos } = await fetchRepos(portfolioData.personal.username, 'stars');
      // Add any GitHub repos not already in the featured projects list
      const existingIds = new Set(projects.map(p => p.id.toLowerCase()));
      const liveExtras = repos
        .filter(r => !existingIds.has(r.name.toLowerCase()) && !r.fork)
        .slice(0, 6)
        .map(r => ({
          id: r.name.toLowerCase(),
          name: r.name,
          description: r.description || 'A GitHub repository',
          tech: [r.language || 'Various'].filter(Boolean),
          github: r.html_url,
          featured: false,
        }));
      mergedProjects = [...projects, ...liveExtras];
    } catch {
      // Silently fall back to local projects only
    }

    // Detail view
    if (detailId && typeof detailId === 'string') {
      const project = mergedProjects.find(p => p.id === detailId || p.name.toLowerCase() === detailId.toLowerCase());
      if (!project) {
        return [{ type: 'error', content: `Project not found: "${detailId}". Use 'projects' to see available IDs.` }];
      }

      const lines: string[] = [];
      lines.push('');

      if (project.asciiPreview) {
        lines.push(colorize(project.asciiPreview, 'dim'));
        lines.push('');
      }

      lines.push(bold(colorize(`  ${project.name}`, 'accent')) + (project.featured ? colorize(' ★ Featured', 'warning') : ''));
      lines.push('');
      lines.push(`  ${project.description}`);
      lines.push('');
      lines.push(`  ${colorize('Tech:', 'dim')}  ${project.tech.map(t => colorize(t, 'secondary')).join(dim(' · '))}`);

      if (project.github) {
        lines.push(`  ${colorize('Repo:', 'dim')}  ${link(project.github, project.github)}`);
      }
      if (project.demo) {
        lines.push(`  ${colorize('Demo:', 'dim')}  ${link(project.demo, project.demo)}`);
      }

      lines.push('');
      return [{ type: 'html', content: lines.join('\n') }];
    }

    // Grid view
    if (showGrid) {
      const lines: string[] = [''];

      const gridProjects = mergedProjects.slice(0, 8); // max 8 for grid
      for (let i = 0; i < gridProjects.length; i += 2) {
        const p1 = gridProjects[i];
        const p2 = gridProjects[i + 1];

        const box1 = makeProjectBox(p1);
        const box2 = p2 ? makeProjectBox(p2) : [];

        const maxLines = Math.max(box1.length, box2.length);
        for (let j = 0; j < maxLines; j++) {
          const left = box1[j] || ' '.repeat(38);
          const right = box2[j] || '';
          lines.push(`  ${left}  ${right}`);
        }
        lines.push('');
      }

      lines.push(dim(`  Use 'projects --detail <id>' for full details`));
      lines.push(dim(`  Use 'projects --live' for all GitHub repos`));
      lines.push('');
      return [{ type: 'html', content: lines.join('\n') }];
    }

    // Default list view
    const featuredCount = mergedProjects.filter(p => p.featured).length;
    const lines: string[] = [''];
    lines.push(bold(colorize('  Projects', 'accent')) + dim(` (${mergedProjects.length} total · ${featuredCount} featured)`));
    lines.push('');

    mergedProjects.forEach(p => {
      const star = p.featured ? colorize(' ★', 'warning') : '';
      const name = colorBold(p.id.padEnd(22), 'primary');
      const desc = p.description.length > 45 ? p.description.slice(0, 45) + '…' : p.description;
      lines.push(`  ${name} ${dim(desc)}${star}`);
    });

    lines.push('');
    lines.push(dim(`  ★ = Featured project · Use 'projects --detail <id>' for full details`));
    lines.push(dim(`  Use 'projects --live' for all GitHub repos`));
    lines.push('');

    return [{ type: 'html', content: lines.join('\n') }];
  },
});

function makeProjectBox(project: { id: string; name: string; tech: string[]; featured: boolean }): string[] {
  const width = 36;
  const lines: string[] = [];
  const featured = project.featured ? colorize(' ★', 'warning') : '';

  lines.push(colorize('┌' + '─'.repeat(width) + '┐', 'dim'));
  const nameStr = ` ${project.name}`;
  const namePad = ' '.repeat(Math.max(0, width - project.name.length - 1 - (project.featured ? 2 : 0)));
  lines.push(colorize('│', 'dim') + bold(colorize(nameStr, 'accent')) + featured + namePad + colorize('│', 'dim'));

  const techStr = ` ${project.tech.slice(0, 3).join(' · ')}`;
  const techPad = ' '.repeat(Math.max(0, width - techStr.length));
  lines.push(colorize('│', 'dim') + dim(techStr) + techPad + colorize('│', 'dim'));

  const idStr = ` id: ${project.id}`;
  const idPad = ' '.repeat(Math.max(0, width - idStr.length));
  lines.push(colorize('│', 'dim') + colorize(idStr, 'secondary') + idPad + colorize('│', 'dim'));

  lines.push(colorize('└' + '─'.repeat(width) + '┘', 'dim'));

  return lines;
}

// ─── SKILLS ──────────────────────────────────────────────────────────────────

commandRegistry.register({
  name: 'skills',
  description: 'View my technical skills and proficiencies',
  usage: 'skills [--list|--graph|--tree]',
  category: 'portfolio',
  flags: [
    { name: 'list', alias: 'l', description: 'List with proficiency dots (default)', type: 'boolean' },
    { name: 'graph', alias: 'g', description: 'Horizontal bar chart', type: 'boolean' },
    { name: 'tree', alias: 't', description: 'Tree view grouped by category', type: 'boolean' },
  ],
  examples: ['skills', 'skills --graph', 'skills --tree'],
  aliases: ['tech', 'stack'],
  hidden: false,
  handler: (parsed: ParsedCommand): CommandOutput[] => {
    const { skills } = portfolioData;
    const showGraph = parsed.flags['graph'] || parsed.flags['g'];
    const showTree = parsed.flags['tree'] || parsed.flags['t'];

    if (showGraph) {
      const lines: string[] = [''];
      lines.push(bold(colorize('  Technical Skills', 'accent')) + dim(' — Bar Chart'));
      lines.push('');

      const categories = ['frontend', 'backend', 'devops', 'design', 'other'] as const;
      const categoryLabels: Record<string, string> = {
        frontend: '🖥️  Frontend',
        backend: '⚙️  Backend',
        devops: '🚀  DevOps',
        design: '🎨  Design',
        other: '🔧  Other',
      };
      const categoryColors: Record<string, string> = {
        frontend: 'accent',
        backend: 'primary',
        devops: 'warning',
        design: 'secondary',
        other: '#aaa',
      };

      categories.forEach(cat => {
        const catSkills = skills.filter(s => s.category === cat);
        if (catSkills.length === 0) return;

        lines.push(`  ${bold(colorize(categoryLabels[cat], categoryColors[cat]))}`);
        lines.push(
          renderBarChart(
            catSkills.map(s => ({ label: s.name, value: s.level, color: categoryColors[cat] })),
            { maxWidth: 25, showPercentage: true }
          )
        );
        lines.push('');
      });

      return [{ type: 'html', content: lines.join('\n') }];
    }

    if (showTree) {
      const lines: string[] = [''];
      lines.push(bold(colorize('  Technical Skills', 'accent')) + dim(' — Tree View'));
      lines.push('');

      const grouped = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(skill);
        return acc;
      }, {});

      const treeNodes = Object.entries(grouped).map(([category, catSkills]) => ({
        label: bold(colorize(category.toUpperCase(), 'secondary')),
        children: catSkills.map(s => ({
          label: `${colorize(s.name, 'primary')} ${renderSkillDots(s.level)}${s.years ? dim(` (${s.years}y)`) : ''}`,
        })),
      }));

      lines.push('  ' + renderTree(treeNodes).split('\n').join('\n  '));
      lines.push('');

      return [{ type: 'html', content: lines.join('\n') }];
    }

    // Default list view
    const lines: string[] = [''];
    lines.push(bold(colorize('  Technical Skills', 'accent')) + dim(` (${skills.length} total)`));
    lines.push('');

    const categories = ['frontend', 'backend', 'devops', 'design', 'other'] as const;
    const labels: Record<string, string> = {
      frontend: '🖥️  Frontend',
      backend: '⚙️  Backend',
      devops: '🚀  DevOps',
      design: '🎨  Design',
      other: '🔧  Other',
    };

    categories.forEach(cat => {
      const catSkills = skills.filter(s => s.category === cat);
      if (catSkills.length === 0) return;

      lines.push(`  ${bold(colorize(labels[cat], 'secondary'))}`);
      catSkills.forEach(s => {
        const name = colorize(s.name.padEnd(16), 'primary');
        const dots = renderSkillDots(s.level);
        const years = s.years ? dim(` ${s.years}y`) : '';
        lines.push(`    ${name} ${dots}${years}`);
      });
      lines.push('');
    });

    return [{ type: 'html', content: lines.join('\n') }];
  },
});

// ─── EXPERIENCE ──────────────────────────────────────────────────────────────

commandRegistry.register({
  name: 'experience',
  description: 'View my work history and professional experience',
  usage: 'experience [--timeline|--table]',
  category: 'portfolio',
  flags: [
    { name: 'timeline', alias: 't', description: 'Vertical timeline view (default)', type: 'boolean' },
    { name: 'table', description: 'Table view', type: 'boolean' },
  ],
  examples: ['experience', 'experience --table'],
  aliases: ['exp', 'work', 'career'],
  hidden: false,
  handler: (parsed: ParsedCommand): CommandOutput[] => {
    const { experience } = portfolioData;
    const showTable = parsed.flags['table'];

    if (showTable) {
      const lines: string[] = [''];
      lines.push(bold(colorize('  Work Experience', 'accent')) + dim(' — Table View'));
      lines.push('');

      const table = renderTable(
        ['Period', 'Company', 'Role'],
        experience.map(e => [e.period, e.company, e.role]),
        { headerColor: 'accent', borderColor: 'dim' }
      );

      lines.push('  ' + table.split('\n').join('\n  '));
      lines.push('');

      return [{ type: 'html', content: lines.join('\n') }];
    }

    // Default timeline view
    const lines: string[] = [''];
    lines.push(bold(colorize('  Work Experience', 'accent')) + dim(' — Timeline'));
    lines.push('');

    const timeline = renderTimeline(
      experience.map(e => ({
        date: e.period,
        title: `${e.role} @ ${e.company}`,
        description: e.description,
        details: e.highlights,
      }))
    );

    lines.push(timeline);
    lines.push('');

    return [{ type: 'html', content: lines.join('\n') }];
  },
});

// ─── CONTACT ─────────────────────────────────────────────────────────────────

commandRegistry.register({
  name: 'contact',
  description: 'Get my contact information',
  usage: 'contact [--copy]',
  category: 'portfolio',
  flags: [
    { name: 'copy', alias: 'c', description: 'Copy email to clipboard', type: 'boolean' },
  ],
  examples: ['contact', 'contact --copy'],
  aliases: ['email', 'social'],
  hidden: false,
  handler: (parsed: ParsedCommand): CommandOutput[] => {
    const { contact } = portfolioData;
    const doCopy = parsed.flags['copy'] || parsed.flags['c'];

    if (doCopy) {
      try {
        navigator.clipboard.writeText(contact.email);
        return [{ type: 'html', content: `\n  ${colorize('✓', 'success')} Email copied to clipboard: ${colorize(contact.email, 'accent')}\n` }];
      } catch {
        return [{ type: 'html', content: `\n  ${colorize('✗', 'error')} Failed to copy. Email: ${colorize(contact.email, 'accent')}\n` }];
      }
    }

    const lines: string[] = [''];
    lines.push(bold(colorize('  Contact Information', 'accent')));
    lines.push('');

    const boxContent = [
      contact.email ? `${colorize('📧  Email:', 'dim')}     ${link(contact.email, `mailto:${contact.email}`)}` : '',
      `${colorize('🐙  GitHub:', 'dim')}    ${link(contact.github, `https://github.com/${contact.github}`)}`,
      contact.linkedin ? `${colorize('💼  LinkedIn:', 'dim')}  ${link(contact.linkedin, `https://linkedin.com/in/${contact.linkedin}`)}` : '',
      contact.twitter ? `${colorize('🐦  Twitter:', 'dim')}   ${link('@' + contact.twitter, `https://x.com/${contact.twitter}`)}` : '',
    ].filter(Boolean).join('\n');

    lines.push('  ' + renderBox(boxContent, 'Reach Out', 'dim').split('\n').join('\n  '));
    lines.push('');
    lines.push(dim(`  Tip: Drop an issue on a repo or connect via LinkedIn`));
    lines.push('');

    return [{ type: 'html', content: lines.join('\n') }];
  },
});

// ─── GITHUB ──────────────────────────────────────────────────────────────────

commandRegistry.register({
  name: 'github',
  description: 'Fetch live data from my GitHub profile',
  usage: 'github [--repos|--stats|--activity]',
  category: 'data',
  flags: [
    { name: 'repos', alias: 'r', description: 'List repositories (default)', type: 'boolean' },
    { name: 'stats', alias: 's', description: 'Show profile statistics', type: 'boolean' },
    { name: 'activity', alias: 'a', description: 'Show recent activity', type: 'boolean' },
  ],
  examples: ['github', 'github --stats', 'github --repos'],
  aliases: ['gh'],
  hidden: false,
  handler: async (parsed: ParsedCommand): Promise<CommandOutput[]> => {
    const showStats = parsed.flags['stats'] || parsed.flags['s'];
    const showActivity = parsed.flags['activity'] || parsed.flags['a'];
    const username = portfolioData.personal.username;

    try {
      if (showStats) {
        const { data: stats, cached } = await fetchGitHubStats(username);
        const cacheIndicator = cached ? dim(' [cached]') : '';
        const lines: string[] = [''];
        lines.push(bold(colorize('  GitHub Statistics', 'accent')) + cacheIndicator);
        lines.push('');

        const statsBox = [
          `${colorize('Repos:', 'dim')}      ${bold(colorize(String(stats.totalRepos), 'primary'))}`,
          `${colorize('Stars:', 'dim')}      ${bold(colorize('⭐ ' + stats.totalStars, 'warning'))}`,
          `${colorize('Forks:', 'dim')}      ${bold(colorize('🍴 ' + stats.totalForks, 'accent'))}`,
          `${colorize('Followers:', 'dim')}  ${bold(colorize(String(stats.followers), 'secondary'))}`,
          `${colorize('Following:', 'dim')}  ${bold(colorize(String(stats.following), 'secondary'))}`,
          `${colorize('Member for:', 'dim')} ${stats.accountAge}`,
        ].join('\n');

        lines.push('  ' + renderBox(statsBox, `@${username}`, 'dim').split('\n').join('\n  '));
        lines.push('');

        if (stats.topLanguages.length > 0) {
          lines.push(bold(colorize('  Top Languages', 'accent')));
          lines.push('');
          lines.push(
            renderBarChart(
              stats.topLanguages.slice(0, 8).map(l => ({
                label: l.language,
                value: l.percentage,
                color: l.color,
              })),
              { maxWidth: 25, showPercentage: true }
            )
          );
          lines.push('');
        }

        return [{ type: 'html', content: lines.join('\n') }];
      }

      if (showActivity) {
        const { data: repos, cached } = await fetchRepos(username, 'pushed');
        const cacheIndicator = cached ? dim(' [cached]') : '';
        const recentRepos = repos.slice(0, 10);
        const lines: string[] = [''];
        lines.push(bold(colorize('  Recent Activity', 'accent')) + cacheIndicator);
        lines.push('');

        recentRepos.forEach(repo => {
          const date = new Date(repo.pushed_at);
          const ago = getTimeAgo(date);
          const name = colorize(repo.name.padEnd(24), 'primary');
          const lang = repo.language ? colorize(repo.language, 'secondary') : dim('n/a');
          lines.push(`  ${name} ${dim(ago.padEnd(14))} ${lang}`);
        });

        lines.push('');
        return [{ type: 'html', content: lines.join('\n') }];
      }

      // Default: repos
      const { data: repos, cached } = await fetchRepos(username, 'stars');
      const cacheIndicator = cached ? dim(' [cached]') : '';
      const lines: string[] = [''];
      lines.push(bold(colorize('  GitHub Repositories', 'accent')) + cacheIndicator);
      lines.push('');

      const headers = ['Repository', '⭐', '🍴', 'Language'];
      const rows = repos.slice(0, 15).map(r => [
        colorize(r.name, 'primary'),
        String(r.stargazers_count),
        String(r.forks_count),
        r.language ? colorize(r.language, 'secondary') : dim('—'),
      ]);

      lines.push('  ' + renderTable(headers, rows, { headerColor: 'accent' }).split('\n').join('\n  '));
      lines.push('');
      lines.push(dim(`  Showing top ${Math.min(15, repos.length)} of ${repos.length} public repositories`));
      lines.push(dim(`  Use 'github --stats' for profile statistics`));
      lines.push('');

      return [{ type: 'html', content: lines.join('\n') }];
    } catch (err) {
      const apiErr = err as GitHubAPIError;
      const message = formatRateLimitError(apiErr);
      return [
        { type: 'error', content: `GitHub API Error: ${message}` },
        { type: 'html', content: dim('  Using cached data if available. Try again later.') },
      ];
    }
  },
});

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

// ─── NEOFETCH ────────────────────────────────────────────────────────────────

commandRegistry.register({
  name: 'neofetch',
  description: 'Display system info in the style of neofetch',
  usage: 'neofetch',
  category: 'system',
  flags: [],
  examples: ['neofetch'],
  aliases: ['fetch', 'sysinfo'],
  hidden: false,
  handler: (): CommandOutput[] => {
    const { personal } = portfolioData;

    const logo = [
      colorize('  ████████╗██╗   ██╗', 'accent'),
      colorize('  ╚══██╔══╝██║   ██║', 'accent'),
      colorize('     ██║   ██║   ██║', 'accent'),
      colorize('     ██║   ╚██╗ ██╔╝', 'accent'),
      colorize('     ██║    ╚████╔╝ ', 'accent'),
      colorize('     ╚═╝     ╚═══╝  ', 'accent'),
    ];

    const info = [
      `${bold(colorize(personal.name, 'primary'))}${dim('@')}${colorize('terminalverse', 'accent')}`,
      hr('─', 35),
      `${colorize('OS:', 'accent')}        TerminalVerse v1.0`,
      `${colorize('Shell:', 'accent')}     TVShell 1.0 (interactive)`,
      `${colorize('Title:', 'accent')}     ${personal.title}`,
      `${colorize('Location:', 'accent')}  ${personal.location}`,
      `${colorize('Theme:', 'accent')}     Cyberpunk (default)`,
      `${colorize('Terminal:', 'accent')}  Browser-based CLI`,
      `${colorize('Uptime:', 'accent')}    Since you got here`,
      '',
      `${colorize('●', '#ff0040')} ${colorize('●', '#ffaa00')} ${colorize('●', '#00ff41')} ${colorize('●', '#00ffff')} ${colorize('●', '#ff00ff')} ${colorize('●', '#ffffff')} ${colorize('●', '#888888')}`,
    ];

    const maxLogo = logo.length;
    const maxInfo = info.length;
    const maxLines = Math.max(maxLogo, maxInfo);

    const lines: string[] = [''];
    for (let i = 0; i < maxLines; i++) {
      const logoLine = i < maxLogo ? logo[i] : ' '.repeat(22);
      const infoLine = i < maxInfo ? info[i] : '';
      lines.push(`${logoLine}   ${infoLine}`);
    }
    lines.push('');

    return [{ type: 'html', content: lines.join('\n') }];
  },
});

// ─── THEME ───────────────────────────────────────────────────────────────────

commandRegistry.register({
  name: 'theme',
  description: 'Switch between visual themes',
  usage: 'theme [--list|--set <name>]',
  category: 'system',
  flags: [
    { name: 'list', alias: 'l', description: 'List available themes', type: 'boolean' },
    { name: 'set', alias: 's', description: 'Set active theme', type: 'string' },
  ],
  examples: ['theme --list', 'theme --set vintage', 'theme --set cyberpunk'],
  aliases: [],
  hidden: false,
  handler: (parsed: ParsedCommand): CommandOutput[] => {
    const setTheme = parsed.flags['set'] || parsed.flags['s'];

    if (typeof setTheme === 'string') {
      const validThemes = ['cyberpunk', 'vintage', 'minimal'];
      if (!validThemes.includes(setTheme.toLowerCase())) {
        return [{
          type: 'error',
          content: `Unknown theme: "${setTheme}". Available: ${validThemes.join(', ')}`,
        }];
      }

      // Theme switching is handled by the Terminal component which reads from the store
      return [{
        type: 'system',
        content: `__THEME_SWITCH__:${setTheme.toLowerCase()}`,
      }];
    }

    // List themes
    const lines: string[] = [''];
    lines.push(bold(colorize('  Available Themes', 'accent')));
    lines.push('');
    lines.push(`  ${colorize('cyberpunk', 'primary')}   ${dim('—')} Matrix green, neon magenta, scanlines, CRT glow`);
    lines.push(`  ${colorize('vintage', 'primary')}     ${dim('—')} Game Boy green palette, retro pixelated feel`);
    lines.push(`  ${colorize('minimal', 'primary')}     ${dim('—')} Clean grayscale, no effects, maximum readability`);
    lines.push('');
    lines.push(dim(`  Use 'theme --set <name>' to switch`));
    lines.push('');

    return [{ type: 'html', content: lines.join('\n') }];
  },
});

// ─── CLEAR ───────────────────────────────────────────────────────────────────

commandRegistry.register({
  name: 'clear',
  description: 'Clear the terminal screen',
  usage: 'clear',
  category: 'system',
  flags: [],
  examples: ['clear'],
  aliases: ['cls', 'reset'],
  hidden: false,
  handler: (): CommandOutput[] => {
    return [{ type: 'system', content: '__CLEAR__' }];
  },
});

// ─── EASTER EGGS ─────────────────────────────────────────────────────────────

commandRegistry.register({
  name: 'sudo',
  description: '',
  usage: 'sudo',
  category: 'hidden',
  flags: [],
  examples: [],
  aliases: [],
  hidden: true,
  handler: (): CommandOutput[] => {
    return [{
      type: 'html',
      content: `\n  ${colorize('⚠️  Nice try, but you don\'t have root here.', 'warning')}\n  ${dim('This is a portfolio, not a production server 😉')}\n`,
    }];
  },
});

commandRegistry.register({
  name: 'rm',
  description: '',
  usage: 'rm',
  category: 'hidden',
  flags: [],
  examples: [],
  aliases: [],
  hidden: true,
  handler: (parsed: ParsedCommand): CommandOutput[] => {
    const hasRfSlash = parsed.args.some(a => a === '-rf' || a === '/') || parsed.raw.includes('-rf');
    if (hasRfSlash) {
      return [{
        type: 'html',
        content: `\n  ${colorize('💀  rm -rf / ?!', 'error')} ${dim('Deleting portfolio...')}\n  ${dim('Just kidding. Everything is still here.')}\n  ${colorize('Pro tip: Please don\'t do this on real servers.', 'warning')}\n`,
      }];
    }
    return [{ type: 'error', content: `rm: cannot remove: This is a portfolio, not a filesystem` }];
  },
});

commandRegistry.register({
  name: 'hack',
  description: '',
  usage: 'hack',
  category: 'hidden',
  flags: [],
  examples: [],
  aliases: ['hax'],
  hidden: true,
  handler: (): CommandOutput[] => {
    const lines = [
      '',
      colorize('  ██░░██░░██░░██░░██░░██░░██░░██░░██', 'primary'),
      `  ${colorize('INITIATING HACK SEQUENCE...', 'primary')}`,
      `  ${colorize('[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%', 'primary')}`,
      '',
      `  ${colorize('ACCESS GRANTED', 'success')}`,
      `  ${dim('Just kidding. But your curiosity is noted. 👀')}`,
      `  ${dim('Try exploring more commands — some are better hidden than others.')}`,
      '',
    ];
    return [{ type: 'html', content: lines.join('\n') }];
  },
});

commandRegistry.register({
  name: 'matrix',
  description: '',
  usage: 'matrix',
  category: 'hidden',
  flags: [],
  examples: [],
  aliases: [],
  hidden: true,
  handler: (): CommandOutput[] => {
    const matrixChars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ012345789Z:.\"=*+-<>¦|╌╍';
    const lines: string[] = [''];

    for (let row = 0; row < 12; row++) {
      let line = '  ';
      for (let col = 0; col < 60; col++) {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        const brightness = Math.random();
        if (brightness > 0.8) {
          line += colorize(char, '#00ff41');
        } else if (brightness > 0.4) {
          line += colorize(char, '#006618');
        } else {
          line += colorize(char, '#003308');
        }
      }
      lines.push(line);
    }

    lines.push('');
    lines.push(`  ${dim('Wake up, Neo...')}`);
    lines.push(`  ${dim('The Matrix has you.')}`);
    lines.push('');

    return [{ type: 'html', content: lines.join('\n') }];
  },
});

commandRegistry.register({
  name: 'exit',
  description: '',
  usage: 'exit',
  category: 'hidden',
  flags: [],
  examples: [],
  aliases: ['quit', 'logout'],
  hidden: true,
  handler: (): CommandOutput[] => {
    return [{
      type: 'html',
      content: `\n  ${colorize('There is no escape.', 'warning')} ${dim('You\'re trapped in the terminal forever.')}\n  ${dim('(But seriously, thanks for visiting! Feel free to explore more.)')}\n`,
    }];
  },
});

commandRegistry.register({
  name: 'hello',
  description: '',
  usage: 'hello',
  category: 'hidden',
  flags: [],
  examples: [],
  aliases: ['hi', 'hey', 'sup'],
  hidden: true,
  handler: (): CommandOutput[] => {
    const greetings = [
      `Hey there! 👋 Welcome to my little corner of the internet.`,
      `Hello, world! Oh wait, that's my line. Welcome!`,
      `Greetings, human. I've been expecting you. 🤖`,
      `Hi! You found the secret greeting command. Gold star for you! ⭐`,
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    return [{ type: 'html', content: `\n  ${colorize(greeting, 'accent')}\n` }];
  },
});

commandRegistry.register({
  name: 'date',
  description: '',
  usage: 'date',
  category: 'hidden',
  flags: [],
  examples: [],
  aliases: ['time', 'now'],
  hidden: true,
  handler: (): CommandOutput[] => {
    const now = new Date();
    return [{
      type: 'html',
      content: `\n  ${colorize(now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      }), 'primary')}\n`,
    }];
  },
});

// ─── SNAKE GAME ──────────────────────────────────────────────────────────────

commandRegistry.register({
  name: 'snake',
  description: 'Play the classic Snake game in the terminal',
  usage: 'snake',
  category: 'game',
  flags: [],
  examples: ['snake'],
  aliases: [],
  hidden: false,
  handler: (): CommandOutput[] => {
    return [{ type: 'system', content: '__GAME_SNAKE__' }];
  },
});

// Export for initialization
export function initializeCommands(): void {
  // Commands are registered on import via the register() calls above.
  // This function exists to ensure the module is imported.
}
