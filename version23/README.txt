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

VERSION 22 PACKAGE

What changed:
- Rebuilt pdf.html for a cleaner mobile-friendly PDF viewer.
- Mobile viewer now uses a bottom dock plus a hide/show tools button.
- Added stronger Android-friendly download handling with fetch-to-blob, share fallback, new-tab fallback, and direct open fallback.
- PDF canvas view now stays closer to a preview-reader style on phone screens.
- Controls can be hidden and shown on both desktop and mobile.
- Existing app structure and all other pages were kept the same.
