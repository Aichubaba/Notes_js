import { createNewNote, editExistingNote } from "./notes.js";
import { getNote } from "./api.js";
import { resizeImageToDataUrl } from "./helpers.js";

const modal = document.querySelector("#modal");

export function initModal() {
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest(".modal-close")) {
      closeModal();
    }
  });

  document.addEventListener("click", closeDropdowns);
}

function closeDropdowns() {
  document.querySelectorAll(".custom-select.open").forEach(el => {
    el.classList.remove("open");
    const opts = el.querySelector(".custom-options");
    if (opts) opts.classList.add("hidden");
  });
}

export function openConfirmModal({ title = "Подтвердите действие", text = "", confirmText = "Подтвердить" } = {}) {
  return new Promise((resolve) => {
    modal.innerHTML = `
      <div class="modal-content confirm-modal">
        <button class="modal-close"><img src="assets/X.png" alt="Закрыть"></button>
        <h2 class="modal-title">${title}</h2>
        <p class="modal-text">${text}</p>
        <button class="btn confirm-btn">${confirmText}</button>
      </div>
    `;

    modal.classList.remove("hidden");

    const confirmBtn = modal.querySelector(".confirm-btn");

    function cleanup(result) {
      resolve(result);
      closeModal();
      modal.removeEventListener("click", onClick);
      confirmBtn.removeEventListener("click", onConfirm);
    }

    function onClick(e) {
      if (e.target === modal) cleanup(false);
      if (e.target.closest(".modal-close")) cleanup(false);
    }

    function onConfirm() { cleanup(true); }

    modal.addEventListener("click", onClick);
    confirmBtn.addEventListener("click", onConfirm);
  });
}

export function closeModal() {
  modal.classList.add("hidden");
  modal.innerHTML = "";
}

export function openCreateModal() {
  renderModal();
  bindFormSubmit();
}

export async function openEditModal(id) {
  const note = await getNote(id);
  renderModal(note);
  bindFormSubmit(id);
}

