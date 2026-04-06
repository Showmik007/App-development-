/**************** CONFIG ****************/
const APP_SETTINGS = {
  TOKEN_TTL_MINUTES: 60 * 24 * 7, // 7 days
  SHEETS: {
    USERS: "Users",
    ADMINS: "Admins",
    SESSIONS: "Sessions",
    TRACKER: "Tracker",
    TUTORIAL: "Tutorial",
    TUTORIAL_FALLBACK: "Tutotrial",
    PDF: "PDF",
    NOTICES: "Notices"
  }
};

/**************** UTIL ****************/
function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function nowISO() {
  return new Date().toISOString();
}

function sha256Hex_(text) {
  const raw = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    text,
    Utilities.Charset.UTF_8
  );
  return raw.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}

function sh_(name) {
  const s = SpreadsheetApp.getActive().getSheetByName(name);
  if (!s) throw new Error("Missing sheet tab: " + name);
  return s;
}

function optSh_(name) {
  return SpreadsheetApp.getActive().getSheetByName(name);
}

function tableIndex_(sh) {
  const header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const idx = {};
  header.forEach((h, i) => idx[String(h).trim()] = i);
  return idx;
}

function rowObjectsFromSheet_(sh) {
  const values = sh.getDataRange().getValues();
  if (!values || values.length < 2) return [];
  const header = values[0].map(h => String(h).trim());
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const obj = {};
    for (let j = 0; j < header.length; j++) obj[header[j]] = values[i][j];
    rows.push(obj);
  }
  return rows;
}

/**************** SESSIONS ****************/
function createSession_(principal, type) {
  const sh = sh_(APP_SETTINGS.SHEETS.SESSIONS);
  const token = Utilities.getUuid().replace(/-/g, "");
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + APP_SETTINGS.TOKEN_TTL_MINUTES * 60 * 1000);

  sh.appendRow([
    token,
    principal,
    type,
    createdAt.toISOString(),
    expiresAt.toISOString(),
    true
  ]);

  return { token: token, expiresAt: expiresAt.toISOString() };
}

function validateSession_(token, requiredType) {
  if (!token) return { ok: false, reason: "Missing token" };

  const sh = sh_(APP_SETTINGS.SHEETS.SESSIONS);
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return { ok: false, reason: "No sessions" };

  const idx = tableIndex_(sh);
  const t = String(token).trim();
  const now = new Date();

  for (let r = values.length - 1; r >= 1; r--) {
    const row = values[r];
    if (String(row[idx["token"]] || "") !== t) continue;

    const isActive = String(row[idx["isActive"]]).toUpperCase() !== "FALSE";
    const expiresAt = new Date(row[idx["expiresAt"]] || 0);
    const type = String(row[idx["type"]] || "");
    const principal = String(row[idx["principal"]] || "");

    if (!isActive) return { ok: false, reason: "Logged out" };
    if (now > expiresAt) return { ok: false, reason: "Expired" };
    if (requiredType && type !== requiredType) return { ok: false, reason: "Wrong session type" };

    return { ok: true, principal: principal, type: type };
  }

  return { ok: false, reason: "Invalid token" };
}

function logoutSession_(token) {
  const sh = sh_(APP_SETTINGS.SHEETS.SESSIONS);
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return false;

  const idx = tableIndex_(sh);
  const t = String(token).trim();

  for (let r = values.length - 1; r >= 1; r--) {
    if (String(values[r][idx["token"]] || "") === t) {
      sh.getRange(r + 1, idx["isActive"] + 1).setValue(false);
      return true;
    }
  }
  return false;
}

/**************** USER LOOKUPS ****************/
function getUsernameByUserId_(userId){
  userId = String(userId || "").trim();
  if(!userId) return "";

  const sh = sh_(APP_SETTINGS.SHEETS.USERS);
  const idx = tableIndex_(sh);
  const values = sh.getDataRange().getValues();

  for(let r = 1; r < values.length; r++){
    if(String(values[r][idx["userId"]] || "").trim() === userId){
      return String(values[r][idx["username"]] || "").trim();
    }
  }
  return "";
}

