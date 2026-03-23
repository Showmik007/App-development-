window.APP_CONFIG = {
  APP_VERSION: '20',
  APP_NAME: 'O-Level 27',
  USER_APP_SUBTITLE: 'Smart Student Dashboard',
  ADMIN_APP_TITLE: 'Admin App',
  PAGE_TITLES: {
    APP: 'App',
    LOGIN: 'Login',
    ADMIN: 'Admin App',
    HOME: 'Home',
    TUTORIAL: 'Tutorial Videos',
    PRACTICE: 'Practice Tools',
    PDFS: 'PDF Notes',
    PDF_VIEWER: 'PDF Viewer',
    VIDEO: 'Video Player',
    MYPOST: 'My Post'
  },
  API_URL: 'https://script.google.com/macros/s/AKfycbwkyQmTCc_QIEtr0UZYhXspZYegGq5h64761WQ7cGN_VJ8eLt26tW5GJVV7BB1i6luILw/exec',
  TOKEN_KEYS: {
    USER: 'USER_TOKEN',
    ADMIN: 'ADMIN_TOKEN'
  },
  SHEETS: {
    TRACKER: 'Tracker',
    TUTORIAL: 'Tutorial',
    PDF: 'PDF',
    NOTICES: 'Notices',
    USERS: 'Users',
    ADMINS: 'Admins',
    SESSIONS: 'Sessions'
  },
  PAGES: {
    INDEX: 'index.html',
    LOGIN: 'login.html',
    APP: 'app.html',
    HOME: 'home.html',
    FEATURE1: 'feature1.html',
    FEATURE2: 'feature2.html',
    PDFS: 'feature3.html',
    VIDEO: 'video.html',
    PDF_VIEWER: 'pdf.html',
    MYPOST: 'mypost.html',
    ADMIN: 'admin.html'
  },
  FEATURES: [
    { label: 'Home', file: 'home.html', icon: '◫' },
    { label: 'Tutorial Videos', file: 'feature1.html', icon: '▶' },
    { label: 'PDF Notes', file: 'feature3.html', icon: '📄' },
    { label: 'Practice Tools', file: 'feature2.html', icon: '✦' },
    { label: 'My Post', file: 'mypost.html', icon: '✎' }
  ],
  CACHE: {
    TRACKER: {
      KEY: 'TRACKER_CACHE_V4',
      TTL_MS: 1000 * 60 * 60 * 12
    },
    TUTORIAL: {
      KEY: 'TUTORIAL_CACHE_V8',
      TTL_MS: 1000 * 60 * 60 * 12
    },
    PDF: {
      KEY: 'PDF_CACHE_V9',
      TTL_MS: 1000 * 60 * 60 * 12
    }
  },
  TRACKER: {
    STAGES: [
      ['Theory', 'Theory'],
      ['Past Paper Practice', 'Past Paper Practice'],
      ['Revision 1', 'Revision 1'],
      ['Revision 2', 'Revision 2'],
      ['Final Revision', 'Final Revision'],
      ['Exam', 'Exam']
    ]
  }
};
