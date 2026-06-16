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

function getForm() {
  return document.querySelector("#modal #noteForm");
}

export async function createNewNote() {
  const form = getForm();
  if (!form) return;

  const title = form.querySelector('[name="title"]').value;
  const description = form.querySelector('[name="description"]').value;
  const type = form.querySelector('[name="type"]').value;
  const icon = form.querySelector('[name="icon"]')?.value || 'bookmark.png';
  const important = form.querySelector('#important')?.checked || false;

  const note = {
    title,
    description,
    type,
    icon,
    important,
  };

  if (type === 'image') {
    const previewImg = form.querySelector('.preview-image');
    if (previewImg && previewImg.src) {
      note.image = previewImg.src;
    } else {
      const fileInput = form.querySelector('#imageInput');
      if (fileInput && fileInput.files && fileInput.files[0]) {
        note.image = await fileToBase64(fileInput.files[0]);
      }
    }
  }

  if (type === 'checklist') {
    note.items = generateChecklistItems(form);
  }

  try {
    await createNote(note);
    await loadNotes();
  } catch (err) {
    console.error('Failed to create note:', err);
    alert('Не удалось создать заметку. Проверьте подключение к серверу.');
  }
}

export async function editExistingNote(id) {
  const form = getForm();
  if (!form) return;

  const title = form.querySelector('[name="title"]').value;
  const description = form.querySelector('[name="description"]').value;
  const type = form.querySelector('[name="type"]')?.value;
  const icon = form.querySelector('[name="icon"]')?.value;
  const important = form.querySelector('#important')?.checked || false;

  const updatedData = {
    title,
    description,
    important,
  };

  if (type) updatedData.type = type;
  if (icon) updatedData.icon = icon;

  if (type === 'image') {
    const previewImg = form.querySelector('.preview-image');
    if (previewImg && previewImg.src) {
      updatedData.image = previewImg.src;
    } else {
      const fileInput = form.querySelector('#imageInput');
      if (fileInput && fileInput.files && fileInput.files[0]) {
        updatedData.image = await fileToBase64(fileInput.files[0]);
      }
    }
  }

  if (type === 'checklist') {
    updatedData.items = generateChecklistItems(form);
  }

  try {
    await updateNote(id, updatedData);
    await loadNotes();
  } catch (err) {
    console.error('Failed to update note:', err);
    alert('Не удалось обновить заметку. Проверьте подключение к серверу.');
  }
}

export async function removeNote(id) {
  try {
    await deleteNote(id);
  } catch (err) {
    console.error('Failed to delete note:', err);
    alert('Не удалось удалить заметку. Проверьте подключение к серверу.');
    return;
  }
  await loadNotes();
}