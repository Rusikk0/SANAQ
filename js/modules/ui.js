import { closeModal, getCurrentStoreName, filterByPeriod, card, fmt, tableHTML, finCard, fmtDate, esc, switchAuditsTab, confirmAction, updateBulkBar } from './utils.js';
import { set } from './app-context.js';
import { isAdmin, checkPermission, hasGroupPermission, currentUser, setCurrentUser, posCashierName, renderCashiersPage, getOpenShiftForCashier, getUsers, getLocalUsers, setLocalUsers } from './users.js';
import { getProducts, handleBarcodeScan, renderProducts, fillSaleProducts, setProducts, migrateProducts, migrateBarcodes } from './products.js';
import { getSales, isSaleActive, groupSalesIntoReceipts, badgePay, renderSalesToday, renderSalesHeatmap, renderMostExpensiveReceipt, getWriteOffs, getAudits, getDeferred, updateSaleShiftBanner, addAuditLog, clearSaleSelection, focusSaleSearch, migrateDeferredData, renderDeferred, PAY_LABELS, migrateSalesRecords, renderPosProducts } from './sales.js';
import { getExpenses, renderExpenses } from './expenses.js';
import { getDocuments, renderDocuments } from './documents.js';
import { getCategories, setCategories, renderCategoriesPage } from './categories.js';
import { getDebts, migrateDebtData, renderDebts } from './debts.js';
import { _statsPeriod, renderStatistics, _posBrowserState, _posCatModalState } from './statistics.js';
import { toast, updateNotifBadge, requestNotificationPermission, checkLowStockNotification } from './notifications.js';
import { getShifts, renderMyShiftPage } from './shifts.js';
import { getUISettings, applyUISettings, _uiSettings, saveUISettings } from './settings.js';
import { currentStoreId, scanLastKey, scanBuffer, confirmCallback, _bulkSelected, setStore } from './store.js';
import { SCAN_MAX_GAP, ROLE_LABELS } from './constants.js';
import { updateOfflineBanner } from './offline.js';
import { getUserPin, showLogin, findUserByLogin } from './auth.js';
import { renderPromotionsPage, getPromotions, setPromotions } from './promotions.js';
import { renderCustomers } from './customers.js';
import { openReturnSelector } from './returns.js';
import { syncWithSupabase, autoBackup, restoreAutoBackup } from './sync.js';



function _closeParentModals() {
    var parents = [
        'modal-view-document',
        'modal-create-invoice',
        'modal-create-z2',
        'modal-create-sf'
    ];
    window._templateParentModal = '';
    parents.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.classList.contains('show')) {
            window._templateParentModal = id;
            closeModal(id);
        }
    });
}

function _reopenParentModal() {
    if (window._templateParentModal) {
        openModal(window._templateParentModal);
        window._templateParentModal = '';
    }
}

function uid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID)
        return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : r & 3 | 8;
        return v.toString(16);
    });
}

function openModal(id) {
    document.getElementById(id).classList.add('show');
}

function renderStoreUI() {
    const mobTitle = document.getElementById('mobile-store-title');
    if (mobTitle)
        mobTitle.textContent = getCurrentStoreName();
}

function applyRoleUI() {
    document.querySelectorAll('.admin-only').forEach(function (el) {
        if (isAdmin())
            el.classList.remove('hidden-role');
        else
            el.classList.add('hidden-role');
    });
    document.querySelectorAll('.cashier-only').forEach(function (el) {
        if (isAdmin())
            el.classList.add('hidden-role');
        else
            el.classList.remove('hidden-role');
    });
    document.querySelectorAll('[data-perm]').forEach(function (el) {
        var perm = el.getAttribute('data-perm');
        if (!checkPermission(perm))
            el.classList.add('hidden-role');
        else
            el.classList.remove('hidden-role');
    });
    document.querySelectorAll('.nav-btn[data-page]').forEach(function (el) {
        var page = el.getAttribute('data-page');
        if (!hasGroupPermission(page))
            el.classList.add('hidden-role');
        else
            el.classList.remove('hidden-role');
    });
}

