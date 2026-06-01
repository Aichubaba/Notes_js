export function renderNotes(notes) {
  const container =
    document.querySelector(
      "#notesContainer"
    );

  container.innerHTML = "";

  notes.forEach((note) => {
    container.insertAdjacentHTML(
      "beforeend",
      createCard(note)
    );
  });
}

function createCard(note) {
  let content = "";

  if (note.type === "text") {
    content = `
      <p class="note-description">
        ${note.description}
      </p>
    `;
  }

  if (note.type === "image") {
    content = `
      <img
        src="${note.image}"
        class="note-image"
      >
    `;
  }

  if (note.type === "checklist") {
    content = `
      <ul class="checklist">

      ${note.items
        .map(
          (item) => `
          <li>
            <input
              type="checkbox"
              ${
                item.completed
                  ? "checked"
                  : ""
              }
            >
            ${item.text}
          </li>
      `
        )
        .join("")}

      </ul>
    `;
  }

  return `
  <article
    class="note-card
    ${
      note.important
        ? "important"
        : ""
    }"
  >

    <div class="card-header">

      <h3 class="card-title">
        ${note.title}
      </h3>

      <div class="card-actions">

        <button
          class="action-btn edit-btn"
          data-id="${note.id}"
        >
          ✏️
        </button>

        <button
          class="action-btn delete-btn"
          data-id="${note.id}"
        >
          ❌
        </button>

      </div>

    </div>

    ${content}

  </article>
  `;
}