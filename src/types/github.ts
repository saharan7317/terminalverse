// TerminalVerse — GitHub API Type Definitions

export interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  location: string | null;
  blog: string | null;
  company: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  topics: string[];
  homepage: string | null;
  archived: boolean;
}

export interface LanguageStat {
  language: string;
  count: number;
  percentage: number;
  color: string;
}

export interface GitHubStats {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  followers: number;
  following: number;
  topLanguages: LanguageStat[];
  accountAge: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface GitHubAPIError {
  message: string;
  statusCode: number;
  isRateLimit: boolean;
  resetTime?: number;
}