function renderDashboard() {
    const period = (document.getElementById('dash-period-filter') || {}).value || 'all';
    const products = getProducts();
    const low = products.filter(function (p) {
        return p.quantity <= (p.minStock || 5);
    });
    const allSales = getSales().filter(isSaleActive);
    const sales = filterByPeriod(allSales, 'date', period);
    const expenses = filterByPeriod(getExpenses(), 'date', period).filter(function (e) {
        return e.status !== 'cancelled';
    });
    const docs = getDocuments();
    document.getElementById('dash-date').textContent = new Date().toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    var totalRevenue = 0, totalCash = 0, totalKaspi = 0, totalTransfer = 0, totalCOGS = 0, salesQty = 0;
    var productSalesMap = {};
    var categorySalesMap = {};
    sales.forEach(function (s) {
        if (Number(s.total) > 0)
            totalRevenue += Number(s.total);
        if (s.payment === 'cash')
            totalCash += Number(s.total) || 0;
        else if (s.payment === 'kaspi')
            totalKaspi += Number(s.total) || 0;
        else if (s.payment === 'transfer')
            totalTransfer += Number(s.total) || 0;
        totalCOGS += (Number(s.purchasePrice) || 0) * (Number(s.quantity) || 0);
        salesQty += Number(s.quantity) || 0;
        var pName = s.productName || '\u2014';
        if (!productSalesMap[pName])
            productSalesMap[pName] = {
                qty: 0,
                total: 0,
                name: pName,
                category: ''
            };
        productSalesMap[pName].qty += Number(s.quantity) || 0;
        productSalesMap[pName].total += Number(s.total) || 0;
        if (s.productId) {
            var prod = products.find(function (p) {
                return p.id === s.productId;
            });
            if (prod) {
                productSalesMap[pName].category = prod.category || '';
                var catName = '';
                var catObj = getCategories().find(function (c) {
                    return c.id === prod.category;
                });
                catName = catObj ? catObj.name : 'Без категории';
                if (!categorySalesMap[catName])
                    categorySalesMap[catName] = {
                        qty: 0,
                        total: 0
                    };
                categorySalesMap[catName].qty += Number(s.quantity) || 0;
                categorySalesMap[catName].total += Number(s.total) || 0;
            }
        }
    });
    var totalExpenses = expenses.reduce(function (sum, e) {
        return sum + (Number(e.amount) || 0);
    }, 0);
    var allDebts = getDebts();
    var activeDebts = allDebts.filter(function (d) {
        return d.status === 'open' && d.amount > 0;
    });
    var totalDebtAmount = activeDebts.reduce(function (sum, d) {
        return sum + (Number(d.amount) || 0);
    }, 0);
    var docCounts = {};
    docs.forEach(function (d) {
        var dt = d.type || d.docType || 'other';
        docCounts[dt] = (docCounts[dt] || 0) + 1;
    });
    var docTypeLabels = {
        invoice: 'Счета',
        z2: 'Накладные З-2',
        invoice_sf: 'Счёт-фактуры',
        deferred: 'Отложенные'
    };
    var docsTotalSum = docs.reduce(function (sum, d) {
        return sum + (Number(d.total) || 0);
    }, 0);
    var salesCount = sales.length;
    document.getElementById('dash-cards').innerHTML = card('\uD83D\uDCE6 Товаров', products.length, '') + card('\uD83D\uDED2 Продаж', salesCount + ' (' + fmt(totalRevenue) + ' \u20B8)', 'ok') + card('\uD83D\uDCB5 Наличные', fmt(totalCash), 'cash') + card('\uD83D\uDCF1 Kaspi QR', fmt(totalKaspi), 'kaspi') + card('\uD83C\uDFE6 Банк', fmt(totalTransfer), 'bank') + card('\uD83D\uDCB0 Выручка', fmt(totalRevenue), 'ok') + card('\uD83D\uDCC9 Расходы', fmt(totalExpenses), 'warn') + card('\uD83D\uDCCB Долги', fmt(totalDebtAmount), 'err');
    var topProducts = Object.keys(productSalesMap).map(function (k) {
        return productSalesMap[k];
    });
    topProducts.sort(function (a, b) {
        return b.qty - a.qty;
    });
    topProducts = topProducts.slice(0, 15);
    var topEl = document.getElementById('dash-top-products');
    if (topProducts.length) {
        var maxQty = topProducts[0] ? topProducts[0].qty : 1;
        topEl.innerHTML = topProducts.map(function (p) {
            var pct = Math.round(p.qty / maxQty * 100);
            return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px">' + '<div style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(p.name) + '</div>' + '<div style="width:100px;background:var(--bg3);border-radius:4px;height:16px;position:relative;overflow:hidden">' + '<div style="position:absolute;top:0;left:0;height:100%;width:' + pct + '%;background:var(--accent);border-radius:4px;opacity:0.6"></div>' + '</div>' + '<div style="min-width:40px;text-align:right;font-weight:600">' + p.qty + '</div>' + '</div>';
        }).join('');
    } else {
        topEl.innerHTML = '<div class="empty">Нет данных о продажах</div>';
    }
    var catEl = document.getElementById('dash-category-breakdown');
    var catEntries = Object.keys(categorySalesMap).map(function (k) {
        return {
            name: k,
            qty: categorySalesMap[k].qty,
            total: categorySalesMap[k].total
        };
    });
    catEntries.sort(function (a, b) {
        return b.total - a.total;
    });
    if (catEntries.length) {
        var maxCatTotal = catEntries[0] ? catEntries[0].total : 1;
        catEl.innerHTML = tableHTML([
            'Категория',
            'Кол-во',
            'Сумма'
        ], catEntries.map(function (c) {
            var barW = Math.round(c.total / maxCatTotal * 100);
            return [
                c.name,
                c.qty,
                '<div style="display:flex;align-items:center;gap:6px"><div style="width:60px;background:var(--bg3);border-radius:3px;height:12px;overflow:hidden"><div style="height:100%;width:' + barW + '%;background:var(--accent);border-radius:3px;opacity:0.5"></div></div>' + fmt(c.total) + '</div>'
            ];
        }));
    } else {
        catEl.innerHTML = '<div class="empty">Нет данных</div>';
    }
    var netBalance = totalRevenue - totalExpenses - totalDebtAmount;
    var reportEl = document.getElementById('dash-financial-report');
    reportEl.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">' + finCard('\uD83D\uDED2 Сумма продаж', fmt(totalRevenue) + ' \u20B8', 'ok') + finCard('\uD83D\uDCC4 Сумма по документам', fmt(docsTotalSum) + ' \u20B8', '') + finCard('\uD83D\uDCC9 Сумма расходов', fmt(totalExpenses) + ' \u20B8', 'warn') + finCard('\uD83D\uDCCB Активные долги', fmt(totalDebtAmount) + ' \u20B8', 'err') + finCard('\uD83D\uDC8E Чистый баланс', fmt(Math.abs(netBalance)) + ' \u20B8', netBalance >= 0 ? 'ok' : 'err') + '</div>' + '<div style="margin-top:12px;font-size:13px;color:var(--text-muted)">' + Object.keys(docTypeLabels).map(function (t) {
        var cnt = docCounts[t] || 0;
        return docCounts[t] ? '<span style="margin-right:16px">' + docTypeLabels[t] + ': <strong>' + cnt + '</strong></span>' : '';
    }).join('') + (docs.length ? '<span>Всего документов: <strong>' + docs.length + '</strong></span>' : '') + '</div>';
    document.getElementById('dash-lowstock').innerHTML = low.length ? tableHTML([
        'Код',
        'Название',
        'Остаток',
        'Мин.'
    ], low.map(function (p) {
        return [
            '<span class="code-tag">' + (p.code || '\u2014') + '</span>',
            p.name,
            '<span class="low-stock">' + p.quantity + '</span>',
            p.minStock || 5
        ];
    })) : '<div class="empty">Все товары в норме \u2713</div>';
    const receipts = groupSalesIntoReceipts(allSales).slice(0, 10);
    const dashCols = [
        'Чек',
        'Товаров',
        'Сумма',
        'Оплата',
        'Кассир',
        'Время',
        ''
    ];
    document.getElementById('dash-recent').innerHTML = receipts.length ? tableHTML(dashCols, receipts.map(function (r) {
        return [
            '<span class="code-tag">\u2116 ' + r.id.slice(-6) + '</span>',
            r.items.reduce(function (sum, it) {
                return sum + (Number(it.quantity) || 0);
            }, 0),
            fmt(r.total),
            badgePay(r.payment, r.items[0]),
            r.userName || '\u2014',
            fmtDate(r.date),
            '<button class="btn btn-sm btn-secondary" onclick="openReceipt(\'' + r.id + '\')">Открыть</button>'
        ];
    })) : '<div class="empty">Продаж пока нет</div>';
    renderSalesToday();
}