/**************** LOGIN ****************/
function userLoginById_(userId, password) {
  userId = String(userId || "").trim();
  password = String(password || "");

  if (!userId || !password) return { ok: false, error: "User ID / password required" };

  const sh = sh_(APP_SETTINGS.SHEETS.USERS);
  const idx = tableIndex_(sh);
  const values = sh.getDataRange().getValues();

  let rowNum = null;
  for (let r = 1; r < values.length; r++) {
    const id = String(values[r][idx["userId"]] || "").trim();
    if (id === userId) { rowNum = r + 1; break; }
  }
  if (!rowNum) return { ok: false, error: "Invalid credentials" };

  const isActive = String(sh.getRange(rowNum, idx["isActive"] + 1).getValue()).toUpperCase() !== "FALSE";
  if (!isActive) return { ok: false, error: "Account disabled" };

  const storedHash = String(sh.getRange(rowNum, idx["passwordHash"] + 1).getValue() || "");
  const passHash = sha256Hex_(password);

  if (!storedHash) {
    sh.getRange(rowNum, idx["passwordHash"] + 1).setValue(passHash);
  } else if (storedHash !== passHash) {
    return { ok: false, error: "Invalid credentials" };
  }

  if (idx["lastLoginAt"] != null) {
    sh.getRange(rowNum, idx["lastLoginAt"] + 1).setValue(nowISO());
  }

  const session = createSession_(userId, "user");
  return { ok: true, token: session.token, expiresAt: session.expiresAt, userId: userId };
}

function adminLogin_(username, password) {
  username = String(username || "").trim().toLowerCase();
  password = String(password || "");
  if (!username || !password) return { ok: false, error: "Username/password required" };

  const sh = sh_(APP_SETTINGS.SHEETS.ADMINS);
  const idx = tableIndex_(sh);
  const values = sh.getDataRange().getValues();

  let rowNum = null;
  for (let r = 1; r < values.length; r++) {
    const u = String(values[r][idx["username"]] || "").trim().toLowerCase();
    if (u === username) { rowNum = r + 1; break; }
  }
  if (!rowNum) return { ok: false, error: "Invalid credentials" };

  const isActive = String(sh.getRange(rowNum, idx["isActive"] + 1).getValue()).toUpperCase() !== "FALSE";
  if (!isActive) return { ok: false, error: "Account disabled" };

  const storedHash = String(sh.getRange(rowNum, idx["passwordHash"] + 1).getValue() || "");
  const passHash = sha256Hex_(password);

  if (!storedHash) {
    sh.getRange(rowNum, idx["passwordHash"] + 1).setValue(passHash);
  } else if (storedHash !== passHash) {
    return { ok: false, error: "Invalid credentials" };
  }

  if (idx["lastLoginAt"] != null) {
    sh.getRange(rowNum, idx["lastLoginAt"] + 1).setValue(nowISO());
  }

  const session = createSession_(username, "admin");
  return { ok: true, token: session.token, expiresAt: session.expiresAt, username: username };
}

/**************** ADMIN ACTIONS ****************/
function adminListUsers_(token) {
  const s = validateSession_(token, "admin");
  if (!s.ok) return { ok: false, error: s.reason };

  const sh = sh_(APP_SETTINGS.SHEETS.USERS);
  const idx = tableIndex_(sh);
  const values = sh.getDataRange().getValues();
  const out = [];

  for (let r = 1; r < values.length; r++) {
    out.push({
      userId: values[r][idx["userId"]] || "",
      username: values[r][idx["username"]] || "",
      isActive: String(values[r][idx["isActive"]]).toUpperCase() !== "FALSE",
      createdAt: values[r][idx["createdAt"]] || "",
      lastLoginAt: values[r][idx["lastLoginAt"]] || ""
    });
  }

  return { ok: true, users: out };
}

