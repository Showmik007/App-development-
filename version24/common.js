(function(){
  const cfg = window.APP_CONFIG || {};

  function requireApiUrl(){
    const url = String(cfg.API_URL || '').trim();
    if(!url || url === 'PASTE_YOUR_DEPLOYED_APPS_SCRIPT_WEB_APP_URL_HERE'){
      throw new Error('Please set APP_CONFIG.API_URL in config.js');
    }
    return url;
  }

  async function parseJsonSafe(res){
    const text = await res.text();
    try { return JSON.parse(text); }
    catch (err) { throw new Error(text || 'Invalid JSON response'); }
  }

  async function apiGet(params){
    const qs = new URLSearchParams(params || {}).toString();
    const res = await fetch(requireApiUrl() + (qs ? ('?' + qs) : ''), { cache:'no-store' });
    return parseJsonSafe(res);
  }

  async function apiPost(payload){
    const res = await fetch(requireApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload || {})
    });
    return parseJsonSafe(res);
  }

  function getToken(type){
    const key = cfg.TOKEN_KEYS && cfg.TOKEN_KEYS[type];
    return key ? (localStorage.getItem(key) || '') : '';
  }

  function setToken(type, token){
    const key = cfg.TOKEN_KEYS && cfg.TOKEN_KEYS[type];
    if(key) localStorage.setItem(key, token || '');
  }

  function clearToken(type){
    const key = cfg.TOKEN_KEYS && cfg.TOKEN_KEYS[type];
    if(key) localStorage.removeItem(key);
  }

  async function fetchMe(type){
    const token = getToken(type);
    if(!token) return { ok:false, error:'Missing token' };
    return apiGet({ action:'me', token: token });
  }

  async function requireUser(){
    const token = getToken('USER');
    if(!token){ location.replace(cfg.PAGES.LOGIN); return null; }
    try {
      const me = await apiGet({ action:'me', token: token });
      if(me.ok && me.type === 'user') return me;
    } catch (err) {}
    clearToken('USER');
    location.replace(cfg.PAGES.LOGIN);
    return null;
  }

  async function requireAdmin(){
    const token = getToken('ADMIN');
    if(!token) return null;
    try {
      const me = await apiGet({ action:'me', token: token });
      if(me.ok && me.type === 'admin') return me;
    } catch (err) {}
    clearToken('ADMIN');
    return null;
  }

  async function logout(type){
    const token = getToken(type);
    if(token){
      try { await apiPost({ action:'logout', token: token }); }
      catch (err) {}
    }
    clearToken(type);
  }

  function escapeHtml(s){
    return String(s == null ? '' : s)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;');
  }

  function toBool(v){
    const s = String(v == null ? '' : v).trim().toLowerCase();
    return ['true','yes','y','1','done','complete','completed'].includes(s);
  }

  function normalizeText(v){ return String(v == null ? '' : v).trim(); }

  function pct(v){ return Math.max(0, Math.min(100, Math.round(Number(v) || 0))); }

  function colorFor(v){
    const n = pct(v);
    if(n >= 80) return 'var(--success)';
    if(n >= 50) return 'var(--accent-2)';
    if(n >= 25) return 'var(--warning)';
    return 'var(--accent)';
  }

  function extractYouTubeId(input){
    const raw = String(input || '').trim();
    if(!raw) return '';
    if(/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
    try {
      const u = new URL(raw);
      if(u.hostname.includes('youtu.be')) return u.pathname.replace(/^\//,'').slice(0,11);
      if(u.searchParams.get('v')) return u.searchParams.get('v').slice(0,11);
      const parts = u.pathname.split('/').filter(Boolean);
      const embedIndex = parts.findIndex(p => ['embed','shorts','live'].includes(p));
      if(embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1].slice(0,11);
    } catch (err) {}
    const m = raw.match(/([A-Za-z0-9_-]{11})/);
    return m ? m[1] : '';
  }

  function getCache(key){
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) { return null; }
  }

  function setCache(key, value){
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (err) {}
  }

  function ensurePageLoader(){
    let el = document.getElementById('pageLoader');
    if(el) return el;
    el = document.createElement('div');
    el.id = 'pageLoader';
    el.className = 'page-loader';
    el.innerHTML = '<div class="page-loader-card"><div class="badge" id="pageLoaderBadge">Loading</div><div class="page-loader-title" id="pageLoaderTitle">Loading data…</div><div class="page-loader-track"><div class="page-loader-fill" id="pageLoaderFill"></div></div><div class="page-loader-meta"><span id="pageLoaderPercent">0%</span><span id="pageLoaderStatus">Starting…</span></div></div>';
    document.body.appendChild(el);
    return el;
  }

  function startPageLoader(options){
    const loader = ensurePageLoader();
    const title = (options && options.title) || 'Loading data…';
    const badge = (options && options.badge) || 'Loading';
    const status = (options && options.status) || 'Starting…';
    const state = { value: 0, done: false, timer: null };
    loader.dataset.active = '1';
    loader.classList.remove('hide');
    document.body.classList.add('page-loading');
    document.getElementById('pageLoaderTitle').textContent = title;
    document.getElementById('pageLoaderBadge').textContent = badge;
    function set(value, label){
      state.value = Math.max(0, Math.min(100, Math.round(value)));
      document.getElementById('pageLoaderFill').style.width = state.value + '%';
      document.getElementById('pageLoaderPercent').textContent = state.value + '%';
      if(label) document.getElementById('pageLoaderStatus').textContent = label;
    }
    set(5, status);
    state.timer = setInterval(function(){
      if(state.done) return;
      const next = state.value + (state.value < 35 ? 11 : state.value < 68 ? 6 : 3);
      set(Math.min(92, next), state.value < 35 ? 'Connecting…' : state.value < 68 ? 'Loading rows…' : 'Preparing view…');
    }, 140);
    return {
      set: set,
      finish: function(label){
        if(state.done) return;
        state.done = true;
        clearInterval(state.timer);
        set(100, label || 'Ready');
        setTimeout(function(){
          loader.classList.add('hide');
          document.body.classList.remove('page-loading');
          setTimeout(function(){ if(loader.parentNode && loader.classList.contains('hide')) loader.remove(); }, 260);
        }, 180);
      }
    };
  }

  window.APP = {
    cfg,
    apiGet,
    apiPost,
    getToken,
    setToken,
    clearToken,
    fetchMe,
    requireUser,
    requireAdmin,
    logout,
    escapeHtml,
    toBool,
    normalizeText,
    pct,
    colorFor,
    extractYouTubeId,
    getCache,
    setCache,
    startPageLoader
  };
})();
