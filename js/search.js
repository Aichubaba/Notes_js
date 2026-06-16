import { getNotes, getCachedNotes } from "./api.js";
import { renderNotes } from "./render.js";

let abortController = null;

export function initSearch() {
  const search = document.querySelector("#search");

  search.addEventListener("input", onSearch);
}

function matchesQuery(note, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  if (note.title?.toLowerCase().includes(q)) return true;
  if (note.description?.toLowerCase().includes(q)) return true;
  if (Array.isArray(note.items)) {
    return note.items.some(item =>
      item.text?.toLowerCase().includes(q)
    );
  }
  return false;
}

let searchTimer = null;

function onSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    if (abortController) abortController.abort();
    abortController = new AbortController();

    let notes = getCachedNotes();
    if (notes.length === 0) {
      try {
        notes = await getNotes({ force: true, signal: abortController.signal });
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    const value = document.querySelector("#search").value;
    const filtered = getCachedNotes().filter(note => matchesQuery(note, value));
    renderNotes(filtered);
  }, 300);
}