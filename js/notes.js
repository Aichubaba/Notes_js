import {
  createNote,
  updateNote,
  deleteNote,
} from "./api.js";

import {
  generateChecklistItems,
  fileToBase64,
} from "./helpers.js";

import { loadNotes } from "./app.js";

export async function createNewNote() {
  const title =
    document.querySelector(
      '[name="title"]'
    ).value;

  const description =
    document.querySelector(
      '[name="description"]'
    ).value;

  const type =
    document.querySelector(
      '[name="type"]'
    ).value;

  const important =
    document.querySelector(
      "#important"
    ).checked;

  const file =
    document.querySelector(
      "#imageInput"
    ).files[0];

  let image = "";

  if (file) {
    image =
      await fileToBase64(file);
  }

  const note = {
    title,
    description,
    type,
    important,
    image,
    items:
      type === "checklist"
        ? generateChecklistItems()
        : [],
  };

  await createNote(note);

  await loadNotes();
}

export async function editExistingNote(
  id
) {
  const title =
    document.querySelector(
      '[name="title"]'
    ).value;

  const description =
    document.querySelector(
      '[name="description"]'
    ).value;

  const important =
    document.querySelector(
      "#important"
    ).checked;

  await updateNote(id, {
    title,
    description,
    important,
  });

  await loadNotes();
}

export async function removeNote(
  id
) {
  await deleteNote(id);

  await loadNotes();
}