function buildInvoiceHTML(receiptId) {
    var allSales = getSales().filter(isSaleActive);
    var sales = allSales.filter(function (s) {
        return s.receiptId === receiptId;
    });
    if (!sales.length)
        sales = allSales.filter(function (s) {
            return s.id === receiptId;
        });
    if (!sales.length)
        sales = allSales.filter(function (s) {
            return String(s.receiptId) === String(receiptId) || String(s.id) === String(receiptId);
        });
    if (!sales.length)
        return null;
    var first = sales[0];
    var store = window.ApAuth && window.ApAuth.getCurrentStore();
    var storeName = store ? store.storeName : 'SANAQ';
    var storeBin = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_bin')) || localStorage.getItem('ap_store_bin') || '';
    var bankName = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_bank_name')) || localStorage.getItem('ap_store_bank_name') || '';
    var iik = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_iik')) || localStorage.getItem('ap_store_iik') || '';
    var bik = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_bik')) || localStorage.getItem('ap_store_bik') || '';
    var kbe = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_kbe')) || localStorage.getItem('ap_store_kbe') || '';
    var paymentCode = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_payment_code')) || localStorage.getItem('ap_store_payment_code') || '';
    var beneficiary = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_beneficiary')) || localStorage.getItem('ap_store_beneficiary') || storeName;
    var total = sales.reduce(function (s, x) {
        return s + x.total;
    }, 0);
    var totalQty = sales.reduce(function (s, x) {
        return s + (Number(x.quantity) || 0);
    }, 0);
    var rows = sales.map(function (s, i) {
        return '<tr>' + '<td style="padding:6px 4px;border:1px solid #000;text-align:center;font-size:11px">' + (i + 1) + '</td>' + '<td style="padding:6px 4px;border:1px solid #000;text-align:center;font-size:11px">' + esc(s.productCode || '\u2014') + '</td>' + '<td style="padding:6px 4px;border:1px solid #000;font-size:11px">' + esc(s.productName) + '</td>' + '<td style="padding:6px 4px;border:1px solid #000;text-align:center;font-size:11px">шт</td>' + '<td style="padding:6px 4px;border:1px solid #000;text-align:center;font-size:11px">' + s.quantity + '</td>' + '<td style="padding:6px 4px;border:1px solid #000;text-align:center;font-size:11px">' + s.quantity + '</td>' + '<td style="padding:6px 4px;border:1px solid #000;text-align:right;font-size:11px">' + fmt(s.unitPrice) + '</td>' + '<td style="padding:6px 4px;border:1px solid #000;text-align:right;font-size:11px;font-weight:600">' + fmt(s.total) + '</td>' + '</tr>';
    }).join('');
    var html = '<div style="font-family:\'Times New Roman\',Times,serif;color:#000;max-width:980px;margin:0 auto;padding:30px 20px">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;font-size:11px">';
    html += '<div>Приложение 26<br>к приказу Министра финансов<br>Республики Казахстан<br>от 20 декабря 2012 года \u2116 562</div>';
    html += '<div style="font-size:16px;font-weight:700">Форма З-2</div></div>';
    html += '<div style="text-align:center;font-weight:700;font-size:16px;margin:12px 0 16px">Накладная на отпуск запасов на сторону</div>';
    html += '<div style="margin-bottom:10px;font-size:12px"><strong>Организация (ИП) - отправитель:</strong> ' + esc(storeName) + ' &nbsp; <strong>БИН/ИИН:</strong> ' + esc(storeBin) + '</div>';
    html += '<div style="margin-bottom:14px;font-size:12px"><strong>Номер документа:</strong> ' + receiptId.slice(-6) + ' &nbsp; <strong>Дата:</strong> ' + fmtDate(first.date) + '</div>';
    html += '<table style="width:100%;border-collapse:collapse;margin-bottom:12px">';
    html += '<thead><tr>' + '<th rowspan="2" style="padding:5px;border:1px solid #000;text-align:center;font-size:10px;width:28px">\u2116 п/п</th>' + '<th rowspan="2" style="padding:5px;border:1px solid #000;text-align:center;font-size:10px;width:70px">Номенкл. номер</th>' + '<th rowspan="2" style="padding:5px;border:1px solid #000;text-align:center;font-size:10px">Наименование, характеристика</th>' + '<th rowspan="2" style="padding:5px;border:1px solid #000;text-align:center;font-size:10px;width:38px">Ед.</th>' + '<th colspan="2" style="padding:5px;border:1px solid #000;text-align:center;font-size:10px;width:70px">Количество</th>' + '<th rowspan="2" style="padding:5px;border:1px solid #000;text-align:center;font-size:10px;width:70px">Цена, KZT</th>' + '<th rowspan="2" style="padding:5px;border:1px solid #000;text-align:center;font-size:10px;width:80px">Сумма с НДС, KZT</th>' + '</tr><tr>' + '<th style="padding:5px;border:1px solid #000;text-align:center;font-size:9px">подлежит</th>' + '<th style="padding:5px;border:1px solid #000;text-align:center;font-size:9px">отпущено</th>' + '</tr></thead><tbody>' + rows + '</tbody></table>';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:14px;font-size:12px">';
    html += '<div><strong>Итого наименований:</strong> ' + sales.length + '</div>';
    html += '<div><strong>Всего отпущено количество:</strong> ' + totalQty + '</div>';
    html += '<div><strong>на сумму:</strong> ' + fmt(total) + ' KZT</div></div>';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:12px;gap:12px">';
    html += '<div style="flex:1;border:1px solid #000;padding:8px"><strong>Отпуск разрешил:</strong><div style="border-bottom:1px solid #000;height:24px;margin-top:8px"></div><div style="font-size:10px;margin-top:2px">(подпись, расшифровка)</div></div>';
    html += '<div style="flex:1;border:1px solid #000;padding:8px"><strong>Главный бухгалтер:</strong><div style="border-bottom:1px solid #000;height:24px;margin-top:8px"></div><div style="font-size:10px;margin-top:2px">(подпись, расшифровка)</div></div>';
    html += '<div style="flex:1;border:1px solid #000;padding:8px"><strong>М.П.</strong></div></div>';
    html += '<div style="display:flex;justify-content:space-between;font-size:12px;gap:12px">';
    html += '<div style="flex:1;border:1px solid #000;padding:8px"><strong>Отпустил:</strong><div style="border-bottom:1px solid #000;height:24px;margin-top:8px"></div><div style="font-size:10px;margin-top:2px">(подпись, расшифровка)</div></div>';
    html += '<div style="flex:1;border:1px solid #000;padding:8px"><strong>Запасы получил:</strong><div style="border-bottom:1px solid #000;height:24px;margin-top:8px"></div><div style="font-size:10px;margin-top:2px">(подпись, расшифровка)</div></div>';
    html += '</div></div>';
    return html;
}

function renderAnalytics() {
    var period = _statsPeriod || 'today';
    var now = new Date();
    var periodStart = new Date(0);
    if (period === 'today')
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (period === 'week') {
        var d = new Date(now);
        d.setDate(d.getDate() - 7);
        periodStart = d;
    } else if (period === 'month')
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    var sales = getSales().filter(function (s) {
        return isSaleActive(s) && new Date(s.date) >= periodStart;
    });
    var receipts = groupSalesIntoReceipts(sales);
    renderAnalyticsCards(sales);
    renderSalesHeatmap(sales);
    renderRecords(sales, receipts, period);
    renderMostExpensiveReceipt(receipts);
}

function renderAnalyticsCards(sales) {
    var container = document.getElementById('analytics-cards');
    if (!container)
        return;
    var peak = renderPeakHour(sales);
    var totalSales = sales.length;
    var totalRevenue = sales.reduce(function (s, x) {
        return s + (Number(x.total) || 0);
    }, 0);
    var avgCheck = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;
    container.innerHTML = '<div class="card"><div class="card-label">\uD83D\uDCCA Всего продаж</div><div class="card-value" style="font-size:18px">' + totalSales + '</div></div>' + '<div class="card"><div class="card-label">\uD83D\uDCB0 Общая выручка</div><div class="card-value" style="font-size:18px">' + fmt(totalRevenue) + '</div></div>' + '<div class="card"><div class="card-label">\uD83E\uDDFE Средний чек</div><div class="card-value" style="font-size:18px">' + fmt(avgCheck) + '</div></div>' + '<div class="card"><div class="card-label">\u23F0 Пиковый час</div><div class="card-value" style="font-size:18px">' + peak.hour + ':00</div><div style="font-size:11px;color:var(--text-muted)">' + peak.count + ' продаж, ' + fmt(Math.round(peak.revenue)) + '</div></div>';
}

function renderPeakHour(sales) {
    var hourlyChecks = {};
    var hourlyRevenue = {};
    sales.forEach(function (s) {
        var hour = s.date ? new Date(s.date).getHours() : 0;
        if (!hourlyChecks[hour])
            hourlyChecks[hour] = 0;
        if (!hourlyRevenue[hour])
            hourlyRevenue[hour] = 0;
        hourlyChecks[hour]++;
        hourlyRevenue[hour] += Number(s.total) || 0;
    });
    var peakHour = 0, peakCount = 0, peakRev = 0;
    Object.keys(hourlyChecks).forEach(function (h) {
        if (hourlyChecks[h] > peakCount) {
            peakCount = hourlyChecks[h];
            peakHour = parseInt(h);
            peakRev = hourlyRevenue[h];
        }
    });
    return {
        hour: peakHour,
        count: peakCount,
        revenue: peakRev
    };
}

