window.APP_CONFIG = {
  APP_NAME: 'O-Level 27',
  USER_APP_SUBTITLE: 'Smart Student Dashboard',
  ADMIN_APP_TITLE: 'Admin App',
  API_URL: 'https://script.google.com/macros/s/AKfycbwSH8UmHBBvRY8pK8PdWzGsP-BsQfc3hqgPkGwVFoTB0oIyFbLeqA9LWyOSd8iVJtO9/exec',
  TOKEN_KEYS: {
    USER: 'USER_TOKEN',
    ADMIN: 'ADMIN_TOKEN'
  },
  SHEETS: {
    TRACKER: 'Tracker',
    TUTORIAL: 'Tutorial'
  },
  PAGES: {
    INDEX: 'index.html',
    LOGIN: 'login.html',
    APP: 'app.html',
    HOME: 'home.html',
    FEATURE1: 'feature1.html',
    FEATURE2: 'feature2.html',
    VIDEO: 'video.html',
    MYPOST: 'mypost.html',
    ADMIN: 'admin.html'
  },
  FEATURES: [
    { label: 'Home', file: 'home.html', icon: '◫' },
    { label: 'Tutorial Videos', file: 'feature1.html', icon: '▶' },
    { label: 'Practice Tools', file: 'feature2.html', icon: '✦' },
    { label: 'My Post', file: 'mypost.html', icon: '✎' }
  ],
  TRACKER: {
    CACHE_KEY: 'TRACKER_CACHE_V3',
    CACHE_TTL_MS: 1000 * 60 * 60 * 12,
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
