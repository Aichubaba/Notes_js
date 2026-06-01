export function generateChecklistItems() {
  const items = [];

  document
    .querySelectorAll(".check-item-input")
    .forEach((input) => {
      const value = input.value.trim();

      if (value) {
        items.push({
          id: Date.now() + Math.random(),
          text: value,
          completed: false,
        });
      }
    });

  return items;
}

export function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.readAsDataURL(file);
  });
}