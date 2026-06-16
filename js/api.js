import { API_URL } from "./constants.js";
import { parseId, normalizeNote } from './helpers.js';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

export async function getNotes() {
  try {
    return await fetchJson(API_URL);
  } catch (err) {
    // fallback: read local db file so UI still renders when json-server is down
    try {
      const local = await fetchJson("/db/db.json");
      return local.notes || [];
    } catch (err2) {
      console.error("Failed to load notes from API and local db:", err, err2);
      return [];
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
  const response = await fetch(
    API_URL,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(note),
    }
  );

  return response.json();
}

export async function updateNote(
  id,
  note
) {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(note),
    }
  );

  return response.json();
}

export async function deleteNote(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function updateChecklistItem(noteId, itemId, completed) {
  const noteRaw = await getNote(noteId);
  const note = normalizeNote(noteRaw);
  const itemIdNum = parseId(itemId);
  const items = (note.items || []).map(item =>
    item.id === itemIdNum ? { ...item, completed } : item
  );
  try {
    return await updateNote(noteId, { items });
  } catch (err) {
    // Если сервер недоступен — сохраните операцию в localStorage для позже
    try {
      const key = 'pendingUpdates';
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      list.push({ type: 'updateChecklistItem', noteId: parseId(noteId), itemId: parseId(itemId), completed: Boolean(completed), at: Date.now() });
      localStorage.setItem(key, JSON.stringify(list));
    } catch (err2) {
      console.error('Failed to queue pending update', err2);
    }
    // Вернуть предполагаемый результат, чтобы UI продолжил работать
    return { id: noteId, items };
  }
}