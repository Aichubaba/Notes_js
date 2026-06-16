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
  const title = document.querySelector('[name="title"]').value;
  const description = document.querySelector('[name="description"]').value;
  const type = document.querySelector('[name="type"]').value;
  const icon = document.querySelector('[name="icon"]')?.value || 'bookmark.png';
  const important = document.querySelector('#important')?.checked || false;

  const note = {
    title,
    description,
    type,
    icon,
    important,
  };

  if (type === 'image') {
    const previewImg = document.querySelector('.preview-image');
    if (previewImg && previewImg.src) {
      note.image = previewImg.src;
    } else {
      const fileInput = document.querySelector('#imageInput');
      if (fileInput && fileInput.files && fileInput.files[0]) {
        note.image = await fileToBase64(fileInput.files[0]);
      }
    }
  }

  if (type === 'checklist') {
    note.items = generateChecklistItems();
  }

  await createNote(note);
  await loadNotes();
}

export async function editExistingNote(id) {
  const title = document.querySelector('[name="title"]').value;
  const description = document.querySelector('[name="description"]').value;
  const type = document.querySelector('[name="type"]')?.value;
  const icon = document.querySelector('[name="icon"]')?.value;
  const important = document.querySelector('#important')?.checked || false;

  const updatedData = {
    title,
    description,
    important,
  };

  if (type) updatedData.type = type;
  if (icon) updatedData.icon = icon;

  if (type === 'image') {
    const previewImg = document.querySelector('.preview-image');
    if (previewImg && previewImg.src) {
      updatedData.image = previewImg.src;
    } else {
      const fileInput = document.querySelector('#imageInput');
      if (fileInput && fileInput.files && fileInput.files[0]) {
        updatedData.image = await fileToBase64(fileInput.files[0]);
      }
    }
  }

  if (type === 'checklist') {
    updatedData.items = generateChecklistItems();
  }

  await updateNote(id, updatedData);
  await loadNotes();
}

export async function removeNote(id) {
  await deleteNote(id);
  await loadNotes();
}