function renderRecords(sales, receipts, period) {
    var cardsContainer = document.getElementById('records-cards');
    if (!cardsContainer)
        return;
    var dailyTotals = {};
    receipts.forEach(function (r) {
        var day = (r.date || '').slice(0, 10);
        if (!dailyTotals[day])
            dailyTotals[day] = 0;
        dailyTotals[day] += r.total;
    });
    var bestDay = null, bestDayTotal = 0;
    Object.keys(dailyTotals).forEach(function (d) {
        if (dailyTotals[d] > bestDayTotal) {
            bestDayTotal = dailyTotals[d];
            bestDay = d;
        }
    });
    var weeklyTotals = {};
    receipts.forEach(function (r) {
        var dt = new Date(r.date);
        var weekStart = new Date(dt);
        weekStart.setDate(dt.getDate() - dt.getDay());
        var key = weekStart.toISOString().slice(0, 10);
        if (!weeklyTotals[key])
            weeklyTotals[key] = 0;
        weeklyTotals[key] += r.total;
    });
    var bestWeek = null, bestWeekTotal = 0;
    Object.keys(weeklyTotals).forEach(function (w) {
        if (weeklyTotals[w] > bestWeekTotal) {
            bestWeekTotal = weeklyTotals[w];
            bestWeek = w;
        }
    });
    var monthlyTotals = {};
    receipts.forEach(function (r) {
        var key = (r.date || '').slice(0, 7);
        if (!monthlyTotals[key])
            monthlyTotals[key] = 0;
        monthlyTotals[key] += r.total;
    });
    var bestMonth = null, bestMonthTotal = 0;
    Object.keys(monthlyTotals).forEach(function (m) {
        if (monthlyTotals[m] > bestMonthTotal) {
            bestMonthTotal = monthlyTotals[m];
            bestMonth = m;
        }
    });
    cardsContainer.innerHTML = '<div class="card"><div class="card-label">\uD83C\uDFC6 Рекорд дня</div><div class="card-value" style="font-size:18px">' + (bestDay ? fmt(bestDayTotal) : '\u2014') + ' \u20B8</div><div style="font-size:11px;color:var(--text-muted)">' + (bestDay || '\u2014') + '</div></div>' + '<div class="card"><div class="card-label">\uD83C\uDFC6 Рекорд недели</div><div class="card-value" style="font-size:18px">' + (bestWeek ? fmt(bestWeekTotal) : '\u2014') + ' \u20B8</div><div style="font-size:11px;color:var(--text-muted)">Неделя от ' + (bestWeek || '\u2014') + '</div></div>' + '<div class="card"><div class="card-label">\uD83C\uDFC6 Рекорд месяца</div><div class="card-value" style="font-size:18px">' + (bestMonth ? fmt(bestMonthTotal) : '\u2014') + ' \u20B8</div><div style="font-size:11px;color:var(--text-muted)">' + (bestMonth || '\u2014') + '</div></div>';
}

function renderAuditsPage() {
    if (!isAdmin()) {
        toast('Только администратор', 'err');
        return;
    }
    switchAuditsTab('writeoffs');
    renderWriteOffsTable();
    renderAuditsArchive();
}

function renderWriteOffsTable() {
    var el = document.getElementById('writeoffs-list-table');
    if (!el)
        return;
    var list = getWriteOffs();
    if (!list.length) {
        el.innerHTML = '<div class="empty">Списаний пока нет</div>';
        return;
    }
    el.innerHTML = tableHTML([
        'Дата',
        'Товар',
        'Код',
        'Кол-во',
        'Причина',
        'Примечание',
        'Сотрудник'
    ], list.map(function (w) {
        return [
            fmtDate(w.date),
            w.productName,
            w.productCode,
            w.quantity,
            w.reason,
            w.note || '\u2014',
            w.userName
        ];
    }));
}

function renderAuditsArchive() {
    var el = document.getElementById('audits-archive-table');
    if (!el)
        return;
    var list = getAudits();
    if (!list.length) {
        el.innerHTML = '<div class="empty">Ревизий пока нет</div>';
        return;
    }
    el.innerHTML = tableHTML([
        'Дата',
        'Сотрудник',
        'Позиций',
        'Расхождений',
        'Детали'
    ], list.map(function (a) {
        var items = a.items || [];
        var diffs = items.filter(function (it) {
            return it.qtyFact !== it.qtySystem;
        });
        var details = diffs.length ? diffs.map(function (it) {
            return it.name + ': ' + it.qtySystem + ' \u2192 ' + it.qtyFact;
        }).join('<br>') : '<span style="color:var(--ok)">Без расхождений</span>';
        return [
            fmtDate(a.date),
            a.userName,
            items.length,
            diffs.length,
            '<div style="max-width:300px;font-size:12px;line-height:1.5">' + details + '</div>'
        ];
    }));
}

function showCustomModal(title, body) {
    var existing = document.getElementById('modal-custom');
    if (!existing) {
        var div = document.createElement('div');
        div.id = 'modal-custom';
        div.className = 'overlay';
        div.innerHTML = '<div style="background:var(--bg);max-width:400px;width:90%;margin:60px auto;border-radius:12px;padding:20px;box-shadow:0 8px 32px rgba(0,0,0,0.3)"><div style="font-weight:700;font-size:16px;margin-bottom:12px" id="modal-custom-title"></div><div id="modal-custom-body"></div></div>';
        document.body.appendChild(div);
        div.addEventListener('click', function (e) {
            if (e.target === div)
                closeModal('modal-custom');
        });
    }
    document.getElementById('modal-custom-title').textContent = title;
    document.getElementById('modal-custom-body').innerHTML = body;
    openModal('modal-custom');
}

function updateAutoBackupUI() {
    try {
        var ts = localStorage.getItem(autoBackupKey);
        if (ts) {
            var elapsed = Math.floor((Date.now() - parseInt(ts)) / 60000);
            var el = document.querySelector('#ctab-backup .panel-title');
            if (el && elapsed < 7200) {
                var minText = elapsed < 60 ? elapsed + ' мин' : Math.floor(elapsed / 60) + 'ч ' + elapsed % 60 + 'мин';
                el.textContent = 'Резервное копирование (авто: ' + minText + ' назад)';
            }
        }
    } catch (e) {
    }
}

function renderNotifications() {
    var container = document.getElementById('notif-panel-body');
    var notifs = [];
    var products = getProducts();
    var lowItems = products.filter(function (p) {
        return p.quantity <= (p.minStock || 5);
    });
    if (lowItems.length > 0) {
        notifs.push({
            icon: '\u26A0️',
            title: 'Низкий остаток: ' + lowItems.length + ' товаров',
            desc: lowItems.slice(0, 3).map(function (p) {
                return p.name + ' (' + p.quantity + ' шт)';
            }).join(', ') + (lowItems.length > 3 ? ' и ещё ' + (lowItems.length - 3) : ''),
            time: 'сейчас'
        });
    }
    var shifts = getShifts();
    var openShifts = shifts.filter(function (s) {
        return s.status === 'open';
    });
    if (openShifts.length > 0) {
        notifs.push({
            icon: '\uD83D\uDD50',
            title: 'Открытые смены: ' + openShifts.length,
            desc: openShifts.map(function (s) {
                return s.cashierName + ' (' + fmtDate(s.openedAt) + ')';
            }).join(', '),
            time: 'сейчас'
        });
    }
    var deferred = getDeferred ? getDeferred() : [];
    if (deferred.length > 0) {
        notifs.push({
            icon: '\uD83D\uDCE6',
            title: 'Отложенные товары: ' + deferred.length,
            desc: 'Есть отложенные товары, ожидающие обработки',
            time: 'сейчас'
        });
    }
    var debts = getDebts ? getDebts() : [];
    var openDebts = debts.filter(function (d) {
        return d.status === 'open';
    });
    if (openDebts.length > 0) {
        notifs.push({
            icon: '\uD83D\uDCB0',
            title: 'Активные долги: ' + openDebts.length,
            desc: 'Общая сумма: ' + fmt(openDebts.reduce(function (s, d) {
                return s + (Number(d.amount) || 0);
            }, 0)) + ' \u20B8',
            time: 'сейчас'
        });
    }
    var autoBackupKey = 'ap_auto_backup_ts';
    var ts = localStorage.getItem(autoBackupKey);
    if (ts) {
        var elapsed = Math.floor((Date.now() - parseInt(ts)) / 3600000);
        if (elapsed > 24) {
            notifs.push({
                icon: '\uD83D\uDCBE',
                title: 'Резервная копия устарела',
                desc: 'Последняя копия была сделана ' + Math.floor(elapsed / 24) + ' дней назад',
                time: Math.floor(elapsed / 24) + 'д назад'
            });
        }
    }
    if (notifs.length === 0) {
        container.innerHTML = '<div class="empty">\u2705 Всё в порядке, уведомлений нет</div>';
    } else {
        container.innerHTML = notifs.map(function (n) {
            return '<div class="notif-item"><div class="notif-item-icon">' + n.icon + '</div><div class="notif-item-content"><div class="notif-item-title">' + esc(n.title) + '</div><div class="notif-item-desc">' + esc(n.desc) + '</div><div class="notif-item-time">' + n.time + '</div></div></div>';
        }).join('');
    }
    updateNotifBadge();
}

