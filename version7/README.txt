VERSION 2 PACKAGE

What changed:
- Sidebar now has an animated slide-in menu with an X close button.
- Tutorial videos open and play inside the app. No external YouTube button.
- Tracker keeps search and filters at the top.
- Overview and paper progress are shown first and can be hidden or shown.
- Tracker is grouped as Paper -> Chapter -> Subtopic based on your data.
- Chapter cards expand to show detailed stage boxes.
- Tracker data is cached in browser localStorage and reloads only when you press Reload data.
- CSS is separated into styles.css.

Files to deploy:
- Code.gs
- appsscript.json
- config.js
- common.js
- styles.css
- all HTML files

Notes:
- This package expects your Tracker sheet to contain Paper, Topic, Sub Topic, and the stage columns:
  Theory | Past Paper Practice | Revision 1 | Revision 2 | Final Revision | Exam
- Tutorial sheet can use common column names like Title, Description, Video Link, Link, URL, Youtube, or YouTube.
- My Post stays as a placeholder until wall routes are added in Apps Script.
