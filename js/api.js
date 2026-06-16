import { API_URL } from "./constants.js";
import { parseId, normalizeNote } from './helpers.js';

let notesCache = null;

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

export function getCachedNotes() {
  return notesCache || [];
}

export function clearNotesCache() {
  notesCache = null;
}

export async function getNotes({ force, signal } = {}) {
  if (!force && notesCache) return notesCache;
  try {
    notesCache = await fetchJson(API_URL, { signal });
    return notesCache;
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    try {
      const local = await fetchJson("/db/db.json");
      notesCache = local.notes || [];
      return notesCache;
    } catch (err2) {
      console.error("Failed to load notes from API and local db:", err, err2);
      notesCache = [];
      return notesCache;
    }
  }
}

export async function getNote(id) {
  try {
    return await fetchJson(`${API_URL}/${id}`);
  } catch (err) {
    // fallback: read local db file and find note
    try {
      const local = await fetchJson("/db/db.json");
      const notes = local.notes || [];
      const idNum = parseId(id);
      return notes.find(n => n.id === idNum || String(n.id) === String(id));
    } catch (err2) {
      console.error("Failed to load note:", err, err2);
      throw err;
    }
  }
}

export async function createNote(note) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!response.ok) throw new Error(`Create failed: ${response.status}`);
  return response.json();
}

export async function updateNote(id, note) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!response.ok) throw new Error(`Update failed: ${response.status}`);
  return response.json();
}

export async function deleteNote(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
}

export async function updateChecklistItem(noteId, itemId, completed) {
  try {
    const noteRaw = await getNote(noteId);
    const note = normalizeNote(noteRaw);
    const itemIdNum = parseId(itemId);
    const items = (note.items || []).map(item =>
      item.id === itemIdNum ? { ...item, completed } : item
    );
    return await updateNote(noteId, { items });
  } catch (err) {
    try {
      const key = 'pendingUpdates';
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      list.push({ type: 'updateChecklistItem', noteId: parseId(noteId), itemId: parseId(itemId), completed: Boolean(completed), at: Date.now() });
      localStorage.setItem(key, JSON.stringify(list));
    } catch (err2) {
      console.error('Failed to queue pending update', err2);
    }
    return { id: noteId, items: [] };
  }
}