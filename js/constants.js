const BASE_URL = window.__API_BASE__ || "http://localhost:3000";
export const API_URL = `${BASE_URL}/notes`;

export const NOTE_TYPES = {
  TEXT: "text",
  CHECKLIST: "checklist",
  IMAGE: "image",
};