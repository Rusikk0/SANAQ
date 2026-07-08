import { currentUser, isAdmin } from './users.js';
import { refreshAll } from './ui.js';
import { toast } from './notifications.js';
import { confirmAction, getCurrentStoreName } from './utils.js';
import { getProducts, setProducts } from './products.js';
import { getCategories, setCategories } from './categories.js';
import { getSales, getDeferred, setDeferred } from './sales.js';
import { getExpenses } from './expenses.js';
import { getShifts } from './shifts.js';
import { getCustomers, setCustomers } from './customers.js';
import { getDebtors, getDebts, setDebtors, setDebts } from './debts.js';



async function syncWithSupabase() {
    if (!currentUser || !window.ApDb)
        return;
    try {
        await window.ApDb.refresh();
        refreshAll();
    } catch (e) {
        console.error('Sync error:', e);
    }
}

var _postSaveSyncTimer = null;

function _schedulePostSaveSync() {
    if (_postSaveSyncTimer)
        clearTimeout(_postSaveSyncTimer);
    _postSaveSyncTimer = setTimeout(function () {
        if (window.ApDb && typeof window.ApDb.refresh === 'function') {
            window.ApDb.refresh().catch(function () {
            });
        }
    }, 4000);
}




function syncFromPurchase() {
    var purchase = parseFloat(document.getElementById('product-purchase').value) || 0;
    var markup = parseFloat(document.getElementById('product-markup').value) || 0;
    if (purchase > 0 && markup > 0) {
        var price = purchase * (1 + markup / 100);
        document.getElementById('product-price').value = price.toFixed(2);
    }
}

function syncFromMarkup() {
    var purchase = parseFloat(document.getElementById('product-purchase').value) || 0;
    var markup = parseFloat(document.getElementById('product-markup').value) || 0;
    if (purchase > 0 && markup >= 0) {
        var price = purchase * (1 + markup / 100);
        document.getElementById('product-price').value = price.toFixed(2);
    }
}

function syncFromPrice() {
    var purchase = parseFloat(document.getElementById('product-purchase').value) || 0;
    var price = parseFloat(document.getElementById('product-price').value) || 0;
    if (purchase > 0 && price >= purchase) {
        var markup = (price - purchase) / purchase * 100;
        document.getElementById('product-markup').value = markup.toFixed(2);
    } else if (purchase > 0) {
        document.getElementById('product-markup').value = '0';
    }
}

function importStoreBackup() {
    if (!isAdmin()) {
        toast('Только администратор', 'err');
        return;
    }
    var input = document.getElementById('backup-import-file');
    var file = input && input.files && input.files[0];
    if (!file) {
        toast('Выберите файл .json', 'err');
        return;
    }
    var replace = document.getElementById('backup-replace-all') && document.getElementById('backup-replace-all').checked;
    confirmAction('Восстановить из копии?', replace ? 'Все текущие данные магазина будут заменены содержимым файла. Продолжить?' : 'Данные из файла будут загружены. Рекомендуется включить \xABЗаменить всё\xBB для полного восстановления.', async function () {
        try {
            await window.ApBackup.importBackup(file, replace);
            input.value = '';
        } catch (e) {
            toast(e.message || String(e), 'err');
        }
    });
}

var autoBackupKey = 'ap_auto_backup_ts';

function autoBackup() {
    try {
        var store = getCurrentStoreName();
        var data = {
            ts: Date.now(),
            products: getProducts(),
            categories: getCategories(),
            sales: getSales(),
            expenses: getExpenses(),
            shifts: getShifts(),
            customers: getCustomers(),
            debtors: getDebtors(),
            debts: getDebts(),
            deferred: getDeferred()
        };
        localStorage.setItem('ap_auto_backup_' + store, JSON.stringify(data));
        localStorage.setItem(autoBackupKey, String(Date.now()));
        if (typeof toast === 'function')
            toast('\uD83D\uDCBE Авто-резервная копия создана', 'ok');
    } catch (e) {
        console.warn('[AutoBackup]', e);
    }
}

function restoreAutoBackup() {
    try {
        var store = getCurrentStoreName();
        var raw = localStorage.getItem('ap_auto_backup_' + store);
        if (!raw)
            return;
        var data = JSON.parse(raw);
        var age = Date.now() - (data.ts || 0);
        if (age > 86400000) {
            localStorage.removeItem('ap_auto_backup_' + store);
            return;
        }
        if (getProducts().length === 0 && data.products && data.products.length > 0) {
            setProducts(data.products);
            if (data.categories)
                setCategories(data.categories);
            if (data.customers)
                setCustomers(data.customers);
            if (data.debtors)
                setDebtors(data.debtors);
            if (data.debts)
                setDebts(data.debts);
            if (data.deferred)
                setDeferred(data.deferred);
            toast('\uD83D\uDCBE Данные восстановлены из авто-копии', 'ok');
        }
    } catch (e) {
    }
}



export { syncWithSupabase, _postSaveSyncTimer, _schedulePostSaveSync, syncFromPurchase, syncFromMarkup, syncFromPrice, importStoreBackup, autoBackupKey, autoBackup, restoreAutoBackup };
