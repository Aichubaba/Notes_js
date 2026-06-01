import {
  createNewNote,
  editExistingNote,
} from "./notes.js";

import { getNote } from "./api.js";

const modal =
  document.querySelector("#modal");

export function initModal() {
  modal.addEventListener(
    "click",
    (e) => {
      if (
        e.target === modal ||
        e.target.classList.contains(
          "modal-close"
        )
      ) {
        closeModal();
      }
    }
  );
}

export function closeModal() {
  modal.classList.add("hidden");
  modal.innerHTML = "";
}

export function openCreateModal() {
  renderModal();

  bindFormSubmit();
}

export async function openEditModal(
  id
) {
  const note = await getNote(id);

  renderModal(note);

  bindFormSubmit(id);
}

function renderModal(note = null) {
  modal.innerHTML = `
<div class="modal-content">

<button class="modal-close">
✖
</button>

<h2 class="modal-title">
${
  note
    ? "Редактировать"
    : "Новая заметка"
}
</h2>

<form id="noteForm">

<div class="form-group">
<input
class="form-input"
name="title"
placeholder="Название"
value="${
    note?.title || ""
  }"
required
>
</div>

<div class="form-group">

<select
class="form-select"
name="type"
id="noteType"
>

<option value="text">
Текст
</option>

<option value="checklist">
Чек-лист
</option>

<option value="image">
Изображение
</option>

</select>

</div>

<div class="form-group">

<textarea
class="form-textarea"
name="description"
placeholder="Описание"
>${
    note?.description || ""
  }</textarea>

</div>

<div class="form-group">

<input
type="file"
id="imageInput"
accept="image/*"
>

</div>

<div
class="checklist-builder"
>

<button
type="button"
id="addChecklistItem"
class="btn btn-primary"
>

Добавить пункт

</button>

<div
class="checklist-items"
></div>

</div>

<div
class="checkbox-wrapper"
>

<input
type="checkbox"
id="important"
${
    note?.important
      ? "checked"
      : ""
  }
>

<label>
Важная заметка
</label>

</div>

<div class="modal-footer">

<button
class="btn btn-primary"
type="submit"
>

Сохранить

</button>

</div>

</form>

</div>
`;

  modal.classList.remove("hidden");

  initChecklistBuilder();
}

function initChecklistBuilder() {
  const btn =
    document.querySelector(
      "#addChecklistItem"
    );

  const wrapper =
    document.querySelector(
      ".checklist-items"
    );

  btn.addEventListener(
    "click",
    () => {
      wrapper.insertAdjacentHTML(
        "beforeend",
        `
      <div class="check-item">

        <input
          class="form-input check-item-input"
          placeholder="Пункт"
        >

        <button
          type="button"
          class="remove-check"
        >
          X
        </button>

      </div>
      `
      );
    }
  );

  wrapper.addEventListener(
    "click",
    (e) => {
      if (
        e.target.classList.contains(
          "remove-check"
        )
      ) {
        e.target
          .closest(".check-item")
          .remove();
      }
    }
  );
}

function bindFormSubmit(
  editId = null
) {
  const form =
    document.querySelector(
      "#noteForm"
    );

  form.addEventListener(
    "submit",
    async (e) => {
      e.preventDefault();

      if (editId) {
        await editExistingNote(
          editId
        );
      } else {
        await createNewNote();
      }

      closeModal();
    }
  );
}