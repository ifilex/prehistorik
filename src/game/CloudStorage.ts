/**
 * Cloud and Local Storage Manager for Prehistorik 1991.
 * Persists level progress, score, lives, and cognitive hand-eye coordination benchmarks.
 */

import { SavedGameProgress } from '../types.ts';

const SAVE_KEY = 'prehistorik_1991_save_data';

export class CloudStorage {
  public static saveProgress(data: SavedGameProgress): boolean {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(SAVE_KEY, serialized);

      // Also attempt background sync to cloud / API if endpoint available
      if (typeof window !== 'undefined' && 'fetch' in window) {
        fetch('/api/save-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: serialized
        }).catch(() => {
          // Graceful fallback to client persistence
        });
      }

      return true;
    } catch (e) {
      console.warn('Failed to save progress to storage:', e);
      return false;
    }
  }

  public static loadProgress(): SavedGameProgress | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SavedGameProgress;
    } catch (e) {
      console.warn('Failed to load progress:', e);
      return null;
    }
  }

  public static clearProgress() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      console.warn('Failed to clear progress:', e);
    }
  }
}