function adminCreateUser_(token, userId, username, password) {
  const s = validateSession_(token, "admin");
  if (!s.ok) return { ok: false, error: s.reason };

  userId = String(userId || "").trim();
  username = String(username || "").trim();
  password = String(password || "");
  if (!userId || !username || !password) return { ok: false, error: "userId/username/password required" };

  const sh = sh_(APP_SETTINGS.SHEETS.USERS);
  const idx = tableIndex_(sh);
  const values = sh.getDataRange().getValues();

  for (let r = 1; r < values.length; r++) {
    if (String(values[r][idx["userId"]] || "").trim() === userId) {
      return { ok: false, error: "User ID already exists" };
    }
  }

  const passHash = sha256Hex_(password);
  sh.appendRow([userId, username, passHash, true, nowISO(), ""]);
  return { ok: true };
}

function adminResetPassword_(token, userId, newPassword) {
  const s = validateSession_(token, "admin");
  if (!s.ok) return { ok: false, error: s.reason };

  userId = String(userId || "").trim();
  newPassword = String(newPassword || "");
  if (!userId || !newPassword) return { ok: false, error: "userId/newPassword required" };

  const sh = sh_(APP_SETTINGS.SHEETS.USERS);
  const idx = tableIndex_(sh);
  const values = sh.getDataRange().getValues();

  for (let r = 1; r < values.length; r++) {
    if (String(values[r][idx["userId"]] || "").trim() === userId) {
      sh.getRange(r + 1, idx["passwordHash"] + 1).setValue(sha256Hex_(newPassword));
      return { ok: true };
    }
  }
  return { ok: false, error: "User not found" };
}

function changeUserPasswordByToken_(token, newPassword) {
  const s = validateSession_(token, "user");
  if (!s.ok) return { ok: false, error: s.reason };

  if (!newPassword || newPassword.length < 4) {
    return { ok: false, error: "Password too short (min 4)" };
  }

  const userId = s.principal;
  const sh = sh_(APP_SETTINGS.SHEETS.USERS);
  const idx = tableIndex_(sh);
  const values = sh.getDataRange().getValues();

  for (let r = 1; r < values.length; r++) {
    if (String(values[r][idx["userId"]] || "").trim() === String(userId)) {
      sh.getRange(r + 1, idx["passwordHash"] + 1).setValue(sha256Hex_(newPassword));
      if (idx["mustChangePassword"] != null) {
        sh.getRange(r + 1, idx["mustChangePassword"] + 1).setValue(false);
      }
      return { ok: true };
    }
  }
  return { ok: false, error: "User not found" };
}

/**************** TRACKER / TUTORIAL API ****************/
function getTrackerRows_(sheetName) {
  sheetName = String(sheetName || APP_SETTINGS.SHEETS.TRACKER).trim();
  const sh = optSh_(sheetName);
  if (!sh) return { ok: false, error: "Missing sheet tab: " + sheetName };
  return { ok: true, rows: rowObjectsFromSheet_(sh) };
}

function getTutorialRows_(sheetName) {
  sheetName = String(sheetName || APP_SETTINGS.SHEETS.TUTORIAL).trim();
  const fallbackName = APP_SETTINGS.SHEETS.TUTORIAL_FALLBACK;
  const sh = optSh_(sheetName) || (sheetName === APP_SETTINGS.SHEETS.TUTORIAL && fallbackName ? optSh_(fallbackName) : null);
  if (!sh) return { ok: false, error: "Missing sheet tab: " + sheetName };
  return { ok: true, rows: rowObjectsFromSheet_(sh) };
}

function getNoticeRows_(sheetName) {
  sheetName = String(sheetName || APP_SETTINGS.SHEETS.NOTICES).trim();
  const sh = optSh_(sheetName);
  if (!sh) return { ok: false, error: "Missing sheet tab: " + sheetName };
  return { ok: true, rows: rowObjectsFromSheet_(sh) };
}

