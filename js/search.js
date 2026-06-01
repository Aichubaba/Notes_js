import { getNotes } from "./api.js";

import { renderNotes } from "./render.js";

export function initSearch() {
  const search =
    document.querySelector(
      "#search"
    );

  search.addEventListener(
    "input",
    async (e) => {
      const value =
        e.target.value.toLowerCase();

      const notes =
        await getNotes();

      const filtered =
        notes.filter((note) => {
          return (
            note.title
              .toLowerCase()
              .includes(value) ||
            note.description
              ?.toLowerCase()
              .includes(value)
          );
        });

      renderNotes(filtered);
    }
  );
}