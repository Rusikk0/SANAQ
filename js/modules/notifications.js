import { getProducts } from './products.js';
import { getShifts } from './shifts.js';
import { set } from './app-context.js';



function toast(msg, type) {
    const el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = msg;
    document.getElementById('toasts').appendChild(el);
    setTimeout(function () {
        el.remove();
    }, type === 'err' ? 5000 : 3500);
}

function requestNotificationPermission() {
    if (!('Notification' in window))
        return;
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(function (perm) {
            if (perm === 'granted') {
                toast('Уведомления включены', 'ok');
            }
        }).catch(function () {});
    }
}

function sendNotification(title, body, tag) {
    if (!('Notification' in window) || Notification.permission !== 'granted')
        return;
    var key = 'ap_notif_' + (tag || title);
    var last = parseInt(localStorage.getItem(key) || '0');
    if (Date.now() - last < 3600000)
        return;
    localStorage.setItem(key, String(Date.now()));
    try {
        new Notification(title, {
            body: body,
            icon: 'icons/icon-192.png',
            badge: 'icons/icon-192.png',
            tag: tag || title,
            vibrate: [
                200,
                100,
                200
            ]
        });
    } catch (e) {
        console.warn('[Notif] Error:', e);
    }
}

function checkLowStockNotification() {
    var products = getProducts();
    var lowItems = products.filter(function (p) {
        return p.quantity <= (p.minStock || 5);
    });
    if (lowItems.length > 0) {
        var names = lowItems.slice(0, 3).map(function (p) {
            return p.name;
        }).join(', ');
        var extra = lowItems.length > 3 ? ' и ещё ' + (lowItems.length - 3) : '';
        sendNotification('\u26A0️ Низкий остаток', lowItems.length + ' товаров: ' + names + extra, 'low_stock');
    }
}

function updateNotifBadge() {
    var products = getProducts();
    var lowCount = products.filter(function (p) {
        return p.quantity <= (p.minStock || 5);
    }).length;
    var shifts = getShifts();
    var openCount = shifts.filter(function (s) {
        return s.status === 'open';
    }).length;
    var total = lowCount + openCount;
    var badge = document.getElementById('notif-badge');
    if (badge) {
        if (total > 0) {
            badge.style.display = 'inline';
            badge.textContent = total > 99 ? '99+' : total;
        } else {
            badge.style.display = 'none';
        }
    }
}




set('toast', toast);
window.toast = toast; // Expose globally for legacy IIFE code (ap-db.js etc.)

export { toast, requestNotificationPermission, sendNotification, checkLowStockNotification, updateNotifBadge };