function applyUIVisibility() {
    var s = getUISettings();
    var vis = s.visibility || {};
    var blocks = {
        'sidebar': '.sidebar',
        'header': '.mobile-header',
        'dash-cards': '#dash-cards',
        'dash-analytics': '.dash-analytics-grid',
        'sales-history': '.pos-side-col',
        'pos-shift-history': '#pos-shift-history',
        'stats-cards': '#stats-cards'
    };
    Object.keys(blocks).forEach(function (key) {
        var els = document.querySelectorAll(blocks[key]);
        els.forEach(function (el) {
            if (el)
                el.style.display = vis[key] === false ? 'none' : '';
        });
    });
    var restoreBtn = document.getElementById('sidebar-restore-btn');
    if (restoreBtn) {
        restoreBtn.style.display = vis.sidebar === false ? 'flex' : 'none';
    }
}

function applyUIPosMode(mode) {
    var html = document.documentElement;
    html.classList.remove('ui-compact', 'ui-standard', 'ui-large');
    if (mode === 'compact')
        html.classList.add('ui-compact');
    else if (mode === 'large')
        html.classList.add('ui-large');
    else
        html.classList.add('ui-standard');
}

function getUIProfiles() {
    var v = window.ApDb && window.ApDb.getAppData ? window.ApDb.getAppData('ui_profiles') : null;
    if (v && typeof v === 'object')
        return v;
    try {
        return JSON.parse(localStorage.getItem('sanaq_ui_profiles_' + (currentStoreId || '')) || '{}');
    } catch (e) {
        return {};
    }
}

function setUIProfiles(profiles) {
    try {
        localStorage.setItem('sanaq_ui_profiles_' + (currentStoreId || ''), JSON.stringify(profiles));
    } catch (e) {
    }
    if (window.ApDb && window.ApDb.setAppData)
        window.ApDb.setAppData('ui_profiles', profiles);
}

function renderSavedUIProfiles() {
    var container = document.getElementById('ui-saved-profiles');
    if (!container)
        return;
    var profiles = getUIProfiles();
    var names = Object.keys(profiles);
    if (!names.length) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = names.map(function (name) {
        return '<div class="ui-saved-profile">' + '<span class="name">' + esc(name) + '</span>' + '<div class="actions">' + '<button class="btn btn-sm btn-secondary" onclick="loadUIProfile(\'' + name.replace(/'/g, '\\\'') + '\')">\uD83D\uDCC2</button>' + '<button class="btn btn-sm btn-danger" onclick="deleteUIProfile(\'' + name.replace(/'/g, '\\\'') + '\')">\u2715</button>' + '</div></div>';
    }).join('');
}

function renderPosLayoutEditor() {
    var container = document.getElementById('pos-layout-editor');
    if (!container)
        return;
    var layout = getPosLayout();
    var labels = {
        favorites: '\u2B50 Быстрые товары',
        categories: '\uD83D\uDDC2️ Категории',
        'shift-history': '\uD83D\uDCCB История продаж',
        search: '\uD83D\uDD0D Поиск'
    };
    container.innerHTML = layout.map(function (key, i) {
        return '<div draggable="true" class="pos-layout-item" data-key="' + key + '" data-index="' + i + '" ondragstart="onPosLayoutDragStart(event)" ondragover="onPosLayoutDragOver(event)" ondrop="onPosLayoutDrop(event)" ondragend="onPosLayoutDragEnd(event)" style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg3);border-radius:8px;cursor:grab;border:1px solid var(--border)">' + '<span style="cursor:grab;color:var(--text-muted)">\u283F</span>' + '<span style="flex:1;font-size:13px">' + (labels[key] || key) + '</span>' + '</div>';
    }).join('');
}




'use strict';

window.addEventListener('error', function (e) {
    try {
        console.warn('[App error]', e && e.message ? e.message : 'unknown', e && e.lineno ? 'line:' + e.lineno : '');
    } catch (err) {
    }
});

window.addEventListener('unhandledrejection', function (e) {
    try {
        var msg = e && e.reason && (e.reason.message || e.reason) ? e.reason.message || e.reason : 'unknown';
        console.warn('[Promise error]', msg);
    } catch (err) {
    }
});

window.currentUser = null;

































document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        var restoreBtn = document.getElementById('sidebar-restore-btn');
        if (restoreBtn && restoreBtn.style.display === 'flex') {
            window.restoreSidebar();
            e.preventDefault();
            return;
        }
    }
    // Esc: close modals / clear search
    if (e.key === 'Escape') {
        var openModals = document.querySelectorAll('.overlay:not(.hidden)');
        if (openModals.length) {
            // Let default overlay close handler work
            return;
        }
        var searchEl = document.getElementById('sale-search');
        if (searchEl && document.activeElement === searchEl && searchEl.value) {
            searchEl.value = '';
            onSaleSearch();
            e.preventDefault();
        }
        return;
    }
});

document.addEventListener('keydown', function (e) {
    if (!currentUser || e.ctrlKey || e.altKey || e.metaKey)
        return;
    var page = document.querySelector('.page.active');
    if (!page || page.id !== 'page-sales' && page.id !== 'page-products')
        return;
    var now = Date.now();
    var gap = now - scanLastKey;
    setStore('scanLastKey', now);
    if (e.key === 'Enter') {
        var ae = document.activeElement;
        if (ae && (ae.id === 'sale-search' || ae.id === 'product-search' || ae.id === 'product-barcode')) {
            setStore('scanBuffer', '');
            return;
        }
        if (scanBuffer.length >= 4 && gap < 120) {
            handleBarcodeScan(scanBuffer);
            setStore('scanBuffer', '');
            e.preventDefault();
        } else {
            setStore('scanBuffer', '');
        }
        return;
    }
    if (e.key.length === 1) {
        if (gap > SCAN_MAX_GAP)
            setStore('scanBuffer', '');
        setStore('scanBuffer', scanBuffer + e.key);
    }
});





























window.addEventListener('online', function () {
    updateOfflineBanner();
});

window.addEventListener('offline', function () {
    updateOfflineBanner();
});









document.getElementById('confirm-ok').onclick = function () {
    closeModal('modal-confirm');
    if (confirmCallback)
        confirmCallback();
    setStore('confirmCallback', null);
};

function refreshAll() {
    renderDashboard();
    renderProducts();
    fillSaleProducts();
    renderSalesToday();
    renderPosSideHistory();
    updateSaleShiftBanner();
    if (isAdmin())
        renderExpenses();
    else if (document.getElementById('page-myshift') && document.getElementById('page-myshift').classList.contains('active'))
        renderMyShiftPage();
    renderPosCatBrowser();
    renderPosProducts(_posBrowserState.cat || '');
}











