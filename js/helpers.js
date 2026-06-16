export function generateChecklistItems() {
  const items = [];

  document
    .querySelectorAll(".checklist-item-row")
    .forEach((row) => {
      const input = row.querySelector(".checklist-input");
      const checkbox = row.querySelector(".checklist-checkbox");
      const value = input.value.trim();

      if (value) {
        items.push({
          id: Date.now() + Math.random(),
          text: value,
          completed: checkbox.checked,
        });
      }
    });

  return items;
}

export function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

export function resizeImageToDataUrl(file, maxDimension = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Parse an id coming from dataset or forms into a number when possible.
export function parseId(val) {
  if (val === null || val === undefined) return val;
  // If it's already a number
  if (typeof val === 'number') return val;
  // Try to parse numeric strings (including floats)
  const n = Number(val);
  return Number.isNaN(n) ? val : n;
}

// Ensure note object has consistent types: numeric id, checklist item ids numeric, booleans normalized
export function normalizeNote(note) {
  if (!note || typeof note !== 'object') return note;
  const out = { ...note };
  if ('id' in out) out.id = parseId(out.id);
  if ('important' in out) out.important = Boolean(out.important);
  if (Array.isArray(out.checklist)) {
    out.checklist = out.checklist.map((it) => ({
      ...it,
      id: parseId(it.id),
      completed: Boolean(it.completed),
      text: typeof it.text === 'string' ? it.text : String(it.text || ''),
    }));
  }
  // some code uses `items` instead of `checklist`
  if (!Array.isArray(out.items) && Array.isArray(out.checklist)) {
    out.items = out.checklist;
  }
  return out;
}