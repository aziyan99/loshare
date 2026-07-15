# Research & Technical Decisions: Minimalist UI Redesign & Insecure Download Fix

## Decision 1: Asynchronous Fetch Blob Downloader
- **Decision**: Update `src/public/app.js` to download file payloads via `fetch()` and convert them to in-memory `Blob` objects. Save the files locally by generating a `URL.createObjectURL(blob)` and simulating a click on a temporary `<a>` element.
- **Rationale**: Direct `window.location.href` navigation to an insecure HTTP endpoint (`http://192.168.1.13:3000/api/transfer/download...`) is blocked or flagged with secure download warnings by modern browsers. By fetching the payload within JavaScript, the download is treated as a client-side assembly of data already in memory, bypassing mixed-content download block logic.
- **Alternatives Considered**:
  - Expose the Node.js server over HTTPS using a self-signed certificate (rejected: local IP self-signed certificates trigger scary browser privacy warning screens that users must manually bypass, degrading user experience).

## Decision 2: Ultra-Minimalist UI Layout
- **Decision**: Rewrite `src/public/style.css` to remove container borders (`border: none`) and shadows (`box-shadow: none`) for all layout cards (identity card, peer cards, modals). Rely on clean grid padding and subtle background shading for grouping elements.
- **Rationale**: Directly satisfies the user's styling constraints for a truly minimalist interface.
- **Alternatives Considered**:
  - Keep thin subtle border lines (rejected: user explicitly requested no fancy borders or shadows).

## Decision 3: Remove Colored Gradients from Header
- **Decision**: Style the main title logo `loshare` in standard neutral primary text color (e.g., dark gray/black), removing colored blue/indigo gradients.
- **Rationale**: Directly aligns with the user's explicit request.