function showApp() {
    if (window.currentUser)
        setCurrentUser(window.currentUser);
    try {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app').classList.add('active');
        
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-role').textContent = ROLE_LABELS[currentUser.role] || currentUser.role;
        applyRoleUI();
        renderStoreUI();
        var cats = getCategories();
        if (!cats.length) {
            var defaults = [
                'Масла и жидкости',
                'Фильтры',
                'Тормозная система',
                'Электрика',
                'Подвеска',
                'Двигатель',
                'Кузов',
                'Аксессуары',
                'Расходники'
            ];
            setCategories(defaults.map(function (n) {
                return {
                    id: uid(),
                    name: n
                };
            }));
        }
        refreshAll();
        addAuditLog('Вход в систему', 'Пользователь: ' + currentUser.name, '\uD83D\uDD11');
        if (typeof initPins === 'function') initPins();
        if (typeof lucide !== 'undefined')
            lucide.createIcons();
        applyUISettings();
        updateNotifBadge();
        requestNotificationPermission();
        setTimeout(checkLowStockNotification, 3000);
        if (!window._notifBadgeInterval)
            window._notifBadgeInterval = setInterval(updateNotifBadge, 30000);
        if (!window._syncInterval) {
            window._syncInterval = setInterval(function () {
                if (!currentUser)
                    return;
                if (document.querySelector('.modal.open'))
                    return;
                syncWithSupabase();
            }, 60000);
        }
        if (!window._backupInterval) {
            window._backupInterval = setInterval(function () {
                if (currentUser && isAdmin())
                    autoBackup();
            }, 7200000);
        }
        if (!window._autoRefreshInterval) {
            window._autoRefreshInterval = setInterval(function () {
                var activePage = document.querySelector('.page.active');
                if (activePage) {
                    var id = activePage.id;
                    if (id === 'page-dashboard')
                        renderDashboard();
                    else if (id === 'page-products')
                        renderProducts();
                    else if (id === 'page-statistics')
                        renderStatistics();
                    else if (id === 'page-audits') {
                        renderWriteOffsTable();
                        renderAuditsArchive();
                    }
                }
            }, 15000);
        }
        (function () {
            try {
                var sidebar = document.querySelector('.sidebar');
                var btn = document.getElementById('sidebar-collapse-btn');
                if (sidebar && window.ApDb && window.ApDb.get('sidebarCollapsed')) {
                    sidebar.classList.add('collapsed');
                    if (btn)
                        btn.innerHTML = '\u25B6';
                }
                var lowEl = document.getElementById('dash-lowstock');
                if (lowEl && window.ApDb && window.ApDb.get('dashLowStockHidden')) {
                    lowEl.style.display = 'none';
                    var lowBtn = document.querySelector('#panel-dash-lowstock .collapse-btn');
                    if (lowBtn)
                        lowBtn.innerHTML = '\u25BC';
                }
            } catch (e) {
            }
        }());
    } catch (e) {
        try {
            toast('Ошибка после входа: ' + (e && e.message ? e.message : e), 'err');
        } catch (err) {
        }
        try {
            showLogin();
        } catch (err2) {
        }
        throw e;
    }
}





document.getElementById('btn-logout').onclick = function () {
    confirmAction('Выход', 'Выйти из системы?', async function () {
        try { await showLogin(); } catch (e) { /* suppress */ }
        toast('Вы вышли из системы');
    });
};

function goPage(name) {
    if (!isAdmin() && !hasGroupPermission(name)) {
        toast('Нет доступа к разделу', 'err');
        return;
    }
    const sb = document.querySelector('.sidebar');
    const ov = document.getElementById('sidebar-overlay');
    if (sb && sb.classList.contains('active')) {
        sb.classList.remove('active');
        if (ov)
            ov.classList.remove('active');
    }
    document.querySelectorAll('.nav-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.page === name);
    });
    document.querySelectorAll('.page').forEach(function (p) {
        p.classList.toggle('active', p.id === 'page-' + name);
    });
    if (name === 'products')
        renderProducts();
    if (name === 'sales') {
        fillSaleProducts();
        clearSaleSelection();
        renderSalesToday();
        renderPosSideHistory();
        updateSaleShiftBanner();
        focusSaleSearch();
        renderPosCatBrowser();
        updatePosClock();
        if (typeof posCashierName === 'function')
            posCashierName();
    }
    if (name === 'expenses')
        renderExpenses();
    if (name === 'statistics')
        renderStatistics();
    if (name === 'promotions')
        renderPromotionsPage();
    if (name === 'cards')
        renderCustomers();
    if (name === 'categories')
        renderCategoriesPage();
    if (name === 'dashboard')
        renderDashboard();
    if (name === 'cashiers')
        renderCashiersPage();
    if (name === 'audits')
        renderAuditsPage();
    if (name === 'myshift')
        renderMyShiftPage();
    if (name === 'debts') {
        migrateDebtData();
        renderDebts();
    }
    if (name === 'deferred') {
        migrateDeferredData();
        renderDeferred();
    }
    if (name === 'documents')
        renderDocuments();
    if (name === 'sales')
        updateSaleShiftBanner();
    if (typeof lucide !== 'undefined')
        setTimeout(function () {
            lucide.createIcons();
        }, 50);
}



document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.onclick = function () {
        goPage(btn.dataset.page);
    };
});

const menuToggle = document.getElementById('btn-menu-toggle');

const sidebar = document.querySelector('.sidebar');

const overlay = document.getElementById('sidebar-overlay');

if (menuToggle && sidebar && overlay) {
    menuToggle.onclick = function () {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    };
    overlay.onclick = function () {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    };
}



































































function updatePosClock() {
    var el = document.getElementById('pos-clock-display');
    if (el)
        el.textContent = new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
}



setInterval(function () {
    var p = document.getElementById('page-sales');
    if (p && !p.classList.contains('hidden'))
        updatePosClock();
}, 10000);



function showPosView(view) {
    document.querySelectorAll('.pos-top-tab').forEach(function (b) {
        b.classList.toggle('active', b.dataset.posView === view);
    });
    if (view === 'sales') {
    }
    if (view === 'return')
        openReturnSelector();
}



function renderPosCatBrowser() {
    var container = document.getElementById('pos-cat-strip');
    if (!container) return;
    var cats = getCategories();
    var all = getProducts();
    var html = '<button class="active" onclick="filterCategory(\'\')">⭐ Все</button>';
    // Add favorites as first category
    var favCount = all.filter(function (p) { return p.favorite; }).length;
    if (favCount) {
        html += '<button data-cat-id="__favorites__" onclick="filterCategory(\'__favorites__\')">⭐ Быстрые</button>';
    }
    cats.forEach(function (c) {
        var count = all.filter(function (p) { return p.category === c.id; }).length;
        if (count) {
            html += '<button data-cat-id="' + c.id + '" onclick="filterCategory(\'' + esc(c.id) + '\')">' + esc(c.name) + '</button>';
        }
    });
    container.innerHTML = html;
    _posBrowserState.cat = '';
}











function toggleFavPos(productId, e) {
    if (e)
        e.stopPropagation();
    var products = getProducts();
    var p = products.find(function (x) { return x.id === productId; });
    if (!p) return;
    p.favorite = !p.favorite;
    setProducts(products);
    renderPosCatBrowser();
    // Re-render products if showing favorites category
    if (_posBrowserState.cat === '__favorites__' || document.querySelector('#pos-cat-strip button[data-cat-id="__favorites__"].active')) {
        filterCategory('__favorites__');
    }
}





function switchPosTab(tab) {
}





function renderPosCatList() {
    try {
        var list = document.getElementById('pos-cat-modal-list');
        if (!list)
            return;
        _posCatModalState.mode = 'categories';
        _posCatModalState.catId = '';
        var cats = getCategories() || [];
        var all = getProducts() || [];
        var html = '<button class="pos-cat-pill active" onclick="filterCategoryFromModal(\'\')">Все</button>';
        cats.forEach(function (c) {
            var count = all.filter(function (p) {
                return p.category === c.id;
            }).length;
            html += '<button class="pos-cat-pill" onclick="filterCategoryFromModal(\'' + esc(c.id) + '\')">' + esc(c.name) + ' (' + count + ')</button>';
        });
        list.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;padding:16px';
        list.innerHTML = html;
    } catch (e) {
        toast('Ошибка при возврате к категориям', 'err');
    }
}





var activeRightPanel = 'sales';

function setRightPanel(panel) {
    // Panels are removed in new layout; focus search on panel click
    var searchEl = document.getElementById('sale-search');
    if (searchEl) searchEl.focus();
}

function openPosCategories() {
    // In new layout, categories are always visible in left sidebar
    // Focus search instead
    var searchEl = document.getElementById('sale-search');
    if (searchEl) searchEl.focus();
}

function openPosFavorites() {
    // Show favorites category directly
    filterCategory('__favorites__');
}

