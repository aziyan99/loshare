# Research & Technical Decisions: Fix Send File Button Bug & UI Simplification

## Decision 1: Resolve the DOM Selector Mismatch
- **Decision**: Update `src/public/app.js` to retrieve the send button element via `document.getElementById('send-file-btn')` instead of `'sendFileBtn'`.
- **Rationale**: The HTML in `src/public/index.html` defines the button with `id="send-file-btn"`. The selector query `document.getElementById('sendFileBtn')` evaluates to `null` on load, causing an Uncaught TypeError when trying to call `addEventListener` on it.
- **Alternatives Considered**: 
  - Change the HTML element ID to `sendFileBtn` (rejected: kebab-case `send-file-btn` is the project naming convention for HTML IDs, which is cleaner and more standard for markup).

## Decision 2: Simplify UX Stylesheet to Light Mode
- **Decision**: Simplify `src/public/style.css` by rewriting variables and selectors to use a clean light-mode theme with minimal layout rules (e.g. system sans-serif fonts, basic borders, flexible cards, and clean forms).
- **Rationale**: Directly requested by the user. Deleting complex CSS rules (gradients, box-shadows, animations) reduces visual bloat and simplifies code footprint, aligning with YAGNI principles.
- **Alternatives Considered**: 
  - Keep a dual theme switch (rejected: violates YAGNI since it wasn't requested).
  - Use a CSS framework like Tailwind (rejected: vanilla CSS is preferred for this zero-dependency project, and minimal custom CSS is cleaner).
