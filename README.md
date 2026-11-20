# My Knowledge Hub

A retro-computer-inspired, responsive, open-source starter UI for an offline-first knowledge and learning platform.

## Included in this starter

- Responsive desktop and mobile dashboard
- Retro terminal visual theme with scanline toggle and accent themes
- Navigation and custom app launcher
- Sample local search catalog
- Notes stored in browser local storage, with JSON export
- Sample quiz
- Offline app-shell caching through a service worker (when served from HTTPS or localhost)
- Clearly marked integration placeholders for offline library archives, maps, documents, and local AI

## Run locally

For a quick preview, open `index.html` in a browser. Some browser features, especially service workers, require a local web server or HTTPS.

For offline caching on a computer with Python installed:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a public GitHub repository.
2. Upload the contents of this folder to the repository root (not the ZIP file itself).
3. Open **Settings → Pages**.
4. Under build and deployment, choose **Deploy from a branch**.
5. Choose the `main` branch and `/(root)`, then save.
6. Wait for GitHub Pages to publish the site.

## Important architecture notes

GitHub Pages hosts the static front end. It does not run a private backend, database server, map tile server, or local AI model.

The current starter is a UI prototype:
- Notes and theme preferences are saved in this browser only.
- The search function searches a small sample catalog and saved notes.
- The quiz contains three sample questions.
- The library, books, maps, and AI screens are interface placeholders, not connected services.
- The service worker caches the app shell; it does not automatically download encyclopedia archives, books, map datasets, or AI models.

## Suggested future architecture

```text
my-knowledge-hub/
├── index.html
├── styles.css
├── app.js
├── manifest.webmanifest
├── sw.js
├── assets/
│   ├── icons/
│   └── images/
├── content/
│   ├── courses/
│   ├── catalog/
│   └── sample-data/
├── docs/
│   ├── architecture.md
│   └── contributing.md
└── LICENSE
```

Possible later services:
- Offline articles: integrate a compatible ZIM reader such as Kiwix.
- Maps: use an offline map package and compatible local map renderer.
- AI: connect to a model running locally on the host device through a local API.
- Sync: add an optional backend only if you want data shared across devices.

## Privacy and backups

Notes are stored in browser local storage. They do not sync between devices. Export notes regularly using Settings → Export Notes. Clearing browser data can remove local notes.

## License

MIT License. You may use, modify, and share this starter. Keep this license and copyright notice with redistributed copies.