function renderPosSideHistory() {
    var el = document.getElementById('pos-shift-history');
    if (!el)
        return;
    var shift = currentUser && (getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username));
    if (!shift) {
        el.innerHTML = '<div class="pos-empty-msg">Смена не открыта</div>';
        return;
    }
    var allSales = getSales().filter(function (s) {
        return isSaleActive(s);
    });
    var shiftSales = allSales.filter(function (s) {
        return s.shiftId === shift.id;
    });
    var receipts = groupSalesIntoReceipts(shiftSales);
    if (!receipts.length) {
        el.innerHTML = '<div class="pos-empty-msg">Нет продаж в этой смене</div>';
        return;
    }
    var html = '';
    receipts.forEach(function (r) {
        var payLabel = PAY_LABELS[r.payment] || r.payment || '';
        var payBadge = '';
        if (payLabel === 'Наличные')
            payBadge = '<span class="side-pay-badge" style="background:#ecfdf5;color:#059669">нал</span>';
        else if (payLabel === 'Kaspi QR')
            payBadge = '<span class="side-pay-badge" style="background:#f0fdf4;color:#16a34a">kaspi</span>';
        else if (payLabel === 'Банк')
            payBadge = '<span class="side-pay-badge" style="background:#eff6ff;color:#2563eb">банк</span>';
        else if (payLabel === 'Смешанный')
            payBadge = '<span class="side-pay-badge" style="background:#fefce8;color:#ca8a04">смеш</span>';
        else if (payLabel === 'В долг')
            payBadge = '<span class="side-pay-badge" style="background:#fef2f2;color:#dc2626">долг</span>';
        else if (payLabel)
            payBadge = '<span class="side-pay-badge" style="background:#f3f4f6;color:#6b7280">' + esc(payLabel) + '</span>';
        var timeStr = r.date ? fmtDate(r.date) : '\u2014';
        var itemsCount = r.items.reduce(function (s, it) {
            return s + (Number(it.quantity) || 0);
        }, 0);
        html += '<div class="pos-side-sale" onclick="openReceipt(\'' + r.id + '\')">' + '<span class="pos-side-sale-num">\u2116' + r.id.slice(-6) + '</span>' + '<div class="pos-side-sale-info"><span class="side-sale-time">' + esc(timeStr) + '</span><span>x' + itemsCount + '</span></div>' + payBadge + '<span class="pos-side-sale-amount">' + fmt(r.total) + '</span>' + '</div>';
    });
    el.innerHTML = html;
}











document.addEventListener('click', function (e) {
    var m = document.getElementById('modal-admin-pin');
    if (m && m.classList.contains('show') && e.target === m)
        closeModal('modal-admin-pin');
});







































































































































































































































































































setInterval(function () {
    var list = getPromotions();
    var now = new Date();
    var changed = false;
    list = list.map(function (p) {
        var end = new Date(p.endDate + 'T' + (p.endTime || '23:59'));
        if (p.active !== false && now > end) {
            p.active = false;
            changed = true;
        }
        return p;
    });
    if (changed)
        setPromotions(list);
}, 60000);

async function initApp() {
    if (!window.ApDb || !window.ApAuth || !window.ApScreens) {
        alert('Не загружены файлы приложения (ap-db.js, ap-auth.js\u2026).\nПроверьте наличие папки js/ на сервере.');
        return;
    }
    migrateProducts();
    migrateBarcodes();
    migrateSalesRecords();
    document.getElementById('auth-screen').style.display = 'flex';
    try { await window.ApScreens.bootstrap(); } catch (e) { console.error('Bootstrap error:', e); return; }
    if (getUsers().length === 0) {
        var existingLU = getLocalUsers();
        if (!existingLU.length) {
            setLocalUsers([
                {
                    id: 'user-admin',
                    username: 'admin',
                    password: 'admin123',
                    name: 'Администратор',
                    role: 'admin',
                    active: true
                },
                {
                    id: uid(),
                    username: 'cashier',
                    password: 'cashier123',
                    name: 'Кассир 1',
                    role: 'cashier',
                    active: true
                }
            ]);
        }
    }
    window._syncInterval = setInterval(function () {
        if (!currentUser)
            return;
        if (document.querySelector('.modal.open'))
            return;
        syncWithSupabase();
    }, 5000);
    window._backupInterval = setInterval(function () {
        if (currentUser && isAdmin()) {
            autoBackup();
        }
    }, 7200000);
}



window._notifBadgeInterval = setInterval(updateNotifBadge, 30000);



function setUIPosMode(mode) {
    getUISettings();
    _uiSettings.posMode = mode;
    saveUISettings();
    applyUISettings();
    openUISettings();
    toast('Режим POS: ' + mode, 'ok');
}



function openUISettings() {
    var s = getUISettings();
    document.querySelectorAll('#ui-profile-select button').forEach(function (b) {
        b.classList.toggle('btn-primary', b.dataset.profile === (s.profile || 'desktop'));
        b.classList.toggle('btn-secondary', b.dataset.profile !== (s.profile || 'desktop'));
    });
    document.querySelectorAll('#ui-scale-select button').forEach(function (b) {
        b.classList.toggle('btn-primary', parseFloat(b.dataset.scale) === (s.scale || 1));
        b.classList.toggle('btn-secondary', parseFloat(b.dataset.scale) !== (s.scale || 1));
    });
    document.querySelectorAll('#ui-card-size-select button').forEach(function (b) {
        b.classList.toggle('btn-primary', parseFloat(b.dataset.cardsize) === (s.cardSize || 1));
        b.classList.toggle('btn-secondary', parseFloat(b.dataset.cardsize) !== (s.cardSize || 1));
    });
    document.querySelectorAll('#ui-button-size-select button').forEach(function (b) {
        b.classList.toggle('btn-primary', parseFloat(b.dataset.btnsize) === (s.buttonSize || 1));
        b.classList.toggle('btn-secondary', parseFloat(b.dataset.btnsize) !== (s.buttonSize || 1));
    });
    document.querySelectorAll('#ui-cols-select button').forEach(function (b) {
        b.classList.toggle('btn-primary', parseInt(b.dataset.cols) === (s.cols || 4));
        b.classList.toggle('btn-secondary', parseInt(b.dataset.cols) !== (s.cols || 4));
    });
    document.querySelectorAll('#ui-posmode-select button').forEach(function (b) {
        b.classList.toggle('btn-primary', b.dataset.posmode === (s.posMode || 'standard'));
        b.classList.toggle('btn-secondary', b.dataset.posmode !== (s.posMode || 'standard'));
    });
    var visContainer = document.getElementById('ui-visibility-toggles');
    if (visContainer) {
        var vis = s.visibility || {};
        var labels = {
            sidebar: 'Боковое меню',
            header: 'Шапка (мобильная)',
            'dash-cards': 'Карточки на главной',
            'dash-analytics': 'Аналитика на главной',
            'sales-history': 'История продаж (справа)',
            'stats-cards': 'Карточки статистики'
        };
        visContainer.innerHTML = Object.keys(labels).map(function (key) {
            return '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">' + '<input type="checkbox" ' + (vis[key] !== false ? 'checked' : '') + ' onchange="toggleUIVisibility(\'' + key + '\', this.checked)"> ' + labels[key] + '</label>';
        }).join('');
    }
    renderSavedUIProfiles();
    renderPosLayoutEditor();
    openModal('modal-ui-settings');
}



function toggleUIVisibility(key, visible) {
    getUISettings();
    if (!_uiSettings.visibility)
        _uiSettings.visibility = {};
    _uiSettings.visibility[key] = visible;
    saveUISettings();
    applyUISettings();
}



function setUIProfile(profile) {
    var profiles = {
        phone: {
            scale: 0.85,
            cardSize: 0.85,
            cols: 2
        },
        tablet: {
            scale: 0.9,
            cardSize: 0.9,
            cols: 3
        },
        desktop: {
            scale: 1,
            cardSize: 1,
            cols: 4
        },
        pos: {
            scale: 1.15,
            cardSize: 1.1,
            cols: 5
        }
    };
    var p = profiles[profile] || profiles.desktop;
    getUISettings();
    _uiSettings.profile = profile;
    _uiSettings.scale = p.scale;
    _uiSettings.cardSize = p.cardSize;
    _uiSettings.cols = p.cols;
    saveUISettings();
    applyUISettings();
    openUISettings();
    toast('Профиль \xAB' + profile + '\xBB применён', 'ok');
}



