import {
  getNotes,
  updateChecklistItem,
} from "./api.js";

import {
  renderNotes,
} from "./render.js";

import {
  initModal,
  openCreateModal,
  openEditModal,
  openConfirmModal,
} from "./modal.js";

import {
  removeNote,
} from "./notes.js";

import {
  initSearch,
} from "./search.js";
import { parseId } from './helpers.js';

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
        const id = parseId(editBtn.dataset.id);
        await openEditModal(id);
      } else if (deleteBtn) {
        const id = parseId(deleteBtn.dataset.id);

        const ok = await openConfirmModal({
          title: 'Удалить заметку',
          text: 'Вы уверены, что хотите удалить эту заметку?',
          confirmText: 'Подтвердить'
        });

        if (!ok) return;

        await removeNote(id);
      } else {
        const noteCard = e.target.closest(".note-card");
        if (noteCard && !e.target.closest(".checkbox-img")) {
          const id = parseId(noteCard.dataset.id);
          await openEditModal(id);
        }
      }
    }
  );

  document.addEventListener(
    "click",
    (e) => {
      const checkboxImg = e.target.closest(".checkbox-img");
      
      if (checkboxImg) {
        e.preventDefault();
        e.stopPropagation();
        
        const checklistItem = checkboxImg.closest(".checklist-item");
        if (!checklistItem) return;
        
        const noteId = parseId(checklistItem.dataset.noteId);
        const itemId = parseId(checklistItem.dataset.itemId);
        const isCompleted = checklistItem.classList.contains("completed");
        const newCompletedState = !isCompleted;

        // Optimistic UI: обновляем локально сразу
        if (newCompletedState) checklistItem.classList.add("completed");
        else checklistItem.classList.remove("completed");

        // Найдём, является ли карточка важной, чтобы подобрать нужные иконки
        const noteCard = checklistItem.closest('.note-card');
        const isImportantCard = noteCard && noteCard.classList.contains('important');
        const emptyCheckbox = isImportantCard ? "imp-chekbox-empty.png" : "checkbox-empty.png";
        const fullCheckbox = isImportantCard ? "imp-checkbox-full.png" : "checkbox-full.png";

        checkboxImg.src = `assets/${newCompletedState ? fullCheckbox : emptyCheckbox}`;

        // Отправляем запрос. Если сервер недоступен — операцию положат в очередь, UI оставляем как есть.
        updateChecklistItem(noteId, itemId, newCompletedState).catch(() => {
          // Сервер недоступен — не откатываем UI, показываем уведомление и сохраняем в queue в api.js
          showToast('Сохранение отложено — сервер недоступен');
        });
      }
    }
  );
}

function showToast(text) {
  try {
    const t = document.createElement('div');
    t.textContent = text;
    Object.assign(t.style, {
      position: 'fixed',
      right: '16px',
      top: '16px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      zIndex: 10000,
      fontSize: '14px'
    });
    document.body.appendChild(t);
    setTimeout(() => { t.style.transition = 'opacity 0.3s'; t.style.opacity = '0'; }, 1800);
    setTimeout(() => t.remove(), 2200);
  } catch (err) {
    console.warn('Toast failed', err);
  }
}

init();