VERSION 12 PACKAGE

What changed:
- Made the project more portable by centralizing frontend settings in config.js.
- Added APP_VERSION, PAGE_TITLES, CACHE, and all sheet names in one place.
- Tutorial page now uses config.js for its cache key, TTL, page navigation, and sheet name.
- PDF page and tracker page now use centralized cache settings and page references.
- Backend Code.gs now has one APP_SETTINGS object for all sheet tabs and token TTL.
- Tutorial API can now read from the sheet name you set in config.js and Code.gs more easily.

If you rename sheet tabs later:
1. Update the names in config.js for the frontend.
2. Update the names in APP_SETTINGS.SHEETS at the top of Code.gs for the backend.

Files to deploy:
- Code.gs
- appsscript.json
- config.js
- common.js
- styles.css
- all HTML files

Notes:
- Existing design and functionality were kept the same.
- Your current API_URL is still unchanged.
- Version 11 already had the compact PDF UI; this package builds on that.


VERSION 21 PACKAGE

What changed:
- PDF viewer upgraded for mobile-friendly preview style.
- Toolbar can be hidden and shown.
- Desktop and mobile use the same cleaner preview layout.
- Zoom in, zoom out, fit, page jump, and open buttons remain available.
- Google Drive and preview fallback remain supported.
- All other pages and app behavior remain unchanged.


VERSION 22 PDF UPDATE
- Continuous scroll PDF viewer (all pages render vertically).
- Mobile-friendly toolbar that can be hidden or shown.
- Open and Download buttons improved for phone and desktop.
- Pen, highlight, eraser, and clear-page tools added.
- Marks save to local browser cache per PDF and page.
- Google Drive / gview preview fallback remains when direct rendering is blocked.


VERSION 22 PDF LAYOUT FIX

What changed:
- Fixed mobile PDF toolbar overflow and clipping.
- Mobile controls now open and close cleanly inside the screen width.
- PDF reading area stays full width and easier to use on phone.
- All other app pages remain unchanged.
