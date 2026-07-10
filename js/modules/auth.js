import { getUsers, getLocalUsers, setCurrentUser } from './users.js';
import { set } from './app-context.js';

function findUserByLogin(usernameOrEmail) {
    if (!usernameOrEmail) return null;
    const norm = usernameOrEmail.toLowerCase().trim();
    const user = getUsers().find(function (u) {
        const email = (u.email || '').toLowerCase();
        const un = (u.username || '').toLowerCase();
        return (email === norm || un === norm || email.split('@')[0] === norm) && u.active !== false;
    });
    if (user) return user;
    return getLocalUsers().find(u => (u.username || '').toLowerCase() === norm && u.active !== false);
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

let _adminPinCallback = null;

function setAdminPinCallback(value) {
    _adminPinCallback = value;
}

let _auditSession = null;

function setAuditSession(value) {
    _auditSession = value;
}

function getUserPin(userId) {
    if (!userId) return null;
    try {
        const pins = window.ApDb && window.ApDb.getAppData ? window.ApDb.getAppData('user_pins') : null;
        if (!pins)
            pins = JSON.parse(localStorage.getItem('sanaq_user_pins') || '{}');
        return pins[userId] || null;
    } catch (e) {
        return null;
    }
}

function saveUserPin(userId, pin) {
    try {
        const pins = JSON.parse(localStorage.getItem('sanaq_user_pins') || '{}');
        if (pin)
            pins[userId] = pin;
        else
            delete pins[userId];
        localStorage.setItem('sanaq_user_pins', JSON.stringify(pins));
        if (window.ApDb && window.ApDb.setAppData)
            window.ApDb.setAppData('user_pins', pins);
    } catch (e) {
    }
}

set('saveUserPin', saveUserPin);
set('getUserPin', getUserPin);
export { findUserByLogin, showLogin, _adminPinCallback, setAdminPinCallback, _auditSession, setAuditSession, getUserPin, saveUserPin };