function setUIScale(scale) {
    getUISettings();
    _uiSettings.scale = scale;
    _uiSettings.profile = null;
    saveUISettings();
    applyUISettings();
    openUISettings();
}



function setUICardSize(size) {
    getUISettings();
    _uiSettings.cardSize = size;
    _uiSettings.profile = null;
    saveUISettings();
    applyUISettings();
    openUISettings();
}



function setUICols(cols) {
    getUISettings();
    _uiSettings.cols = cols;
    _uiSettings.profile = null;
    saveUISettings();
    applyUISettings();
    openUISettings();
}



function setUIButtonSize(size) {
    getUISettings();
    _uiSettings.buttonSize = size;
    _uiSettings.profile = null;
    saveUISettings();
    applyUISettings();
    openUISettings();
}



function saveUIProfile() {
    var name = document.getElementById('ui-profile-name').value.trim();
    if (!name) {
        toast('Введите название профиля', 'err');
        return;
    }
    var s = getUISettings();
    var profiles = getUIProfiles();
    profiles[name] = {
        scale: s.scale || 1,
        cardSize: s.cardSize || 1,
        cols: s.cols || 4,
        buttonSize: s.buttonSize || 1,
        visibility: s.visibility || {}
    };
    setUIProfiles(profiles);
    document.getElementById('ui-profile-name').value = '';
    renderSavedUIProfiles();
    toast('Профиль \xAB' + name + '\xBB сохранён', 'ok');
}



function loadUIProfile(name) {
    var profiles = getUIProfiles();
    var p = profiles[name];
    if (!p)
        return;
    getUISettings();
    Object.keys(p).forEach(function (k) {
        _uiSettings[k] = p[k];
    });
    _uiSettings.profile = name;
    saveUISettings();
    applyUISettings();
    openUISettings();
    toast('Профиль \xAB' + name + '\xBB загружен', 'ok');
}



function deleteUIProfile(name) {
    confirmAction('Удалить профиль', 'Удалить профиль \xAB' + name + '\xBB?', function () {
        var profiles = getUIProfiles();
        delete profiles[name];
        setUIProfiles(profiles);
        renderSavedUIProfiles();
        toast('Профиль удалён', 'ok');
    });
}



function getPosLayout() {
    var s = getUISettings();
    return s.posLayout || [
        'favorites',
        'categories',
        'shift-history',
        'search'
    ];
}

function setPosLayout(layout) {
    getUISettings();
    _uiSettings.posLayout = layout;
    saveUISettings();
}

function resetPosLayout() {
    getUISettings();
    _uiSettings.posLayout = [
        'favorites',
        'categories',
        'shift-history',
        'search'
    ];
    saveUISettings();
    renderPosLayoutEditor();
    applyPosLayout();
    toast('Порядок блоков сброшен', 'ok');
}



function applyPosLayout() {
    // Layout blocks are no longer in new POS design
}

function onPosLayoutDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.key);
    e.target.classList.add('dragging');
}

function onPosLayoutDragOver(e) {
    e.preventDefault();
    var target = e.target.closest('.pos-layout-item');
    if (!target)
        return;
    var rect = target.getBoundingClientRect();
    var mid = rect.top + rect.height / 2;
    target.classList.toggle('drag-over-top', e.clientY < mid);
    target.classList.toggle('drag-over-bottom', e.clientY >= mid);
}

function onPosLayoutDrop(e) {
    e.preventDefault();
    var draggedKey = e.dataTransfer.getData('text/plain');
    var target = e.target.closest('.pos-layout-item');
    if (!target || target.dataset.key === draggedKey)
        return;
    var layout = getPosLayout();
    var fromIdx = layout.indexOf(draggedKey);
    var toIdx = layout.indexOf(target.dataset.key);
    if (fromIdx < 0 || toIdx < 0)
        return;
    layout.splice(fromIdx, 1);
    layout.splice(toIdx, 0, draggedKey);
    setPosLayout(layout);
    renderPosLayoutEditor();
    applyPosLayout();
}

function onPosLayoutDragEnd(e) {
    document.querySelectorAll('.pos-layout-item').forEach(function (el) {
        el.classList.remove('dragging', 'drag-over-top', 'drag-over-bottom');
    });
}

window.addEventListener('resize', function () {
    var s = getUISettings();
    var grid = document.getElementById('pos-products');
    if (grid) {
        var cols = s.cols || 4;
        if (window.innerWidth < 768)
            cols = Math.min(cols, 3);
        if (window.innerWidth < 480)
            cols = Math.min(cols, 2);
        grid.style.setProperty('--grid-cols', cols);
    }
});



document.addEventListener('change', function (e) {
    if (e.target.classList.contains('bulk-item')) {
        if (e.target.checked)
            _bulkSelected.add(e.target.dataset.id);
        else
            _bulkSelected.delete(e.target.dataset.id);
        updateBulkBar();
        var selAll = document.getElementById('bulk-select-all');
        if (selAll) {
            var all = document.querySelectorAll('.bulk-item');
            var checked = document.querySelectorAll('.bulk-item:checked');
            selAll.checked = all.length > 0 && checked.length === all.length;
        }
    }
});









































restoreAutoBackup();

initApp();

document.getElementById('login-form').onsubmit = function (e) {
    e.preventDefault();
    try {
        var storeId = (document.getElementById('login-store').value || '').trim();
        if (storeId && storeId !== currentStoreId) {
            setStore('currentStoreId', storeId);
        }
        var login = document.getElementById('login-user').value.trim();
        var pass = document.getElementById('login-pass').value;
        var u = findUserByLogin(login);
        if (!u) {
            toast('Неверный логин или пароль', 'err');
            return;
        }
        if (u.memberId) {
            toast('Этот аккаунт входит через Supabase (email/пароль)', 'err');
            return;
        }
        if (u.password !== pass) {
            toast('Неверный логин или пароль', 'err');
            return;
        }
        setCurrentUser({
            id: u.id,
            username: u.username || '',
            name: u.name,
            role: u.role || 'cashier'
        });
        toast('Добро пожаловать, ' + u.name + '!', 'ok');
        showApp();
    } catch (err) {
        try {
            toast('Ошибка входа: ' + (err && err.message ? err.message : err), 'err');
        } catch (e2) {
        }
        throw err;
    }
};



set('openModal', openModal);
set('refreshAll', refreshAll);
set('_reopenParentModal', _reopenParentModal);
set('goPage', goPage);
set('renderNotifications', renderNotifications);
set('renderDashboard', renderDashboard);
export { _closeParentModals, _reopenParentModal, uid, openModal, renderStoreUI, applyRoleUI, renderDashboard, buildInvoiceHTML, renderAnalytics, renderAnalyticsCards, renderPeakHour, renderRecords, renderAuditsPage, renderWriteOffsTable, renderAuditsArchive, showCustomModal, updateAutoBackupUI, renderNotifications, applyUIVisibility, applyUIPosMode, getUIProfiles, setUIProfiles, renderSavedUIProfiles, renderPosLayoutEditor, refreshAll, showApp, goPage, menuToggle, sidebar, overlay, updatePosClock, showPosView, renderPosCatBrowser, toggleFavPos, switchPosTab, renderPosCatList, openPosCategories, openPosFavorites, renderPosSideHistory, initApp, setUIPosMode, openUISettings, toggleUIVisibility, setUIProfile, setUIScale, setUICardSize, setUICols, setUIButtonSize, saveUIProfile, loadUIProfile, deleteUIProfile, getPosLayout, setPosLayout, resetPosLayout, applyPosLayout, onPosLayoutDragStart, onPosLayoutDragOver, onPosLayoutDrop, onPosLayoutDragEnd, activeRightPanel, setRightPanel };
