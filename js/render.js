import { normalizeNote } from './helpers.js';

export function renderNotes(notes) {
  const container = document.querySelector("#notesContainer");
  container.innerHTML = "";
  notes.forEach((note) => {
    const n = normalizeNote(note);
    container.insertAdjacentHTML("beforeend", createCard(n));
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createCard(note) {
  let content = "";
  const iconName = note.icon || "bookmark.png";
  const iconPath = `assets/icons/${escapeHtml(iconName)}`;

  if (note.type === "text") {
    content = `<p class="note-description">${escapeHtml(note.description)}</p>`;
  }

  if (note.type === "image") {
    const imgSrc = note.image && typeof note.image === 'string' && note.image.startsWith('data:') ? note.image : '';
    content = imgSrc ? `<img src="${escapeHtml(imgSrc)}" class="note-image">` : '';
  }

  if (note.type === "checklist") {
    const items = Array.isArray(note.items) ? note.items : [];
    const emptyCheckbox = note.important ? "imp-chekbox-empty.png" : "checkbox-empty.png";
    const fullCheckbox = note.important ? "imp-checkbox-full.png" : "checkbox-full.png";
    content = `
      <ul class="checklist">
        ${items.map((item) => `
          <li class="checklist-item ${item.completed ? "completed" : ""}" data-note-id="${note.id}" data-item-id="${item.id}">
            <img src="assets/${item.completed ? fullCheckbox : emptyCheckbox}" alt="" class="checkbox-img">
            <span>${escapeHtml(item.text)}</span>
          </li>
        `).join("")}
      </ul>
    `;
  }

  return `
    <article class="note-card ${note.important ? "important" : ""}" data-id="${note.id}">
      <div class="card-header">
        <div class="card-title-group">
          <div class="card-icon">
            <img src="${iconPath}" alt="иконка">
          </div>
          <h3 class="card-title">${escapeHtml(note.title)}</h3>
        </div>
        <button class="action-btn delete-btn" data-id="${note.id}">
          <img src="assets/X.png" alt="Удалить" width="24" height="24">
        </button>
      </div>
      ${content}
    </article>
  `;
}