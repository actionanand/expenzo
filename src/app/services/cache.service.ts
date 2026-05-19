import { Injectable, signal } from '@angular/core';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private readonly STORAGE_PREFIX = 'expenzo_cache_';
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /** Reactive signal for showing offline toast */
  readonly offlineToast = signal(false);

  private readonly memoryCache = new Map<string, CacheEntry<unknown>>();

  /**
   * Get cached data if still valid (within TTL).
   * Returns null if expired or not found.
   */
  get<T>(key: string, ttl = this.DEFAULT_TTL): T | null {
    const entry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (entry && Date.now() - entry.timestamp < ttl) {
      return entry.data;
    }
    return null;
  }

  /** Store data in both memory cache and localStorage for offline. */
  set<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    this.memoryCache.set(key, entry);
    try {
      localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Storage full — silently fail
    }
  }

  /** Get last stored data from localStorage (for offline fallback). */
  getOffline<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_PREFIX + key);
      if (raw) {
        const entry: CacheEntry<T> = JSON.parse(raw);
        return entry.data;
      }
    } catch {
      // Corrupt data — ignore
    }
    return null;
  }

  /** Invalidate memory cache for a key (forces fresh fetch on next load). */
  invalidate(key: string): void {
    this.memoryCache.delete(key);
  }

  /** Show offline toast briefly. */
  showOfflineToast(): void {
    this.offlineToast.set(true);
    setTimeout(() => this.offlineToast.set(false), 3000);
  }
}
