// TerminalVerse — GitHub API Client

import type { GitHubUser, GitHubRepo, GitHubStats, LanguageStat, CacheEntry, GitHubAPIError } from '../types/github';

const GITHUB_API = 'https://api.github.com';
const DEFAULT_USERNAME = 'ayush-that';

// ─── Cache Helpers ───────────────────────────────────────────────────────────

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`tv_cache_${key}`);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const age = Date.now() - entry.timestamp;

    if (age > entry.ttl) {
      localStorage.removeItem(`tv_cache_${key}`);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };
    localStorage.setItem(`tv_cache_${key}`, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

function isCacheStale(key: string): boolean {
  try {
    const raw = localStorage.getItem(`tv_cache_${key}`);
    if (!raw) return true;
    const entry = JSON.parse(raw);
    return Date.now() - entry.timestamp > entry.ttl * 0.8;
  } catch {
    return true;
  }
}

// ─── API Fetcher ─────────────────────────────────────────────────────────────

async function fetchWithRetry(
  url: string,
  retries: number = 3,
  backoff: number = 1000
): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (response.status === 403) {
        const remaining = response.headers.get('X-RateLimit-Remaining');
        const resetTime = response.headers.get('X-RateLimit-Reset');

        if (remaining === '0') {
          const error: GitHubAPIError = {
            message: 'GitHub API rate limit exceeded',
            statusCode: 403,
            isRateLimit: true,
            resetTime: resetTime ? parseInt(resetTime) * 1000 : undefined,
          };
          throw error;
        }
      }

      if (!response.ok) {
        if (attempt < retries - 1) {
          await new Promise(r => setTimeout(r, backoff * Math.pow(2, attempt)));
          continue;
        }
        const error: GitHubAPIError = {
          message: `GitHub API error: ${response.status} ${response.statusText}`,
          statusCode: response.status,
          isRateLimit: false,
        };
        throw error;
      }

      return response;
    } catch (err) {
      if ((err as GitHubAPIError).isRateLimit !== undefined) throw err;
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, backoff * Math.pow(2, attempt)));
        continue;
      }
      throw {
        message: 'Network error: Unable to reach GitHub API',
        statusCode: 0,
        isRateLimit: false,
      } as GitHubAPIError;
    }
  }

  throw {
    message: 'Max retries exceeded',
    statusCode: 0,
    isRateLimit: false,
  } as GitHubAPIError;
}

// ─── Public API ──────────────────────────────────────────────────────────────

const CACHE_TTL_REPOS = 60 * 60 * 1000; // 1 hour
const CACHE_TTL_USER = 60 * 60 * 1000;  // 1 hour

export async function fetchUser(username: string = DEFAULT_USERNAME): Promise<{ data: GitHubUser; cached: boolean }> {
  const cacheKey = `user_${username}`;
  const cached = getCached<GitHubUser>(cacheKey);

  if (cached && !isCacheStale(cacheKey)) {
    return { data: cached, cached: true };
  }

  try {
    const response = await fetchWithRetry(`${GITHUB_API}/users/${username}`);
    const data: GitHubUser = await response.json();
    setCache(cacheKey, data, CACHE_TTL_USER);
    return { data, cached: false };
  } catch (err) {
    if (cached) return { data: cached, cached: true };
    throw err;
  }
}

export async function fetchRepos(
  username: string = DEFAULT_USERNAME,
  sort: string = 'updated',
  perPage: number = 100
): Promise<{ data: GitHubRepo[]; cached: boolean }> {
  const cacheKey = `repos_${username}_${sort}`;
  const cached = getCached<GitHubRepo[]>(cacheKey);

  if (cached && !isCacheStale(cacheKey)) {
    return { data: cached, cached: true };
  }

  try {
    const response = await fetchWithRetry(
      `${GITHUB_API}/users/${username}/repos?sort=${sort}&per_page=${perPage}&type=owner`
    );
    const data: GitHubRepo[] = await response.json();
    setCache(cacheKey, data, CACHE_TTL_REPOS);
    return { data, cached: false };
  } catch (err) {
    if (cached) return { data: cached, cached: true };
    throw err;
  }
}

// Language color map (top languages)
const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Dart: '#00B4AB',
  Vue: '#41b883',
};

export function calculateLanguageStats(repos: GitHubRepo[]): LanguageStat[] {
  const langCount: Record<string, number> = {};
  let total = 0;

  repos.forEach(repo => {
    if (repo.language && !repo.fork) {
      langCount[repo.language] = (langCount[repo.language] || 0) + 1;
      total++;
    }
  });

  return Object.entries(langCount)
    .map(([language, count]) => ({
      language,
      count,
      percentage: Math.round((count / total) * 100),
      color: LANG_COLORS[language] || 'var(--tv-accent)',
    }))
    .sort((a, b) => b.count - a.count);
}

export async function fetchGitHubStats(username: string = DEFAULT_USERNAME): Promise<{ data: GitHubStats; cached: boolean }> {
  const [userResult, reposResult] = await Promise.all([
    fetchUser(username),
    fetchRepos(username),
  ]);

  const user = userResult.data;
  const repos = reposResult.data;
  const cached = userResult.cached && reposResult.cached;

  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);

  const createdDate = new Date(user.created_at);
  const now = new Date();
  const years = Math.floor((now.getTime() - createdDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  const stats: GitHubStats = {
    totalRepos: user.public_repos,
    totalStars,
    totalForks,
    followers: user.followers,
    following: user.following,
    topLanguages: calculateLanguageStats(repos),
    accountAge: `${years} years`,
  };

  return { data: stats, cached };
}

export function formatRateLimitError(error: GitHubAPIError): string {
  if (error.isRateLimit && error.resetTime) {
    const resetDate = new Date(error.resetTime);
    const minutes = Math.ceil((resetDate.getTime() - Date.now()) / 60000);
    return `Rate limit exceeded. Resets in ${minutes} minute${minutes !== 1 ? 's' : ''}.`;
  }
  return error.message;
}
