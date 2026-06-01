import {
  getNotes,
} from "./api.js";

import {
  renderNotes,
} from "./render.js";

import {
  initModal,
  openCreateModal,
  openEditModal,
} from "./modal.js";

import {
  removeNote,
} from "./notes.js";

import {
  initSearch,
} from "./search.js";

export async function loadNotes() {
  const notes =
    await getNotes();

  renderNotes(notes);
}

async function init() {
  await loadNotes();

  initModal();

  initSearch();

  bindEvents();
}

function bindEvents() {
  document
    .querySelector("#addBtn")
    .addEventListener(
      "click",
      openCreateModal
    );

  document.addEventListener(
    "click",
    async (e) => {
      const editBtn =
        e.target.closest(
          ".edit-btn"
        );

      const deleteBtn =
        e.target.closest(
          ".delete-btn"
        );

      if (editBtn) {
        const id =
          editBtn.dataset.id;

        await openEditModal(id);
      }

      if (deleteBtn) {
        const id =
          deleteBtn.dataset.id;

        const ok = confirm(
          "Удалить заметку?"
        );

        if (!ok) return;

        await removeNote(id);
      }
    }
  );
}

init();