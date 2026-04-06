VERSION 21 PACKAGE

What changed:
- Kept the rest of the app structure, routes, caching, login flow, notifications, and UI behavior the same.
- Upgraded pdf.html into a browser-style PDF reader with:
  - zoom in / zoom out
  - fit-to-width button
  - page navigation
  - download button
  - mark mode with pen and highlighter
  - eraser and clear-page actions
  - local cache saving for page marks on the same device/browser
- PDF marks are stored in browser localStorage and reload automatically for the same PDF link.
- Existing Google Drive preview fallback remains available if direct PDF rendering fails.
- APP_VERSION updated to 21 in config.js.

Deploy files:
- Upload all files in this package exactly as-is.
- Re-deploy Apps Script if needed only when your backend changes. This Version 21 package is frontend-only.

Notes:
- Marks are saved per browser/device, not in Google Sheets.
- Download behavior depends on the PDF source host permissions.
