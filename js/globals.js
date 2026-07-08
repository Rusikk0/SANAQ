import * as auth from './modules/auth.js';
import * as cart from './modules/cart.js';
import * as categories from './modules/categories.js';
import * as constants from './modules/constants.js';
import * as customers from './modules/customers.js';
import * as debts from './modules/debts.js';
import * as documents from './modules/documents.js';
import * as expenses from './modules/expenses.js';
import * as helpers from './modules/helpers.js';
import * as notifications from './modules/notifications.js';
import * as offline from './modules/offline.js';
import * as products from './modules/products.js';
import * as promotions from './modules/promotions.js';
import * as reports from './modules/reports.js';
import * as returns from './modules/returns.js';
import * as sales from './modules/sales.js';
import * as settings from './modules/settings.js';
import * as shifts from './modules/shifts.js';
import * as statistics from './modules/statistics.js';
import * as store from './modules/store.js';
import * as sync from './modules/sync.js';
import * as ui from './modules/ui.js';
import * as users from './modules/users.js';
import * as utils from './modules/utils.js';

Object.assign(window, auth);
Object.assign(window, cart);
Object.assign(window, categories);
Object.assign(window, constants);
Object.assign(window, customers);
Object.assign(window, debts);
Object.assign(window, documents);
Object.assign(window, expenses);
Object.assign(window, helpers);
Object.assign(window, notifications);
Object.assign(window, offline);
Object.assign(window, products);
Object.assign(window, promotions);
Object.assign(window, reports);
Object.assign(window, returns);
Object.assign(window, sales);
Object.assign(window, settings);
Object.assign(window, shifts);
Object.assign(window, statistics);
Object.assign(window, store);
Object.assign(window, sync);
Object.assign(window, ui);
Object.assign(window, users);
Object.assign(window, utils);

try {
    ui.boot();
} catch (e) {
    document.body.innerHTML = '<div style="padding:40px;max-width:600px;margin:auto;font-family:sans-serif">' +
        '<h2 style="color:#EF4444">Ошибка загрузки</h2>' +
        '<p style="color:#666;margin-bottom:16px">Приложение не смогло запуститься.</p>' +
        '<pre style="background:#f5f5f5;padding:16px;border-radius:8px;overflow:auto;font-size:13px;white-space:pre-wrap">' +
        (e && e.message ? e.message + '\n' + (e.stack || '') : String(e)) + '</pre>' +
        '<p style="color:#999;font-size:12px;margin-top:12px">Возможная причина: открытие index.html через file://. ' +
        'Запустите локальный сервер (npx serve, python -m http.server) или проверьте консоль браузера (F12).</p></div>';
    throw e;
}
