# TerminalVerse 🖥️

> **An interactive CLI portfolio reimagined as a retro-futuristic terminal experience.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-00ff41?style=for-the-badge&logo=vercel)](https://saharan7317.github.io/terminalverse)
[![GitHub](https://img.shields.io/badge/GitHub-saharan7317-181717?style=for-the-badge&logo=github)](https://github.com/saharan7317)

---

## ✨ What Is This?

TerminalVerse transforms the traditional portfolio into a **fully interactive command-line interface** with:

- 🎨 **Retro-futuristic aesthetics** — CRT scanlines, neon glow, blinking cursor
- 🐍 **Playable Snake game** — Right inside the terminal
- 📡 **Live GitHub integration** — Projects auto-sync from your GitHub profile
- 🎭 **3 visual themes** — Cyberpunk, Vintage (Game Boy), Minimal
- 🥚 **Hidden easter eggs** — Try `sudo`, `rm -rf /`, `hack`, `matrix`...
- ⌨️ **Real shell features** — Tab completion, command history, pipes, fuzzy matching

```
  ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗
  ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║
     ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║
     ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║
     ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗
     ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
               ██╗   ██╗███████╗██████╗ ███████╗███████╗
               ██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝
               ██║   ██║█████╗  ██████╔╝███████╗█████╗  
               ╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝  
                ╚████╔╝ ███████╗██║  ██║███████║███████╗
                 ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝
```

---

## 📋 Available Commands

### Portfolio
| Command | Description | Flags |
|---------|-------------|-------|
| `about` | Learn about me — bio, skills, interests | `--ascii` |
| `projects` | Browse projects (auto-syncs with GitHub) | `--list`, `--grid`, `--detail <id>`, `--live` |
| `skills` | View technical skills & proficiencies | `--list`, `--graph`, `--tree` |
| `experience` | View work history & timeline | `--timeline`, `--table` |
| `contact` | Get contact information | `--copy` |

### Data
| Command | Description | Flags |
|---------|-------------|-------|
| `github` | Fetch live GitHub profile data | `--repos`, `--stats`, `--activity` |

### System
| Command | Description | Flags |
|---------|-------------|-------|
| `help` | Show all commands or help for one | `[command]` |
| `neofetch` | Display system info (neofetch style) | — |
| `theme` | Switch visual themes | `--list`, `--set <name>` |
| `clear` | Clear the terminal screen | — |

### Games
| Command | Description |
|---------|-------------|
| `snake` | Play the classic Snake game in ASCII |

### Aliases
| Alias | Maps To |
|-------|---------|
| `ls`, `proj` | `projects` |
| `whoami`, `me` | `about` |
| `tech`, `stack` | `skills` |
| `exp`, `work` | `experience` |
| `email`, `social` | `contact` |
| `gh` | `github` |
| `cls`, `reset` | `clear` |
| `?`, `h` | `help` |
| `fetch`, `sysinfo` | `neofetch` |

### Easter Eggs 🥚
There are **hidden commands** to discover! Try typing things like `sudo`, `rm -rf /`, `hack`, `matrix`, `hello`, `exit`, `date`...

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS v4** | Utility-first styling |
| **Zustand** | State management |
| **GitHub REST API** | Live data integration |

---

## 🎨 Themes

Switch themes with `theme --set <name>`:

- **Cyberpunk** — Matrix green, neon magenta, CRT scanlines & glow effects
- **Vintage** — Game Boy green palette, Press Start 2P pixel font
- **Minimal** — Clean grayscale, no effects, maximum readability

---

## 🚀 Development

### Prerequisites
- Node.js 18+
- npm 9+

### Setup
```bash
git clone https://github.com/saharan7317/terminalverse.git
cd terminalverse
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Deploy to GitHub Pages
```bash
npm run deploy
```

---

## 📦 Bundle Size

| Asset | Size (gzipped) |
|-------|---------------|
| JavaScript | ~76 KB |
| CSS | ~3.4 KB |
| **Total** | **~80 KB** |

---

## 📁 Project Structure

```
terminalverse/
├── src/
│   ├── components/
│   │   ├── Terminal/
│   │   │   ├── Terminal.tsx       # Main orchestrator
│   │   │   ├── TerminalInput.tsx  # Command input with cursor
│   │   │   ├── TerminalOutput.tsx # Output renderer
│   │   │   └── BootSequence.tsx   # Boot animation & header
│   │   └── Games/
│   │       └── SnakeGame.tsx      # Playable Snake game
│   ├── data/
│   │   ├── commands.ts            # All command handlers
│   │   └── portfolio.ts           # Portfolio data & types
│   ├── stores/
│   │   └── terminalStore.ts       # Zustand global state
│   ├── styles/
│   │   └── themes.ts              # Theme definitions
│   ├── types/
│   │   ├── commands.ts            # Type interfaces
│   │   └── github.ts              # GitHub API types
│   ├── utils/
│   │   ├── ansiColors.ts          # Color/formatting utilities
│   │   ├── asciiRenderer.ts       # ASCII tables, charts, trees
│   │   ├── commandRegistry.ts     # Command parser & registry
│   │   └── githubAPI.ts           # GitHub API client
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                  # Global styles & CRT effects
├── index.html
├── vite.config.ts
├── package.json
├── README.md
└── LICENSE
```

---

## 👤 Author

**Ayush Saharan**
- GitHub: [@saharan7317](https://github.com/saharan7317)
- LinkedIn: [ayush-saharan-498707361](https://linkedin.com/in/ayush-saharan-498707361)
- Twitter/X: [@saharan7317](https://x.com/saharan7317)

---

## 📄 License

**All Rights Reserved.** See [LICENSE](./LICENSE) for details.

This project is proprietary software. You may not copy, modify, distribute, or use this code without explicit written permission from the author.