function renderModal(note = null) {
  const currentType = note?.type || "text";
  const icon = note?.icon || "bookmark.png";
  const typeLabels = { text: "Текстовая", image: "С изображением", checklist: "Чек-лист" };
  const typeLabelText = note ? typeLabels[currentType] : "Выберите тип заметки";

  modal.innerHTML = `
    <div class="modal-content create-modal">
      <button class="modal-close"><img src="assets/X.png" alt="Закрыть"></button>
      <h2 class="modal-title">${note ? "Редактировать" : "Создать заметку"}</h2>

      <form id="noteForm">
        <input type="hidden" name="type" value="${currentType}">

        <div class="form-fields">
          <div class="form-row">
            <input class="form-input" name="title" placeholder="Введите название" value="${note?.title || ""}" required>
          </div>

          <div class="form-row">
            <div class="custom-select" data-value="${currentType}">
              <div class="custom-select-header">
                <span class="custom-select-label">${typeLabelText}</span>
                <img src="assets/chevron-down.png" class="chev" width="24" height="24" alt="">
              </div>
              <div class="custom-options hidden">
                <div class="option type-option" data-value="text">Текстовая <img src="assets/check.png" class="opt-check hidden" width="16" height="16"></div>
                <div class="option type-option" data-value="image">С изображением <img src="assets/check.png" class="opt-check hidden" width="16" height="16"></div>
                <div class="option type-option" data-value="checklist">Чек-лист <img src="assets/check.png" class="opt-check hidden" width="16" height="16"></div>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="icon-picker custom-select" data-value="${icon}">
              <div class="custom-select-header">
                <span class="custom-select-label">Выберите иконку</span>
                <span class="selected-icon-wrapper hidden">
                  Выбранная иконка: <span class="selected-icon-bg"><img src="" class="selected-icon-img" alt=""></span>
                </span>
                <img src="assets/chevron-down.png" class="chev" width="24" height="24" alt="">
              </div>
              <div class="icon-options custom-options hidden"></div>
            </div>
          </div>

          <div class="form-row">
            <textarea class="form-textarea" name="description" placeholder="Введите описание">${note?.description || ""}</textarea>
          </div>

          <div class="form-row image-area ${currentType === "image" ? "" : "hidden"}">
            <div class="image-dropzone" id="imageDropzone">
              <span class="dropzone-text">Прикрепить изображение</span>
            </div>
            <input type="file" id="imageInput" accept="image/*" class="hidden-file">
          </div>

          <div class="form-row checklist-area ${currentType === "checklist" ? "" : "hidden"}">
            <div class="checklist-builder">
              <div class="checklist-items"></div>
              <div class="add-checklist-link">Добавить чекбокс</div>
            </div>
          </div>

          <div class="form-row checkbox-row">
            <input type="checkbox" id="important" name="important" ${note?.important ? "checked" : ""}>
            <label for="important">Важное событие</label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary create-btn" type="submit">${note ? "Сохранить" : "Создать"}</button>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove("hidden");

  initTypeSwitcher();
  initIconPicker(note?.icon);
  initChecklistBuilder(note);
  initImageDrop(note);
}

function initTypeSwitcher() {
  const select = modal.querySelector(".custom-select");
  const label = select.querySelector(".custom-select-label");
  const options = select.querySelector(".custom-options");
  const typeOptions = options.querySelectorAll(".type-option");

  const current = select.dataset.value || "text";
  typeOptions.forEach(o => {
    const check = o.querySelector('.opt-check');
    if (o.dataset.value === current) check.classList.remove('hidden');
    else check.classList.add('hidden');
  });

  select.addEventListener('click', (e) => {
    e.stopPropagation();
    options.classList.toggle('hidden');
    select.classList.toggle('open', !options.classList.contains('hidden'));
  });

  options.addEventListener('click', (e) => {
    const opt = e.target.closest('.option');
    if (!opt) return;
    if (opt.classList.contains('type-option')) {
      const val = opt.dataset.value;
      select.dataset.value = val;
      label.textContent = opt.textContent.trim();
      typeOptions.forEach(o => o.querySelector('.opt-check').classList.add('hidden'));
      opt.querySelector('.opt-check').classList.remove('hidden');
      const typeInput = modal.querySelector('input[name="type"]');
      if (typeInput) typeInput.value = val;

      const imageArea = modal.querySelector('.image-area');
      const checklistArea = modal.querySelector('.checklist-area');
      if (imageArea) imageArea.classList.toggle('hidden', val !== 'image');
      if (checklistArea) checklistArea.classList.toggle('hidden', val !== 'checklist');
      if (val === 'checklist') {
        const wrapper = modal.querySelector('.checklist-items');
        if (wrapper && wrapper.children.length === 0) {
          addChecklistRow(wrapper);
        }
      }
    }
  });

}





function initIconPicker(initial) {
  const picker = modal.querySelector('.icon-picker');
  if (!picker) return;
  const toggle = picker;
  const row = picker.querySelector('.icon-options');
  const label = picker.querySelector('.custom-select-label');
  const wrapper = picker.querySelector('.selected-icon-wrapper');
  const selectedImg = wrapper.querySelector('.selected-icon-img');

  const icons = [
    'users-2.png','trophy.png','star.png','shopping-cart.png','heart.png','graduation-cap.png','cross.png','cat.png','camera.png','cake.png','briefcase.png','bookmark.png'
  ];
  row.innerHTML = icons.map(name => `<span class="icon-item-wrap"><img src="assets/icons/${name}" data-icon="${name}" class="icon-item" alt=""></span>`).join('');

  function getOrCreateIconInput() {
    let h = modal.querySelector('input[name="icon"]');
    if (!h) {
      h = document.createElement('input');
      h.type = 'hidden';
      h.name = 'icon';
      modal.querySelector('form').appendChild(h);
    }
    return h;
  }

  function selectIcon(iconName) {
    getOrCreateIconInput().value = iconName;
    label.classList.add('hidden');
    wrapper.classList.remove('hidden');
    selectedImg.src = `assets/icons/${iconName}`;
  }

  if (initial) {
    selectIcon(initial);
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    row.classList.toggle('hidden');
    toggle.classList.toggle('open', !row.classList.contains('hidden'));
  });

  row.addEventListener('click', (e) => {
    e.stopPropagation();
    const wrap = e.target.closest('.icon-item-wrap');
    if (!wrap) return;
    const img = wrap.querySelector('.icon-item');
    if (!img) return;
    row.querySelectorAll('.icon-item-wrap').forEach(w => w.classList.remove('selected'));
    wrap.classList.add('selected');
    selectIcon(img.dataset.icon);
    row.classList.add('hidden');
    toggle.classList.remove('open');
  });
}

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

function addChecklistRow(wrapper, value = '') {
  const id = crypto.randomUUID();
  const html = `
    <div class="checklist-item-row" data-id="${id}">
      <input type="checkbox" class="checklist-checkbox">
      <textarea class="checklist-input" placeholder="Введите название пункта">${value}</textarea>
      <button type="button" class="remove-media-btn">
        <img src="assets/X.png" alt="" width="16" height="16">
      </button>
    </div>`;
  wrapper.insertAdjacentHTML('beforeend', html);
  const ta = wrapper.lastElementChild.querySelector('.checklist-input');
  autoResizeTextarea(ta);
  ta.addEventListener('input', () => autoResizeTextarea(ta));
}

function initChecklistBuilder(note) {
  const wrapper = modal.querySelector('.checklist-items');
  const addLink = modal.querySelector('.add-checklist-link');
  if (!wrapper) return;

  if (note && Array.isArray(note.items) && note.items.length > 0) {
    note.items.forEach(it => addChecklistRow(wrapper, it.text || ''));
  } else {
    addChecklistRow(wrapper);
  }

  if (addLink) addLink.addEventListener('click', () => addChecklistRow(wrapper));

  wrapper.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-media-btn');
    if (btn) {
      btn.closest('.checklist-item-row').remove();
    }
  });
}

function initImageDrop(note) {
  const dropzone = modal.querySelector('#imageDropzone');
  const input = modal.querySelector('#imageInput');
  const imageArea = modal.querySelector('.image-area');
  if (!dropzone || !input || !imageArea) return;

  function createPreview(src) {
    const existing = imageArea.querySelector('.image-preview');
    if (existing) existing.remove();

    const html = `
      <div class="image-preview">
        <img class="preview-image" src="${src}" alt="">
        <button type="button" class="remove-media-btn">
          <img src="assets/X.png" alt="" width="16" height="16">
        </button>
      </div>`;
    imageArea.insertAdjacentHTML('beforeend', html);
    dropzone.classList.add('hidden');

    const removeBtn = imageArea.querySelector('.remove-media-btn');
    if (removeBtn) removeBtn.addEventListener('click', () => {
      imageArea.querySelector('.image-preview')?.remove();
      dropzone.classList.remove('hidden');
      input.value = '';
    });
  }

  dropzone.addEventListener('click', () => input.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  async function handleImageFile(f, fileList) {
    if (!f || !f.type.startsWith('image/')) return;
    if (fileList) input.files = fileList;
    try {
      const dataUrl = await resizeImageToDataUrl(f);
      createPreview(dataUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = () => createPreview(reader.result);
      reader.readAsDataURL(f);
    }
  }

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    handleImageFile(f, e.dataTransfer.files);
  });

  input.addEventListener('change', () => {
    const f = input.files && input.files[0];
    handleImageFile(f);
  });

  if (note && note.image) {
    createPreview(note.image);
  }
}

function bindFormSubmit(editId = null) {
  const form = modal.querySelector('#noteForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = form.querySelector('[name="title"]').value.trim();
    const icon = form.querySelector('[name="icon"]')?.value;
    const type = form.querySelector('[name="type"]').value;

    if (!title) return alert('Введите название');
    if (!icon) return alert('Выберите иконку');

    if (type === 'text') {
      const desc = form.querySelector('[name="description"]').value.trim();
      if (!desc) return alert('Введите описание');
    }

    if (type === 'image') {
      const preview = form.querySelector('.image-preview');
      const fileInput = form.querySelector('#imageInput');
      const hasFile = fileInput && fileInput.files && fileInput.files[0];
      const hasPreview = !!preview;
      if (!hasFile && !hasPreview) return alert('Прикрепите изображение');
    }

    if (type === 'checklist') {
      const rows = form.querySelectorAll('.checklist-item-row');
      const hasContent = Array.from(rows).some(row => row.querySelector('.checklist-input').value.trim());
      if (!hasContent) return alert('Добавьте хотя бы один пункт чек-листа');
    }

    if (editId) {
      await editExistingNote(editId);
    } else {
      await createNewNote();
    }
    closeModal();
  });
}
