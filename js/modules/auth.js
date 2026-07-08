import { getUsers, getLocalUsers, setCurrentUser } from './users.js';
import { set } from './app-context.js';

function findUserByLogin(usernameOrEmail) {
    if (!usernameOrEmail)
        return null;
    const norm = usernameOrEmail.toLowerCase().trim();
    var user = getUsers().find(function (u) {
        const email = (u.email || '').toLowerCase();
        const un = (u.username || '').toLowerCase();
        return (email === norm || un === norm || email.split('@')[0] === norm) && u.active !== false;
    });
    if (user)
        return user;
    return getLocalUsers().find(function (u) {
        return (u.username || '').toLowerCase() === norm && u.active !== false;
    });
}

async function showLogin() {
    document.getElementById('app').classList.remove('active');
    setCurrentUser(null);
    window.currentUser = null;
    try { await window.ApAuth.signOut(); } catch (e) { /* suppress */ }
    clearInterval(window._syncInterval);
    clearInterval(window._backupInterval);
    clearInterval(window._notifBadgeInterval);
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}

var _adminPinCallback = null;

function setAdminPinCallback(value) {
    _adminPinCallback = value;
}

var _auditSession = null;

function setAuditSession(value) {
    _auditSession = value;
}

/* ── PIN SYSTEM ──────────────────────────────────────────────
   Единый источник истины: ApDb (IndexedDB-кеш).
   localStorage — fallback/синхронизация.
   Все PIN хранятся в виде SHA-256 хеша.
   ────────────────────────────────────────────────────────── */

var PIN_LOG = '[SANAQ PIN]';

async function hashPin(pin) {
    var enc = new TextEncoder();
    var buf = await crypto.subtle.digest('SHA-256', enc.encode(pin));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
}

function _isLegacyPlain(val) {
    return typeof val === 'string' && /^\d{4,6}$/.test(val);
}

function _loadPins() {
    var ls = {}; var ap = null;
    try { ls = JSON.parse(localStorage.getItem('sanaq_user_pins') || '{}'); } catch (e) {}
    try { if (window.ApDb && window.ApDb.getAppData) ap = window.ApDb.getAppData('user_pins'); } catch (e) {}
    return { ls: ls, ap: ap };
}

function _savePinsToBoth(pins) {
    try { localStorage.setItem('sanaq_user_pins', JSON.stringify(pins)); } catch (e) {}
    try { if (window.ApDb && window.ApDb.setAppData) window.ApDb.setAppData('user_pins', pins); } catch (e) {}
}

function syncPins() {
    var s = _loadPins();
    var changed = false;
    if (!s.ap || typeof s.ap !== 'object') {
        if (Object.keys(s.ls).length > 0) {
            console.log(PIN_LOG, 'ApDb пуст — копируем из localStorage');
            _savePinsToBoth(s.ls);
        }
        return;
    }
    var all = new Set(Object.keys(s.ls).concat(Object.keys(s.ap)));
    all.forEach(function (id) {
        var lv = s.ls[id] || null;
        var av = s.ap[id] || null;
        if (lv !== av) {
            if (lv && !av) {
                console.log(PIN_LOG, 'Расхождение', id, ': localStorage содержит PIN, ApDb — нет. Принято: localStorage');
                s.ap[id] = lv; changed = true;
            } else if (av && !lv) {
                console.log(PIN_LOG, 'Расхождение', id, ': ApDb содержит PIN, localStorage — нет. Принято: ApDb');
                s.ls[id] = av; changed = true;
            } else if (lv && av && lv !== av) {
                console.log(PIN_LOG, 'Расхождение', id, ': разные PIN. Принято: ApDb');
                s.ls[id] = av; changed = true;
            }
        }
    });
    if (changed) _savePinsToBoth(s.ap);
}

