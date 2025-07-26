Below is a **ready‑to‑copy “prompt roadmap.”**
Feed these prompts to ChatGPT in order (one per turn) and you’ll recreate the exact single‑file, offline Project Manager you have now.

---

### 1. Bootstrap the App

> **Prompt 1 – Basic scaffold**
> “Create one HTML file for a simple project‑manager app.
> • Users can add projects.
> • Under each project users can add basic text tasks.
> • Persist everything in localStorage so it runs offline—no build tools or server.”

---

### 2. Add Styling & Themes

> **Prompt 2 – Responsive styling & theme switcher**
> “Apply clean CSS: cards, subtle borders, modern fonts.
> • Provide light *and* dark palettes using CSS custom‑properties.
> • Include a toggle button that saves the user’s choice (localStorage).
> • Make the layout look good on mobile and desktop.”

---

### 3. Sidebar / Main Layout

> **Prompt 3 – Two‑pane layout**
> “Refactor: a left sidebar lists all projects; the main pane shows tasks for the selected project.
> Sidebar should stay visible (or stack on top for narrow screens).
> Clicking a project highlights it and loads its tasks.”

---

### 4. Rich Task Fields

> **Prompt 4 – Task details & CRUD**
> “Enhance tasks with: title, assignee, due‑date (date input), notes textarea, ‘done’ checkbox.
> • Add edit & delete actions.
> • Keep everything persisted in localStorage.”

---

### 5. Time Tracking

> **Prompt 5 – Per‑task timer**
> “For each task add:
> • ▶️/⏸ button to start & stop a running timer (update every 30 s).
> • ‘＋⏱’ action to add minutes manually.
> • Display total time (h m).
> Continue to store time data in localStorage.”

---

### 6. Calendar View

> **Prompt 6 – Due‑date calendar & alerts**
> “Show a simple month calendar under the task list:
> • Insert task badges on their due dates.
> • Highlight cells & badges red when due today or overdue.
> • When the app loads, sort tasks so today/overdue appear first.”

---

### 7. Data Portability

> **Prompt 7 – JSON import / export**
> “Add ‘Export JSON’ (download current store) and ‘Import JSON’ (file picker) buttons so people can back up or migrate their data. Confirm before overwriting existing data.”

---

### 8. Polish & Accessibility Audit

> **Prompt 8 – Code cleanup & comments**
> “Refactor for readability: break JS into sections, add comments, descriptive names.
> • Add ARIA labels, keyboard‑friendly controls, system‑prefers‑color detection, polyfill for `crypto.randomUUID`.
> • Ensure works in Chrome, Firefox, Edge, Safari.”

---

### 9. Calendar Navigation & Contrast

> **Prompt 9 – Next/Prev month & visual tweaks**
> “Improve the calendar:
> • Add ‹ Prev / Next › buttons and a month label to navigate months.
> • Give placeholder days a subtle gray background and darker text for better contrast.”

---

### 10. Final Smoke Test

> **Prompt 10 – End‑to‑end test & bug fix pass**
> “Run through all features, fix any JS errors (e.g., undefined variables), and ensure timers, theme toggle, import/export, and month navigation work flawlessly.”

---

Use (or adapt) these ten prompts in sequence and ChatGPT will rebuild the finalized **portable‑project‑manager.html** from scratch.