/**************** ROUTES ****************/
function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || "").toLowerCase();

  if (action === "tutorial_list") {
    const token = (e.parameter && e.parameter.token) || "";
    const s = validateSession_(token, "user");
    if (!s.ok) return jsonOut({ ok:false, error:s.reason });
    const sheetName = (e.parameter && e.parameter.sheet) || APP_SETTINGS.SHEETS.TUTORIAL;
    return jsonOut(getTutorialRows_(sheetName));
  }

  if (action === "notice_list") {
    const token = (e.parameter && e.parameter.token) || "";
    const s = validateSession_(token, "user");
    if (!s.ok) return jsonOut({ ok:false, error:s.reason });
    const sheetName = (e.parameter && e.parameter.sheet) || APP_SETTINGS.SHEETS.NOTICES;
    return jsonOut(getNoticeRows_(sheetName));
  }

  if (action === "user_change_password_get") {
    const token = String((e.parameter && e.parameter.token) || "").trim();
    const newPassword = String((e.parameter && e.parameter.newPassword) || "");
    return jsonOut(changeUserPasswordByToken_(token, newPassword));
  }

  if (action === "user_login_get") {
    const userId = (e.parameter && e.parameter.userId) || "";
    const password = (e.parameter && e.parameter.password) || "";
    return jsonOut(userLoginById_(userId, password));
  }

  if (action === "ping") return jsonOut({ ok: true, time: nowISO() });

  if (action === "me") {
    const token = (e.parameter && e.parameter.token) || "";
    const s = validateSession_(token, null);
    if (!s.ok) return jsonOut({ ok: false, error: s.reason });

    if (s.type === "user") {
      const username = getUsernameByUserId_(s.principal);
      return jsonOut({ ok: true, principal: s.principal, type: s.type, username: username });
    }

    return jsonOut({ ok: true, principal: s.principal, type: s.type });
  }

  if (action === "tracker") {
    const token = (e.parameter && e.parameter.token) || "";
    const s = validateSession_(token, "user");
    if (!s.ok) return jsonOut({ ok:false, error:s.reason });

    const sheetName = (e.parameter && e.parameter.sheet) || APP_SETTINGS.SHEETS.TRACKER;
    return jsonOut(getTrackerRows_(sheetName));
  }

  if (action === "admin_list_users") {
    return jsonOut(adminListUsers_((e.parameter && e.parameter.token) || ""));
  }

  if (action === "logout") {
    const token = String((e.parameter && e.parameter.token) || "").trim();
    if (!token) return jsonOut({ ok: false, error: "Token required" });
    return jsonOut({ ok: logoutSession_(token) });
  }

  return jsonOut({ ok: false, error: "Unknown action" });
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse((e && e.postData && e.postData.contents) || "{}"); } catch (err) {}

  const action = String(body.action || "").toLowerCase();

  if (action === "user_change_password") {
    const token = String(body.token || "").trim();
    const newPassword = String(body.newPassword || "");
    return jsonOut(changeUserPasswordByToken_(token, newPassword));
  }

  if (action === "user_login") {
    return jsonOut(userLoginById_(body.userId, body.password));
  }

  if (action === "admin_login") {
    return jsonOut(adminLogin_(body.username, body.password));
  }

  if (action === "logout") {
    const token = String(body.token || "").trim();
    if (!token) return jsonOut({ ok: false, error: "Token required" });
    return jsonOut({ ok: logoutSession_(token) });
  }

  if (action === "admin_create_user") {
    return jsonOut(adminCreateUser_(body.token, body.userId, body.username, body.password));
  }

  if (action === "admin_reset_password") {
    return jsonOut(adminResetPassword_(body.token, body.userId, body.newPassword));
  }

  return jsonOut({ ok: false, error: "Unknown action" });
}
