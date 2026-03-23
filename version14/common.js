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
    setCache
  };
})();
