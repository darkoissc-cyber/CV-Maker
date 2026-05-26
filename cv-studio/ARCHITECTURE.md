 # CV Studio Pro — Architecture

Modular vanilla-JS refactor of the monolithic `cv-studio-v2.html`. **Behavior, UI, templates, PDF export, ATS scoring, and localStorage are unchanged.**

## Project layout

```
cv-studio/
├── index.html              # Shell + markup (no inline app logic)
├── ARCHITECTURE.md
└── src/
    ├── main.js             # Entry: lifecycle, window API bridge
    ├── state/
    │   ├── constants.js    # SCHEMA_VERSION, LS keys, ACCENTS, PROG_FIELDS
    │   ├── model.js        # createDefaultState, migrateState, syncCounters
    │   └── store.js        # Live S, counters, timers, drag/undo slots
    ├── storage/
    │   ├── persistence.js  # Auto-save, load, beforeunload flush
    │   └── importExport.js # JSON import/export
    ├── export/
    │   └── pdf.js          # html2pdf export
    ├── ats/
    │   ├── calcATS.js      # Score + tips + keyword gaps
    │   └── renderATS.js    # ATS panel DOM
    ├── theme/
    │   ├── theme.js        # Dark/light toggle + restore
    │   ├── accents.js      # Swatch bar init
    │   ├── accentActions.js
    │   └── template.js     # Template selection
    ├── core/
    │   ├── init.js         # Boot sequence
    │   ├── stateUI.js      # applyStateToUI after load/import
    │   ├── update.js       # Form input → full re-render
    │   ├── progress.js     # Completeness bar
    │   ├── dragDrop.js     # List reorder (exp/edu/projects)
    │   └── undo.js         # Delete undo toast
    ├── components/
    │   ├── forms.js        # rForms, syncFromForm, restoreFormValues
    │   ├── sections.js     # CRUD: exp, edu, projects, refs, certs
    │   ├── skills.js       # Skills + languages chips, skill drag
    │   └── photo.js        # Profile photo
    ├── renderers/
    │   ├── helpers.js      # ci, projLinks, certLine, refsHTML, …
    │   └── pipeline.js     # renderCV() — central preview pipeline
    ├── templates/
    │   ├── index.js        # TEMPLATE_RENDERERS registry
    │   ├── vertex.js … minimal.js
    └── styles/
        ├── main.css        # @imports only
        ├── base.css, layout.css, components.css,
        ├── templates.css, utilities.css, animations.css
    └── utils/
        ├── escape.js       # x() HTML escape
        └── dom.js          # Optional id cache
```

## Render flow

```
User input (update / section CRUD / template change)
        │
        ▼
  syncFromForm()          ← components/forms.js
        │
        ├──► pct()         ← core/progress.js (completeness UI)
        ├──► renderATS()   ← ats/* (score panel)
        └──► renderCV()    ← renderers/pipeline.js
                  │
                  ├── Apply accent CSS vars on #cv-doc
                  ├── Empty state OR
                  └── TEMPLATE_RENDERERS[S.tpl](doc, S)
```

`renderCV` is also exposed as `window.rCV` for inline `oninput` handlers inside dynamically generated form cards.

## State flow

1. **Single source of truth:** `store.S` (schema v3 via `migrateState`).
2. **Counters:** `store.counters` (`ec`, `dc`, `pc`, `rc`, `cc`, `sc`) for list item ids.
3. **Persistence:** `saveToLS` debounces writes to `localStorage` key `cvstudio_v2_data`.
4. **Import:** JSON → `setState(migrateState(...))` → `applyStateToUI()`.
5. **Window bridge:** `main.js` sets `window.S = store.S` so inline handlers can use `S.exp.find(...)` unchanged.

## Template system

Each template is a pure function `(doc, s) => void` that sets `doc.className` and `innerHTML`. Shared fragments live in `renderers/helpers.js`. Registration is in `templates/index.js`:

```js
export const TEMPLATE_RENDERERS = { vertex, atlas, pulse, classic, executive, creative, minimal };
```

Adding a template: implement renderer → register in `index.js` → add card in `index.html` → add CSS under `styles/templates.css`.

## Window API (inline HTML)

`main.js` assigns handlers used by markup: `update`, `setTpl`, `exportPDF`, `addExp`, `rmExp`, …, `S`, `rCV`, `saveToLS`. No framework; ES modules only.

## Running locally

ES modules require a local server (not `file://`):

```bash
npx serve cv-studio
# or: python -m http.server 8080  (from cv-studio folder)
```

Open `http://localhost:3000` (or your port).

## Legacy entry

`cv-studio-v2.html` on the Desktop redirects to `cv-studio/index.html` for the modular build.

## Future scalability

- **Tests:** Import `calcATS`, `migrateState`, `x` without DOM.
- **New sections:** Extend `model.js` + `sections.js` + one helper + each template renderer.
- **Bundling:** Optional Vite/Rollup entry at `src/main.js` for production single-file output.
- **TypeScript:** Add types for `S` shape in `state/model.ts`.
- **Remove window globals:** Replace inline `oninput` with event delegation in `forms.js` (one listener on `#exp-list`, etc.).
