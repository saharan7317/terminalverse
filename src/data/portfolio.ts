// TerminalVerse — Static Portfolio Data

export interface Project {
  id: string;
  name: string;
  description: string;
  tech: string[];
  github?: string;
  demo?: string;
  featured: boolean;
  asciiPreview?: string;
}

export interface Skill {
  name: string;
  level: number; // 1-10
  category: 'frontend' | 'backend' | 'devops' | 'design' | 'other';
  years?: number;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
  highlights: string[];
}

export interface ContactInfo {
  email: string;
  github: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface PersonalInfo {
  name: string;
  title: string;
  bio: string;
  location: string;
  username: string;
  tagline: string;
  whatImUpTo: string[];
  beyondTerminal: string[];
}

export interface PortfolioData {
  personal: PersonalInfo;
  projects: Project[];
  skills: Skill[];
  experience: Experience[];
  contact: ContactInfo;
}

// ─── Portfolio Data ──────────────────────────────────────────────────────────

export const portfolioData: PortfolioData = {
  personal: {
    name: 'Ayush Saharan',
    title: 'Full-Stack Web & Mobile Engineer | Creative Tech Creator',
    bio: 'I am a software developer based in Jaipur, India, specializing in building high-performance, visually engaging digital experiences. I bridge the gap between heavy backend logic and sleek, intuitive user interfaces. My development philosophy centers around gamification and interactive utility—if an application feels static, I find a way to breathe life and responsiveness into it.',
    location: 'Jaipur, India',
    username: 'saharan7317',
    tagline: '"Clean architecture under the hood, striking aesthetics on the surface."',
    whatImUpTo: [
      '👨‍💻 Developing: Advanced web applications using in-browser computer vision and real-time state management.',
      '📱 Architecting: Cross-platform mobile apps driven by relational cloud databases and dynamic user-progression logic.',
      '🛠️ Optimizing: Digital workflows, custom API integrations, and developer automation pipelines.',
      '🎨 Creating: Immersive UI/UX layouts, gaming assets, and regional localization software engines.',
    ],
    beyondTerminal: [
      '🌌 Streaming and designing technical layout mechanics in Minecraft.',
      '📚 Analyzing the complex worldbuilding, power systems, and deep lore of One Piece.',
      '🎧 Locking into a flow state with a modern Punjabi pop playlist running in the background.',
    ],
  },

  projects: [
    {
      id: 'focus-fighter',
      name: 'Focus Fighter',
      description: 'AI-Powered Productivity Monitor — A multi-version web application designed to gamify and protect user wellness during long deep-work sessions. Implements real-time 3D space tracking via the user\'s camera to monitor posture, with a custom interactive sensitivity slider, fluid UI state transitions, and a custom audio soundboard.',
      tech: ['Python', 'Computer Vision', 'JavaScript', 'Web Audio API'],
      github: 'https://github.com/saharan7317/focus-fighter',
      featured: true,
      asciiPreview: `
  ╔══════════════════════════════════╗
  ║  🥊 Focus Fighter               ║
  ║  ├── Posture Tracking: ACTIVE   ║
  ║  ├── Focus Score: 94/100        ║
  ║  └── Session: 2h 15m            ║
  ╚══════════════════════════════════╝`,
    },
    {
      id: 'nakama-track',
      name: 'Nakama Track',
      description: 'RPG-Style Social Anime Tracker — A full-featured mobile ecosystem that transforms standard media tracking into an interactive, community-driven experience. Features a robust state management system, RPG leveling engine, and synchronized "crew" mechanism for real-time friend group tracking.',
      tech: ['Flutter', 'Dart', 'Firebase Auth', 'Firestore'],
      github: 'https://github.com/saharan7317/nakama-track',
      featured: true,
      asciiPreview: `
  ╔══════════════════════════════════╗
  ║  🏴‍☠️ Nakama Track                ║
  ║  ├── Level: 42 Pirate King      ║
  ║  ├── Anime Watched: 156         ║
  ║  └── Crew Members: 8            ║
  ╚══════════════════════════════════╝`,
    },
    {
      id: 'desi-hinglish-pack',
      name: 'Desi Hinglish Pack',
      description: 'Asset Override & Localization Engine — A creative digital passion project focused on software asset manipulation and cultural translation. Developed a comprehensive localization system by overriding native gaming text assets, restructuring language matrices to map traditional strings into regional Hinglish dialects.',
      tech: ['JSON Architecture', 'File Parsing', 'Media Asset Scripting'],
      github: 'https://github.com/saharan7317/desi-hinglish-pack',
      featured: true,
      asciiPreview: `
  ╔══════════════════════════════════╗
  ║  🇮🇳 Desi Hinglish Pack          ║
  ║  ├── Strings Localized: 2,400+  ║
  ║  ├── Audio Overrides: 180+      ║
  ║  └── Lang: EN → Hinglish        ║
  ╚══════════════════════════════════╝`,
    },
    {
      id: 'terminalverse',
      name: 'TerminalVerse',
      description: 'An interactive CLI portfolio that reimagines the developer resume as a retro-futuristic terminal experience. Features command parsing, ASCII art, live GitHub data, mini-games, and multiple visual themes.',
      tech: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Zustand'],
      github: 'https://github.com/saharan7317/terminalverse',
      featured: true,
      asciiPreview: `
  ╔══════════════════════════════════╗
  ║  > TerminalVerse v1.0           ║
  ║  > Type 'help' to begin...      ║
  ║  > █                            ║
  ╚══════════════════════════════════╝`,
    },
  ],

  skills: [
    // Languages
    { name: 'Python', level: 9, category: 'backend', years: 4 },
    { name: 'JavaScript', level: 9, category: 'frontend', years: 4 },
    { name: 'Dart/Flutter', level: 8, category: 'frontend', years: 3 },
    { name: 'Java', level: 7, category: 'backend', years: 3 },
    { name: 'C++', level: 7, category: 'backend', years: 3 },
    { name: 'C', level: 6, category: 'backend', years: 2 },
    { name: 'SQL', level: 7, category: 'backend', years: 3 },
    // Frontend & Mobile
    { name: 'Flutter SDK', level: 8, category: 'frontend', years: 3 },
    { name: 'HTML5/CSS3', level: 9, category: 'frontend', years: 4 },
    { name: 'React', level: 8, category: 'frontend', years: 2 },
    { name: 'TypeScript', level: 7, category: 'frontend', years: 2 },
    { name: 'Responsive UI', level: 9, category: 'design', years: 4 },
    // Backend & Cloud
    { name: 'Firebase', level: 8, category: 'backend', years: 3 },
    { name: 'Node.js', level: 7, category: 'backend', years: 3 },
    { name: 'REST APIs', level: 8, category: 'backend', years: 4 },
    // Automation & Tools
    { name: 'Git/GitHub', level: 9, category: 'devops', years: 4 },
    { name: 'n8n Automation', level: 7, category: 'devops', years: 2 },
    { name: 'Discord API', level: 7, category: 'devops', years: 2 },
    { name: 'Computer Vision', level: 7, category: 'other', years: 2 },
  ],

  experience: [
    {
      company: 'Independent Developer',
      role: 'Full-Stack Web & Mobile Engineer',
      period: '2023 — Present',
      description: 'Building high-performance, visually engaging digital experiences across web and mobile platforms. Specializing in gamification, interactive utility, and bridging heavy backend logic with sleek UIs.',
      highlights: [
        'Developed AI-powered productivity monitor with real-time 3D posture tracking',
        'Architected RPG-style mobile ecosystem with Firebase-backed leveling engine',
        'Created comprehensive localization engine overriding native gaming assets',
        'Built interactive CLI portfolio with retro-futuristic terminal experience',
      ],
    },
    {
      company: 'Open Source & Community',
      role: 'Creative Tech Creator',
      period: '2022 — Present',
      description: 'Contributing to open-source projects and building creative digital tools. Focused on developer automation, workflow optimization, and community-driven experiences.',
      highlights: [
        'Designed custom API integrations and developer automation pipelines',
        'Built Discord bots and community tools with dynamic event handling',
        'Developed n8n workflow automations for digital process optimization',
        'Created gaming asset localization systems for regional communities',
      ],
    },
  ],

  contact: {
    email: '',
    github: 'saharan7317',
    linkedin: 'ayush-saharan-498707361',
    twitter: 'saharan7317',
  },
};