async function migratePins() {
    var s = _loadPins();
    var pins = s.ap && typeof s.ap === 'object' ? s.ap : s.ls;
    var migrated = false;
    for (var id in pins) {
        if (_isLegacyPlain(pins[id])) {
            var h = await hashPin(pins[id]);
            console.log(PIN_LOG, 'Миграция', id, ': plain text → SHA-256');
            pins[id] = h;
            migrated = true;
        }
    }
    if (migrated) _savePinsToBoth(pins);
    return migrated;
}

async function initPins() {
    console.log(PIN_LOG, '── Инициализация ──');
    var cu = window.currentUser;
    if (cu && cu.id) console.log(PIN_LOG, 'Пользователь:', cu.name, '(id:', cu.id + ', role:', cu.role + ')');
    syncPins();
    return migratePins();
}

function getUserPin(userId) {
    if (!userId) { console.warn(PIN_LOG, 'getUserPin: нет userId'); return null; }
    try {
        var pins = window.ApDb && window.ApDb.getAppData ? window.ApDb.getAppData('user_pins') : null;
        var src = 'ApDb';
        if (!pins || typeof pins !== 'object') {
            pins = JSON.parse(localStorage.getItem('sanaq_user_pins') || '{}');
            src = 'localStorage';
        }
        var val = pins[userId] || null;
        console.log(PIN_LOG, 'getUserPin:', userId, '→', val ? 'найден (' + src + ')' : 'не найден');
        return val;
    } catch (e) {
        console.error(PIN_LOG, 'getUserPin error:', e);
        return null;
    }
}

async function saveUserPin(userId, pin) {
    if (!userId) { console.warn(PIN_LOG, 'saveUserPin: нет userId'); return; }
    try {
        var pins = (window.ApDb && window.ApDb.getAppData ? window.ApDb.getAppData('user_pins') : null) ||
                   JSON.parse(localStorage.getItem('sanaq_user_pins') || '{}');
        if (typeof pins !== 'object') pins = {};
        if (pin) {
            pins[userId] = await hashPin(pin);
            console.log(PIN_LOG, 'saveUserPin:', userId, '→ хеш сохранён');
        } else {
            delete pins[userId];
            console.log(PIN_LOG, 'saveUserPin:', userId, '→ PIN удалён');
        }
        _savePinsToBoth(pins);
    } catch (e) {
        console.error(PIN_LOG, 'saveUserPin error:', e);
    }
}

async function verifyPin(userId, enteredPin) {
    if (!userId || !enteredPin) { console.log(PIN_LOG, 'verifyPin: нет userId или PIN'); return false; }
    try {
        var stored = getUserPin(userId);
        if (!stored) { console.log(PIN_LOG, 'verifyPin:', userId, '→ PIN не найден'); return false; }
        if (_isLegacyPlain(stored)) {
            var ok = stored === enteredPin;
            if (ok) {
                var h = await hashPin(enteredPin);
                var pins = JSON.parse(localStorage.getItem('sanaq_user_pins') || '{}');
                pins[userId] = h;
                _savePinsToBoth(pins);
                console.log(PIN_LOG, 'verifyPin:', userId, '→ legacy PIN авто-мигрирован');
            } else {
                console.log(PIN_LOG, 'verifyPin:', userId, '→ legacy PIN НЕ совпал');
            }
            return ok;
        }
        var match = (await hashPin(enteredPin)) === stored;
        console.log(PIN_LOG, 'verifyPin:', userId, match ? '→ успех' : '→ НЕ совпал');
        return match;
    } catch (e) {
        console.error(PIN_LOG, 'verifyPin error:', e);
        return false;
    }
}

function hasPin(userId) {
    return !!getUserPin(userId);
}

set('saveUserPin', saveUserPin);
set('getUserPin', getUserPin);
set('verifyPin', verifyPin);
set('hasPin', hasPin);
set('initPins', initPins);
set('syncPins', syncPins);
set('migratePins', migratePins);
set('hashPin', hashPin);

export { findUserByLogin, showLogin, _adminPinCallback, setAdminPinCallback, _auditSession, setAuditSession, getUserPin, saveUserPin, verifyPin, hasPin, initPins, syncPins, migratePins, hashPin, _isLegacyPlain };
