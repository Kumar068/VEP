/**
 * reelsService.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Unified API service for Reels management.
 * Supports both live Express API (local development) and static/client-side fallback
 * (Netlify / static hosting using /data/reels.json + browser IndexedDB & localStorage).
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { ReelData } from '../types';

const DB_NAME = 'vep_reels_db';
const DB_VERSION = 1;
const REELS_STORE = 'reels';
const BLOBS_STORE = 'blobs';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(REELS_STORE)) {
        db.createObjectStore(REELS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(BLOBS_STORE)) {
        db.createObjectStore(BLOBS_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getStoredBlob(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(BLOBS_STORE, 'readonly');
      const req = tx.objectStore(BLOBS_STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function getLocalCustomReels(): Promise<ReelData[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(REELS_STORE, 'readonly');
      const store = tx.objectStore(REELS_STORE);
      const req = store.getAll();
      req.onsuccess = async () => {
        const reels: ReelData[] = req.result || [];
        for (const r of reels) {
          if (r.filename && r.filename.startsWith('idb_blob_')) {
            const blob = await getStoredBlob(r.filename);
            if (blob) {
              r.videoSrc = URL.createObjectURL(blob);
            }
          }
        }
        resolve(reels);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

async function saveLocalCustomReel(reel: ReelData, videoBlob?: Blob): Promise<void> {
  try {
    const db = await openDB();
    if (videoBlob && reel.filename) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(BLOBS_STORE, 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.objectStore(BLOBS_STORE).put(videoBlob, reel.filename);
      });
    }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(REELS_STORE, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(REELS_STORE).put(reel);
    });
  } catch (e) {
    console.warn('IndexedDB save failed:', e);
  }
}

async function deleteLocalCustomReel(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(REELS_STORE, 'readwrite');
    tx.objectStore(REELS_STORE).delete(id);
  } catch { /* noop */ }
}

function getDeletedReelIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem('vep_deleted_reels') || '[]');
  } catch {
    return [];
  }
}

function markReelDeleted(id: string) {
  try {
    const deleted = getDeletedReelIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem('vep_deleted_reels', JSON.stringify(deleted));
    }
  } catch { /* noop */ }
}

function getLocalOverrides(): Record<string, Partial<ReelData>> {
  try {
    return JSON.parse(localStorage.getItem('vep_reel_overrides') || '{}');
  } catch {
    return {};
  }
}

function setLocalOverride(id: string, updates: Partial<ReelData>) {
  try {
    const overrides = getLocalOverrides();
    overrides[id] = { ...overrides[id], ...updates };
    localStorage.setItem('vep_reel_overrides', JSON.stringify(overrides));
  } catch { /* noop */ }
}

/**
 * Fetch all reels (or visible only).
 * Tries server API first; falls back to static JSON + client IndexedDB if API fails or returns non-JSON.
 */
export async function getReels(includeHidden = false): Promise<ReelData[]> {
  let apiSuccess = false;
  let reels: ReelData[] = [];

  try {
    const endpoint = includeHidden ? '/api/reels/all' : '/api/reels';
    const res = await fetch(endpoint);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      reels = await res.json();
      apiSuccess = true;
    }
  } catch {
    apiSuccess = false;
  }

  if (!apiSuccess) {
    // Static Fallback for Netlify / serverless deployment
    try {
      const res = await fetch('/data/reels.json');
      if (res.ok) {
        reels = await res.json();
      }
    } catch {
      reels = [];
    }

    // Apply local overrides
    const overrides = getLocalOverrides();
    reels = reels.map(r => overrides[r.id] ? { ...r, ...overrides[r.id] } : r);

    // Filter deleted static reels
    const deletedIds = getDeletedReelIds();
    reels = reels.filter(r => !deletedIds.includes(r.id));

    // Append client custom reels from IndexedDB
    const customReels = await getLocalCustomReels();
    const existingIds = new Set(reels.map(r => r.id));
    for (const cr of customReels) {
      if (!existingIds.has(cr.id)) {
        reels.push(cr);
      }
    }

    if (!includeHidden) {
      reels = reels.filter(r => r.visible !== false);
    }
  }

  return reels.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

/**
 * Upload a new reel using multipart FormData.
 * Tries server API first; falls back to browser IndexedDB if on static hosting like Netlify.
 */
export async function uploadReel(
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<ReelData> {
  const file = formData.get('file') as File | null;
  const title = (formData.get('title') as string) || '';
  const category = (formData.get('category') as string) || '';
  const tag = (formData.get('tag') as string) || '';
  const year = (formData.get('year') as string) || new Date().getFullYear().toString();
  const color = (formData.get('color') as string) || '#1152d4';

  if (!title || !file) {
    throw new Error('Title and video file are required.');
  }

  // Attempt server API call first
  try {
    const xhr = new XMLHttpRequest();
    const promise = new Promise<ReelData>((resolve, reject) => {
      xhr.open('POST', '/api/reels');
      if (onProgress) {
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            onProgress(Math.round((ev.loaded / ev.total) * 100));
          }
        };
      }
      xhr.onload = () => {
        const contentType = xhr.getResponseHeader('content-type') || '';
        if (xhr.status === 201 && contentType.includes('application/json')) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(e);
          }
        } else {
          let serverErr = '';
          try {
            serverErr = JSON.parse(xhr.responseText).error;
          } catch { /* noop */ }
          reject(new Error(serverErr || `Server returned ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });

    return await promise;
  } catch (err: any) {
    console.warn('Backend API POST unavailable or failed. Using browser client storage fallback:', err.message);
  }

  // Client-side fallback for Netlify static host
  if (onProgress) onProgress(40);

  const id = crypto.randomUUID();
  const blobKey = `idb_blob_${Date.now()}_${file.name.replace(/[^a-z0-9]/gi, '_')}`;
  const videoSrc = URL.createObjectURL(file);

  const newReel: ReelData = {
    id,
    title: title.trim(),
    category: category.trim(),
    tag: tag.trim().toUpperCase(),
    year,
    color,
    videoSrc,
    filename: blobKey,
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
    visible: true,
  };

  await saveLocalCustomReel(newReel, file);

  if (onProgress) onProgress(100);
  return newReel;
}

/**
 * Update metadata for an existing reel.
 */
export async function updateReel(id: string, updates: Partial<ReelData>): Promise<ReelData> {
  try {
    const res = await fetch(`/api/reels/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch { /* noop */ }

  setLocalOverride(id, updates);

  const customReels = await getLocalCustomReels();
  const custom = customReels.find(r => r.id === id);
  if (custom) {
    const updated = { ...custom, ...updates, updatedAt: new Date().toISOString() };
    await saveLocalCustomReel(updated);
    return updated;
  }

  const staticReels = await getReels(true);
  const found = staticReels.find(r => r.id === id);
  if (!found) throw new Error('Reel not found');
  return { ...found, ...updates, updatedAt: new Date().toISOString() };
}

/**
 * Delete a reel.
 */
export async function deleteReel(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/reels/${id}`, { method: 'DELETE' });
    if (res.ok) return;
  } catch { /* noop */ }

  markReelDeleted(id);
  await deleteLocalCustomReel(id);
}
