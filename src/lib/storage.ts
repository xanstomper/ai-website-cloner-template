// Client-only localStorage wrapper for Zynema persistence (My List, Continue Watching)
"use client";

export interface WatchlistItem {
  id: string;
  slug: string;
  tmdbId?: number;
  mediaType?: "tv" | "movie";
  title: string;
  poster: string;
  backdrop?: string;
  score?: number;
  format?: string;
  addedAt: number;
}

export interface ProgressItem {
  id: string;
  tmdbId?: number;
  mediaType?: "tv" | "movie";
  title: string;
  poster: string;
  backdrop?: string;
  season: string;
  episode: string;
  epTitle: string;
  duration: number; // seconds
  watched: number;  // seconds watched
  updatedAt: number;
}

function get<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem("zy_" + key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}

function set<T>(key: string, val: T): void {
  try { localStorage.setItem("zy_" + key, JSON.stringify(val)); } catch {}
}

// --- Watchlist ---
export function getWatchlist(): WatchlistItem[] {
  return get("watchlist", []);
}
export function addToWatchlist(item: WatchlistItem): void {
  const list = getWatchlist();
  if (!list.some((i) => i.id === item.id)) {
    list.unshift({ ...item, addedAt: Date.now() });
    set("watchlist", list);
  }
}
export function removeFromWatchlist(id: string): void {
  set("watchlist", getWatchlist().filter((i) => i.id !== id));
}
export function inWatchlist(id: string): boolean {
  return getWatchlist().some((i) => i.id === id);
}
export function toggleWatchlist(item: WatchlistItem): boolean {
  if (inWatchlist(item.id)) { removeFromWatchlist(item.id); return false; }
  else { addToWatchlist(item); return true; }
}

// --- Progress / Continue Watching ---
export function getProgressList(): ProgressItem[] {
  return Object.values(get("progress", {} as Record<string, ProgressItem>));
}
export function saveProgress(p: ProgressItem): void {
  const all = get("progress", {} as Record<string, ProgressItem>);
  const key = (p.mediaType || "movie") + ":" + (p.tmdbId || p.id);
  all[key] = { ...p, updatedAt: Date.now() };
  set("progress", all);
}
export function removeProgress(id: string, type?: string): void {
  const all = get("progress", {} as Record<string, ProgressItem>);
  const key = (type || "movie") + ":" + id;
  delete all[key];
  set("progress", all);
}
